import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderItem, Product, User, AuditLog
from app.schemas import OrderCreate, OrderOut, OrderItemOut
from app.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def calculate_order_priority(order: Order) -> tuple[float, str]:
    if not order.items:
        return 1.0, "High Priority (100% Fulfillable)"

    total_requested = 0
    total_fulfillable = 0

    for item in order.items:
        product = item.product
        if not product:
            continue
        req = item.quantity
        total_requested += req
        # Available stock if this order wasn't reserving it, plus what's currently available
        avail = max(0, product.quantity - product.reserved_quantity)
        # If order is pending/accepted, its own reserved quantity can fulfill it
        if order.status in ["PENDING", "ACCEPTED", "PROCESSING"]:
            avail += min(req, product.reserved_quantity)
        fulfillable = min(req, avail)
        total_fulfillable += fulfillable

    if total_requested <= 0:
        return 1.0, "High Priority (100% Fulfillable)"

    ratio = min(1.0, total_fulfillable / total_requested)
    
    if ratio >= 1.0:
        label = "High Priority (100% Fulfillable)"
    elif ratio >= 0.5:
        label = f"Medium Priority ({round(ratio * 100, 1)}% Fulfillable)"
    else:
        label = f"Low Priority ({round(ratio * 100, 1)}% Fulfillable)"

    return ratio, label

def format_order_out(order: Order) -> OrderOut:
    items_out = []
    for item in order.items:
        product = item.product
        items_out.append(OrderItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=product.name if product else "Unknown",
            product_code=product.product_code if product else "N/A",
            product_image=product.image_url if product else None,
            quantity=item.quantity,
            unit_price=item.unit_price,
            current_available=product.available_quantity if product else 0
        ))

    ratio, label = calculate_order_priority(order)

    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        user_name=order.user.username if order.user else "Customer",
        status=order.status,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items_out,
        fulfillment_ratio=ratio,
        priority_label=label
    )

@router.post("", response_model=OrderOut)
def place_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    try:
        # Atomic database transaction
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        new_order = Order(
            order_number=order_number,
            user_id=current_user.id,
            status="PENDING",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_order)
        db.flush()

        for item in payload.items:
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")

            # Check stock reservation rules
            if product.available_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient available stock for '{product.name}'. Available: {product.available_quantity}, Requested: {item.quantity}"
                )

            # Reserve stock
            product.reserved_quantity += item.quantity
            product.updated_at = datetime.now(timezone.utc)

            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=0.0
            )
            db.add(order_item)

        audit = AuditLog(
            action="PLACE_ORDER",
            entity="Order",
            entity_id=new_order.id,
            user_id=current_user.id,
            user_name=current_user.username,
            timestamp=datetime.now(timezone.utc),
            details=f"Order #{new_order.order_number} placed with {len(payload.items)} item types."
        )
        db.add(audit)

        db.commit()
        db.refresh(new_order)

        return format_order_out(new_order)

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")

@router.get("", response_model=List[OrderOut])
def get_orders(
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Order)

    if status_filter and status_filter != "ALL":
        query = query.filter(Order.status == status_filter)

    if search:
        query = query.filter(Order.order_number.ilike(f"%{search.strip()}%"))

    orders = query.all()
    formatted = [format_order_out(o) for o in orders]

    # Order Prioritization logic:
    # Sort by fulfillment ratio DESC, then creation time ASC, then Order ID ASC
    formatted.sort(key=lambda x: (-x.fulfillment_ratio, x.created_at, x.id))
    return formatted

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order_out(order)

@router.post("/{order_id}/accept", response_model=OrderOut)
def accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Cannot accept order in '{order.status}' status")

    order.status = "ACCEPTED"
    order.updated_at = datetime.now(timezone.utc)

    audit = AuditLog(
        action="ACCEPT_ORDER",
        entity="Order",
        entity_id=order.id,
        user_id=current_user.id,
        user_name=current_user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"Order #{order.order_number} accepted and moved to tracking/verification queue."
    )
    db.add(audit)

    db.commit()
    db.refresh(order)
    return format_order_out(order)

@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in ["SHIPPED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order in '{order.status}' status")

    # Unreserve products
    for item in order.items:
        if item.product:
            item.product.reserved_quantity = max(0, item.product.reserved_quantity - item.quantity)
            item.product.updated_at = datetime.now(timezone.utc)

    order.status = "CANCELLED"
    order.updated_at = datetime.now(timezone.utc)

    audit = AuditLog(
        action="CANCEL_ORDER",
        entity="Order",
        entity_id=order.id,
        user_id=current_user.id,
        user_name=current_user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"Order #{order.order_number} cancelled and reserved stock returned to available inventory."
    )
    db.add(audit)

    db.commit()
    db.refresh(order)
    return format_order_out(order)
