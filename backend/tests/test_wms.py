import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.seed import seed_database


SQLALCHEMY_DATABASE_URL = "sqlite:///./test_wms.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield

client = TestClient(app)

def get_auth_token(username="admin", password="admin123"):
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]

def test_1_login_and_auth():
    # Invalid login
    res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert res.status_code == 401

    # Valid login
    token = get_auth_token()
    assert token is not None

    # Get current user
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "admin"

def test_2_products_and_stock_detection():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/products", headers=headers)
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0

    # Low stock test
    res_low = client.get("/api/products/low-stock", headers=headers)
    assert res_low.status_code == 200
    low_products = res_low.json()
    for p in low_products:
        assert p["status"] == "LOW STOCK"

    # Out of stock test
    res_out = client.get("/api/products/out-of-stock", headers=headers)
    assert res_out.status_code == 200
    out_products = res_out.json()
    for p in out_products:
        assert p["status"] == "OUT OF STOCK"

def test_3_restocking_flow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Find USB-C Cable (product ELE-101 with initial stock 5, low stock status)
    res = client.get("/api/products?search=USB-C Cable", headers=headers)
    products = res.json()
    usb_cable = products[0]
    initial_qty = usb_cable["quantity"]
    assert usb_cable["status"] == "LOW STOCK"

    # Restock +20
    restock_res = client.post("/api/restocks", json={
        "product_id": usb_cable["id"],
        "quantity_added": 20
    }, headers=headers)
    assert restock_res.status_code == 200
    data = restock_res.json()
    assert data["new_quantity"] == initial_qty + 20

    # Verify status changed to IN STOCK
    res_after = client.get(f"/api/products/{usb_cable['id']}", headers=headers)
    p_after = res_after.json()
    assert p_after["quantity"] == initial_qty + 20
    assert p_after["status"] == "IN STOCK"

def test_4_order_placement_and_reservation():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Find Wireless Mouse (stock 35)
    res = client.get("/api/products?search=Wireless Ergonomic Mouse", headers=headers)
    p = res.json()[0]
    avail_before = p["available_quantity"]

    # Place Order for 5 units
    order_res = client.post("/api/orders", json={
        "items": [{"product_id": p["id"], "quantity": 5}]
    }, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["status"] == "PENDING"

    # Verify reserved_quantity increased and available_quantity dropped by 5
    p_after = client.get(f"/api/products/{p['id']}", headers=headers).json()
    assert p_after["available_quantity"] == avail_before - 5
    assert p_after["reserved_quantity"] == 5

def test_5_order_prioritization_and_acceptance():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get orders list
    res = client.get("/api/orders", headers=headers)
    assert res.status_code == 200
    orders = res.json()
    assert len(orders) > 0

    # Test accepting an order
    pending_order = next((o for o in orders if o["status"] == "PENDING"), None)
    if pending_order:
        acc_res = client.post(f"/api/orders/{pending_order['id']}/accept", headers=headers)
        assert acc_res.status_code == 200
        assert acc_res.json()["status"] == "ACCEPTED"

def test_6_order_verification_damage_replacement_shipment():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create fresh order for HDMI Cable (stock 4)
    p = client.get("/api/products?search=HDMI Cable", headers=headers).json()[0]

    order_res = client.post("/api/orders", json={
        "items": [{"product_id": p["id"], "quantity": 2}]
    }, headers=headers)
    order_id = order_res.json()["id"]

    # Accept order
    client.post(f"/api/orders/{order_id}/accept", headers=headers)

    # Test Invalid Verification (Good + Damaged + Missing != Expected)
    invalid_verif = client.post(f"/api/tracking/{order_id}/verify", json={
        "items": [{
            "product_id": p["id"],
            "good_quantity": 1,
            "damaged_quantity": 2,
            "missing_quantity": 2
        }]
    }, headers=headers)
    assert invalid_verif.status_code == 400

    # Test Valid Verification (1 Good, 1 Damaged, 0 Missing = 2 Expected)
    valid_verif = client.post(f"/api/tracking/{order_id}/verify", json={
        "items": [{
            "product_id": p["id"],
            "good_quantity": 1,
            "damaged_quantity": 1,
            "missing_quantity": 0
        }]
    }, headers=headers)
    assert valid_verif.status_code == 200

    # Replace 1 damaged product
    rep_res = client.post(f"/api/tracking/{order_id}/replace", json={
        "product_id": p["id"],
        "replacement_quantity": 1
    }, headers=headers)
    assert rep_res.status_code == 200

    # Ship Order
    ship_res = client.post(f"/api/tracking/{order_id}/ship", headers=headers)
    assert ship_res.status_code == 200
    assert ship_res.json()["status"] == "SHIPPED"

def test_7_analytics_and_damaged_missing():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res_dash = client.get("/api/analytics/dashboard", headers=headers)
    assert res_dash.status_code == 200
    dash = res_dash.json()
    assert dash["total_products"] > 0

    res_charts = client.get("/api/analytics/charts", headers=headers)
    assert res_charts.status_code == 200
    charts = res_charts.json()
    assert "products_by_category" in charts
    assert "inventory_status" in charts
    assert "orders_over_time" in charts

    res_dm = client.get("/api/damaged-missing", headers=headers)
    assert res_dm.status_code == 200
    assert "summary" in res_dm.json()

def test_8_security_and_rbac_enforcement():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Negative quantity restock attempt must fail
    res_neg_restock = client.post("/api/restocks", json={
        "product_id": 1,
        "quantity_added": -10
    }, headers=headers)
    assert res_neg_restock.status_code in [400, 422]

    # 2. Overselling protection: requesting 99999 units must be blocked
    res_oversell = client.post("/api/orders", json={
        "items": [{"product_id": 1, "quantity": 99999}]
    }, headers=headers)
    assert res_oversell.status_code == 400
    assert "Insufficient available stock" in res_oversell.json()["detail"]

    # 3. Missing auth token must return 401
    res_no_auth = client.post("/api/products", json={
        "product_code": "SEC-001",
        "name": "Unauthorized Product",
        "category_id": 1,
        "quantity": 10,
        "low_stock_threshold": 5
    })
    assert res_no_auth.status_code == 401

