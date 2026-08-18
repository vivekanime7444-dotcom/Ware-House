from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import (
    User, Category, Product, Order, OrderItem, RestockTransaction,
    OrderVerification, DamageMissingRecord, Shipment, AuditLog
)
from app.auth import hash_password

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first() is not None:
        return

    now = datetime.now(timezone.utc)

    # 1. Seed Users
    admin_user = User(
        username="admin",
        email="admin@stockflow.wms",
        full_name="System Administrator",
        role="admin",
        hashed_password=hash_password("admin123"),
        created_at=now - timedelta(days=30)
    )
    wh_user = User(
        username="warehouse",
        email="warehouse@stockflow.wms",
        full_name="Warehouse Operator",
        role="warehouse",
        hashed_password=hash_password("warehouse123"),
        created_at=now - timedelta(days=30)
    )
    db.add(admin_user)
    db.add(wh_user)
    db.flush()

    # 2. Seed Categories
    categories_data = [
        {"name": "Groceries", "desc": "Fresh produce, packaged foods, and beverages", "img": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"},
        {"name": "Electronics", "desc": "Computer accessories, cables, and gadgets", "img": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80"},
        {"name": "Furniture", "desc": "Office chairs, desks, lamps, and storage", "img": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80"},
        {"name": "Toys", "desc": "Children toys, puzzles, and educational sets", "img": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=400&q=80"},
        {"name": "Fashion", "desc": "Apparel, footwear, and accessories", "img": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80"},
        {"name": "Home Appliances", "desc": "Kitchen items, climate control, and home tech", "img": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"},
        {"name": "Mobiles", "desc": "Smartphones, chargers, and mobile accessories", "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"},
        {"name": "Sports", "desc": "Fitness gear, outdoor equipment, and activewear", "img": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80"}
    ]

    cat_map = {}
    for c in categories_data:
        cat = Category(name=c["name"], description=c["desc"], image_url=c["img"])
        db.add(cat)
        db.flush()
        cat_map[c["name"]] = cat.id

    # 3. Seed Products
    products_data = [
        # Electronics
        {"code": "ELE-101", "name": "USB-C Cable 2m", "desc": "High-speed fast charging USB-C nylon braided cable", "cat": "Electronics", "img": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80", "qty": 5, "res": 0, "thresh": 10},
        {"code": "ELE-102", "name": "Wireless Ergonomic Mouse", "desc": "2.4GHz silent optical wireless mouse", "cat": "Electronics", "img": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80", "qty": 35, "res": 0, "thresh": 10},
        {"code": "ELE-103", "name": "Mechanical RGB Keyboard", "desc": "Tactile switch mechanical gaming keyboard", "cat": "Electronics", "img": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80", "qty": 18, "res": 0, "thresh": 10},
        {"code": "ELE-104", "name": "4K Ultra HD HDMI Cable", "desc": "Ultra high speed 4K 60Hz HDMI 2.0 cable", "cat": "Electronics", "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80", "qty": 4, "res": 0, "thresh": 10},
        {"code": "ELE-105", "name": "20000mAh Power Bank", "desc": "Dual output fast charging portable power bank", "cat": "Electronics", "img": "https://images.unsplash.com/photo-1609592424074-8c8d8b4c0556?auto=format&fit=crop&w=400&q=80", "qty": 0, "res": 0, "thresh": 10},

        # Mobiles
        {"code": "MOB-201", "name": "Smartphone Pro Max A", "desc": "6.7 inch OLED screen, 256GB storage, triple camera", "cat": "Mobiles", "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80", "qty": 25, "res": 0, "thresh": 10},
        {"code": "MOB-202", "name": "Smartphone Lite B", "desc": "6.1 inch display, 128GB, long battery life", "cat": "Mobiles", "img": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80", "qty": 8, "res": 0, "thresh": 10},
        {"code": "MOB-203", "name": "Smartphone Ultra C", "desc": "Flagship 5G phone with stylus support", "cat": "Mobiles", "img": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80", "qty": 0, "res": 0, "thresh": 10},
        {"code": "MOB-204", "name": "65W GaN Fast Wall Charger", "desc": "Compact dual USB-C multi-port fast charger", "cat": "Mobiles", "img": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80", "qty": 15, "res": 0, "thresh": 10},

        # Groceries
        {"code": "GRO-301", "name": "Organic Arabica Coffee Beans 1kg", "desc": "100% premium roasted whole bean coffee", "cat": "Groceries", "img": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80", "qty": 45, "res": 0, "thresh": 10},
        {"code": "GRO-302", "name": "Unsweetened Almond Milk 1L", "desc": "Plant-based dairy alternative milk", "cat": "Groceries", "img": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", "qty": 12, "res": 0, "thresh": 10},
        {"code": "GRO-303", "name": "70% Dark Chocolate Bar 100g", "desc": "Organic single-origin dark cocoa bar", "cat": "Groceries", "img": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80", "qty": 6, "res": 0, "thresh": 10},
        {"code": "GRO-304", "name": "Organic Green Tea Box 50 Bags", "desc": "Pure Japanese green tea tea bags", "cat": "Groceries", "img": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80", "qty": 0, "res": 0, "thresh": 10},

        # Furniture
        {"code": "FUR-401", "name": "Ergonomic Mesh Office Chair", "desc": "Adjustable lumbar support high-back office chair", "cat": "Furniture", "img": "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=400&q=80", "qty": 14, "res": 0, "thresh": 10},
        {"code": "FUR-402", "name": "Motorized Electric Standing Desk", "desc": "Dual motor height-adjustable bamboo desk", "cat": "Furniture", "img": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80", "qty": 3, "res": 0, "thresh": 10},
        {"code": "FUR-403", "name": "Dimmable LED Desk Lamp", "desc": "Touch control desk light with wireless charger", "cat": "Furniture", "img": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80", "qty": 22, "res": 0, "thresh": 10},

        # Toys
        {"code": "TOY-501", "name": "High-Speed Remote Control Car", "desc": "1:16 scale off-road 4WD RC monster truck", "cat": "Toys", "img": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80", "qty": 16, "res": 0, "thresh": 10},
        {"code": "TOY-502", "name": "3D Wooden Puzzle Set", "desc": "Brain teaser mechanical model building kit", "cat": "Toys", "img": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=80", "qty": 7, "res": 0, "thresh": 10},
        {"code": "TOY-503", "name": "Architectural Building Block Set", "desc": "500-piece creative building brick set", "cat": "Toys", "img": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80", "qty": 30, "res": 0, "thresh": 10},

        # Fashion
        {"code": "FAS-601", "name": "Classic Vintage Denim Jacket", "desc": "100% cotton premium washed denim jacket", "cat": "Fashion", "img": "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=400&q=80", "qty": 20, "res": 0, "thresh": 10},
        {"code": "FAS-602", "name": "Organic Cotton Crewneck T-Shirt", "desc": "Breathable soft jersey cotton everyday t-shirt", "cat": "Fashion", "img": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80", "qty": 50, "res": 0, "thresh": 10},
        {"code": "FAS-603", "name": "Pro Cushion Running Sneakers", "desc": "Lightweight mesh athletic road running shoes", "cat": "Fashion", "img": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80", "qty": 2, "res": 0, "thresh": 10},

        # Home Appliances
        {"code": "HAP-701", "name": "HEPA Air Purifier Pro", "desc": "Quiet air cleaner with true HEPA filter for rooms up to 500 sq ft", "cat": "Home Appliances", "img": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80", "qty": 8, "res": 0, "thresh": 10},
        {"code": "HAP-702", "name": "Compact Countertop Microwave 20L", "desc": "Digital stainless steel microwave oven", "cat": "Home Appliances", "img": "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80", "qty": 11, "res": 0, "thresh": 10},
        {"code": "HAP-703", "name": "Smart Temperature Control Kettle", "desc": "1.7L stainless steel fast boiling kettle", "cat": "Home Appliances", "img": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?auto=format&fit=crop&w=400&q=80", "qty": 0, "res": 0, "thresh": 10},

        # Sports
        {"code": "SPO-801", "name": "Non-Slip Yoga Mat 6mm", "desc": "Eco-friendly TPE alignment line fitness mat", "cat": "Sports", "img": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=400&q=80", "qty": 25, "res": 0, "thresh": 10},
        {"code": "SPO-802", "name": "Rubber Dumbbell Set 10kg Pair", "desc": "Anti-roll hexagonal rubber dumbbells", "cat": "Sports", "img": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80", "qty": 5, "res": 0, "thresh": 10},
        {"code": "SPO-803", "name": "Insulated Stainless Water Bottle 1L", "desc": "Double-wall vacuum insulated thermo flask", "cat": "Sports", "img": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80", "qty": 40, "res": 0, "thresh": 10}
    ]

    prod_map = {}
    for p in products_data:
        prod = Product(
            product_code=p["code"],
            name=p["name"],
            description=p["desc"],
            category_id=cat_map[p["cat"]],
            image_url=p["img"],
            quantity=p["qty"],
            reserved_quantity=p["res"],
            low_stock_threshold=p["thresh"],
            created_at=now - timedelta(days=15)
        )
        db.add(prod)
        db.flush()
        prod_map[p["code"]] = prod

    # 4. Seed Initial Restock History
    usb_prod = prod_map["ELE-101"]
    mouse_prod = prod_map["ELE-102"]
    
    rt1 = RestockTransaction(
        product_id=usb_prod.id,
        quantity_added=5,
        previous_quantity=0,
        new_quantity=5,
        user_id=admin_user.id,
        created_at=now - timedelta(days=5)
    )
    rt2 = RestockTransaction(
        product_id=mouse_prod.id,
        quantity_added=20,
        previous_quantity=15,
        new_quantity=35,
        user_id=wh_user.id,
        created_at=now - timedelta(days=2)
    )
    db.add(rt1)
    db.add(rt2)

    # 5. Seed Example Orders
    # Order 1001 (PENDING, reserves 3 USB cables)
    usb_prod.reserved_quantity = 3

    ord1 = Order(
        order_number="ORD-1001",
        user_id=wh_user.id,
        status="PENDING",
        created_at=now - timedelta(hours=3),
        updated_at=now - timedelta(hours=3)
    )
    db.add(ord1)
    db.flush()
    item1 = OrderItem(order_id=ord1.id, product_id=usb_prod.id, quantity=3, unit_price=12.99)
    db.add(item1)

    # Order 1002 (ACCEPTED)
    kb_prod = prod_map["ELE-103"]
    kb_prod.reserved_quantity = 4

    ord2 = Order(
        order_number="ORD-1002",
        user_id=wh_user.id,
        status="ACCEPTED",
        created_at=now - timedelta(hours=6),
        updated_at=now - timedelta(hours=1)
    )
    db.add(ord2)
    db.flush()
    item2 = OrderItem(order_id=ord2.id, product_id=kb_prod.id, quantity=4, unit_price=79.99)
    db.add(item2)

    # Order 1003 (PROCESSING / VERIFIED with damage)
    chair_prod = prod_map["FUR-401"]

    ord3 = Order(
        order_number="ORD-1003",
        user_id=wh_user.id,
        status="PROCESSING",
        created_at=now - timedelta(days=1),
        updated_at=now - timedelta(hours=4)
    )
    db.add(ord3)
    db.flush()
    item3 = OrderItem(order_id=ord3.id, product_id=chair_prod.id, quantity=5, unit_price=189.99)
    db.add(item3)

    verif3 = OrderVerification(
        order_id=ord3.id,
        product_id=chair_prod.id,
        expected_quantity=5,
        good_quantity=3,
        damaged_quantity=1,
        missing_quantity=1,
        is_verified=True,
        verified_at=now - timedelta(hours=4),
        verified_by_id=admin_user.id
    )
    db.add(verif3)

    dm3 = DamageMissingRecord(
        order_id=ord3.id,
        product_id=chair_prod.id,
        damaged_quantity=1,
        missing_quantity=1,
        status="REPORTED",
        created_at=now - timedelta(hours=4)
    )
    db.add(dm3)

    # Order 1004 (SHIPPED)
    tshirt_prod = prod_map["FAS-602"]

    ord4 = Order(
        order_number="ORD-1004",
        user_id=wh_user.id,
        status="SHIPPED",
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(days=1)
    )
    db.add(ord4)
    db.flush()
    item4 = OrderItem(order_id=ord4.id, product_id=tshirt_prod.id, quantity=10, unit_price=19.99)
    db.add(item4)

    ship4 = Shipment(
        order_id=ord4.id,
        shipped_at=now - timedelta(days=1),
        shipped_by_id=wh_user.id,
        tracking_code="TRACK-ORD-1004"
    )
    db.add(ship4)

    # 6. Audit Logs
    logs = [
        AuditLog(action="SYSTEM_INIT", entity="System", entity_id=1, user_id=admin_user.id, user_name="admin", timestamp=now - timedelta(days=15), details="StockFlow WMS Database Initialized."),
        AuditLog(action="RESTOCK", entity="Product", entity_id=usb_prod.id, user_id=admin_user.id, user_name="admin", timestamp=now - timedelta(days=5), details="Restocked USB-C Cable +5 units."),
        AuditLog(action="PLACE_ORDER", entity="Order", entity_id=ord1.id, user_id=wh_user.id, user_name="warehouse", timestamp=now - timedelta(hours=3), details="Order #ORD-1001 placed for 3x USB-C Cable."),
        AuditLog(action="ACCEPT_ORDER", entity="Order", entity_id=ord2.id, user_id=admin_user.id, user_name="admin", timestamp=now - timedelta(hours=1), details="Order #ORD-1002 accepted for verification."),
        AuditLog(action="VERIFY_ORDER", entity="Order", entity_id=ord3.id, user_id=admin_user.id, user_name="admin", timestamp=now - timedelta(hours=4), details="Order #ORD-1003 verified (3 Good, 1 Damaged, 1 Missing)."),
        AuditLog(action="SHIP_ORDER", entity="Order", entity_id=ord4.id, user_id=wh_user.id, user_name="warehouse", timestamp=now - timedelta(days=1), details="Order #ORD-1004 shipped successfully.")
    ]
    for l in logs:
        db.add(l)

    db.commit()
