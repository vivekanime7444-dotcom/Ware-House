from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Product, Category, Order, OrderItem, RestockTransaction,
    DamageMissingRecord, AuditLog
)
from app.schemas import DashboardSummary

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Dashboard"])

@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    total_products = len(products)
    total_units = sum(p.quantity for p in products)
    low_stock_items = sum(1 for p in products if p.status == "LOW STOCK")
    out_of_stock_items = sum(1 for p in products if p.status == "OUT OF STOCK")

    orders = db.query(Order).all()
    pending_orders = sum(1 for o in orders if o.status == "PENDING")
    ready_orders = sum(1 for o in orders if o.status in ["ACCEPTED", "PROCESSING"])
    shipped_orders = sum(1 for o in orders if o.status == "SHIPPED")

    dm_records = db.query(DamageMissingRecord).all()
    damaged_items = sum(r.damaged_quantity for r in dm_records)
    missing_items = sum(r.missing_quantity for r in dm_records)

    return DashboardSummary(
        total_products=total_products,
        total_units=total_units,
        low_stock_items=low_stock_items,
        out_of_stock_items=out_of_stock_items,
        pending_orders=pending_orders,
        ready_orders=ready_orders,
        shipped_orders=shipped_orders,
        damaged_items=damaged_items,
        missing_items=missing_items
    )

@router.get("/charts")
def get_chart_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    # 1. Products by Category
    categories = db.query(Category).all()
    products_by_category = []
    for cat in categories:
        count = db.query(Product).filter(Product.category_id == cat.id).count()
        total_units = db.query(func.sum(Product.quantity)).filter(Product.category_id == cat.id).scalar() or 0
        products_by_category.append({
            "category": cat.name,
            "product_count": count,
            "total_units": total_units
        })

    # 2. Inventory Status Distribution
    products = db.query(Product).all()
    status_counts = {"IN STOCK": 0, "LOW STOCK": 0, "OUT OF STOCK": 0}
    for p in products:
        status_counts[p.status] = status_counts.get(p.status, 0) + 1

    inventory_status_data = [
        {"name": k, "value": v} for k, v in status_counts.items()
    ]

    # 3. Orders Over Time (Grouped by Date)
    orders_by_date = db.query(
        func.date(Order.created_at).label("date"),
        func.count(Order.id).label("count")
    ).group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at).asc()).all()

    orders_over_time = [
        {"date": str(r[0]), "orders": r[1]} for r in orders_by_date
    ]

    # 4. Most Ordered Products (Top 5)
    most_ordered_query = db.query(
        Product.name,
        func.sum(OrderItem.quantity).label("total_ordered")
    ).join(OrderItem, OrderItem.product_id == Product.id)\
     .group_by(Product.name)\
     .order_by(func.sum(OrderItem.quantity).desc())\
     .limit(5).all()

    most_ordered_products = [
        {"product": r[0], "ordered_quantity": r[1]} for r in most_ordered_query
    ]

    # 5. Damaged vs Missing by Category
    dm_by_cat = db.query(
        Category.name,
        func.sum(DamageMissingRecord.damaged_quantity).label("damaged"),
        func.sum(DamageMissingRecord.missing_quantity).label("missing")
    ).select_from(DamageMissingRecord)\
     .join(Product, DamageMissingRecord.product_id == Product.id)\
     .join(Category, Product.category_id == Category.id)\
     .group_by(Category.name).all()

    damaged_vs_missing = [
        {"category": r[0], "damaged": r[1] or 0, "missing": r[2] or 0} for r in dm_by_cat
    ]

    # 6. Restocking Activity over time
    restock_by_date = db.query(
        func.date(RestockTransaction.created_at).label("date"),
        func.sum(RestockTransaction.quantity_added).label("total_added")
    ).group_by(func.date(RestockTransaction.created_at))\
     .order_by(func.date(RestockTransaction.created_at).asc()).all()

    restocking_activity = [
        {"date": str(r[0]), "quantity_added": r[1] or 0} for r in restock_by_date
    ]

    # 7. Orders by Status
    orders_by_status_query = db.query(
        Order.status,
        func.count(Order.id).label("count")
    ).group_by(Order.status).all()

    orders_by_status = [
        {"status": r[0], "count": r[1]} for r in orders_by_status_query
    ]

    return {
        "products_by_category": products_by_category,
        "inventory_status": inventory_status_data,
        "orders_over_time": orders_over_time,
        "most_ordered_products": most_ordered_products,
        "damaged_vs_missing": damaged_vs_missing,
        "restocking_activity": restocking_activity,
        "orders_by_status": orders_by_status
    }
