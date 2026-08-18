from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Order, OrderItem, Product, OrderVerification,
    DamageMissingRecord, ReplacementTransaction, Shipment, User, AuditLog
)
from app.schemas import (
    OrderOut, OrderVerificationRequest, ReplacementRequest,
    OrderVerificationSummary, ItemVerificationOut
)
from app.auth import get_current_user, require_roles
from app.api.orders import format_order_out
from datetime import datetime, timezone


router = APIRouter(prefix="/api/tracking", tags=["Order Tracking & Verification"])

@router.get("/accepted", response_model=List[OrderOut])
def get_accepted_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.status.in_(["ACCEPTED", "PROCESSING"])).order_by(Order.created_at.desc()).all()
    return [format_order_out(o) for o in orders]

@router.get("/{order_id}/summary", response_model=OrderVerificationSummary)
def get_verification_summary(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    verifications = db.query(OrderVerification).filter(OrderVerification.order_id == order_id).all()
    
    total_damaged = sum(v.damaged_quantity for v in verifications)
    total_missing = sum(v.missing_quantity for v in verifications)
    
    # Check replacements done
    replacements = db.query(ReplacementTransaction).filter(ReplacementTransaction.order_id == order_id).all()
    total_replaced = sum(r.quantity_replaced for r in replacements)

    replacement_needed = max(0, (total_damaged + total_missing) - total_replaced)
    can_ship = (len(verifications) == len(order.items)) and (replacement_needed == 0)

    verif_outs = []
    for v in verifications:
        product = v.product
        verif_outs.append(ItemVerificationOut(
            id=v.id,
            order_id=v.order_id,
            product_id=v.product_id,
            product_name=product.name if product else "Unknown",
            product_image=product.image_url if product else None,
            expected_quantity=v.expected_quantity,
            good_quantity=v.good_quantity,
            damaged_quantity=v.damaged_quantity,
            missing_quantity=v.missing_quantity,
            is_verified=v.is_verified,
            verified_at=v.verified_at
        ))

    return OrderVerificationSummary(
        order_id=order.id,
        order_number=order.order_number,
        status=order.status,
        verifications=verif_outs,
        total_damaged=total_damaged,
        total_missing=total_missing,
        replacement_needed=replacement_needed,
        can_ship=can_ship
    )

@router.post("/{order_id}/verify")
def verify_order_items(
    order_id: int,
    payload: OrderVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "manager", "operator", "staff"]))
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in ["ACCEPTED", "PROCESSING"]:
        raise HTTPException(status_code=400, detail=f"Order cannot be verified in '{order.status}' status")

    try:
        db.begin_nested() if db.in_transaction() else None

        for item_input in payload.items:
            # Find item in order
            order_item = db.query(OrderItem).filter(
                OrderItem.order_id == order_id,
                OrderItem.product_id == item_input.product_id
            ).first()

            if not order_item:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product ID {item_input.product_id} is not part of Order #{order.order_number}"
                )

            expected = order_item.quantity
            good = item_input.good_quantity
            damaged = item_input.damaged_quantity
            missing = item_input.missing_quantity

            # Strict verification rule: good + damaged + missing == expected
            if good + damaged + missing != expected:
                product_name = order_item.product.name if order_item.product else f"ID {order_item.product_id}"
                raise HTTPException(
                    status_code=400,
                    detail=f"Validation failed for '{product_name}': Good ({good}) + Damaged ({damaged}) + Missing ({missing}) = {good+damaged+missing}, which does not match Expected Quantity ({expected})."
                )

            # Record or update verification
            existing_verif = db.query(OrderVerification).filter(
                OrderVerification.order_id == order_id,
                OrderVerification.product_id == item_input.product_id
            ).first()

            if existing_verif:
                existing_verif.good_quantity = good
                existing_verif.damaged_quantity = damaged
                existing_verif.missing_quantity = missing
                existing_verif.is_verified = True
                existing_verif.verified_at = datetime.now(timezone.utc)
                existing_verif.verified_by_id = current_user.id
            else:
                verif = OrderVerification(
                    order_id=order_id,
                    product_id=item_input.product_id,
                    expected_quantity=expected,
                    good_quantity=good,
                    damaged_quantity=damaged,
                    missing_quantity=missing,
                    is_verified=True,
                    verified_at=datetime.now(timezone.utc),
                    verified_by_id=current_user.id
                )
                db.add(verif)

            # Record DamageMissingRecord if damaged > 0 or missing > 0
            if damaged > 0 or missing > 0:
                dm = db.query(DamageMissingRecord).filter(
                    DamageMissingRecord.order_id == order_id,
                    DamageMissingRecord.product_id == item_input.product_id
                ).first()
                if dm:
                    dm.damaged_quantity = damaged
                    dm.missing_quantity = missing
                    dm.status = "REPORTED"
                else:
                    dm = DamageMissingRecord(
                        order_id=order_id,
                        product_id=item_input.product_id,
                        damaged_quantity=damaged,
                        missing_quantity=missing,
                        status="REPORTED",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(dm)

        order.status = "PROCESSING"
        order.updated_at = datetime.now(timezone.utc)

        audit = AuditLog(
            action="VERIFY_ORDER",
            entity="Order",
            entity_id=order.id,
            user_id=current_user.id,
            user_name=current_user.username,
            timestamp=datetime.now(timezone.utc),
            details=f"Order #{order.order_number} verified by {current_user.username}."
        )
        db.add(audit)

        db.commit()
        db.refresh(order)

        return {"message": "Verification recorded successfully", "order_id": order.id, "status": order.status}

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.post("/{order_id}/replace")
def replace_damaged_missing(
    order_id: int,
    payload: ReplacementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "manager"]))
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.replacement_quantity <= 0:
        raise HTTPException(status_code=400, detail="Replacement quantity must be positive")

    product = db.query(Product).filter(Product.id == payload.product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check inventory availability for replacement
    if product.available_quantity < payload.replacement_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient replacement stock for '{product.name}'. Available: {product.available_quantity}, Required: {payload.replacement_quantity}"
        )

    # Deduct replacement from physical inventory quantity
    product.quantity -= payload.replacement_quantity
    product.updated_at = datetime.now(timezone.utc)

    # Log replacement transaction
    rep = ReplacementTransaction(
        order_id=order_id,
        product_id=product.id,
        quantity_replaced=payload.replacement_quantity,
        user_id=current_user.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(rep)

    # Update or create damage record status
    dm = db.query(DamageMissingRecord).filter(
        DamageMissingRecord.order_id == order_id,
        DamageMissingRecord.product_id == product.id
    ).first()
    if dm:
        dm.status = "REPLACED"
    else:
        dm = DamageMissingRecord(
            order_id=order_id,
            product_id=product.id,
            damaged_quantity=payload.replacement_quantity,
            missing_quantity=0,
            status="REPLACED",
            created_at=datetime.now(timezone.utc)
        )
        db.add(dm)

    audit = AuditLog(
        action="REPLACE_STOCK",
        entity="Order",
        entity_id=order.id,
        user_id=current_user.id,
        user_name=current_user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"Issued {payload.replacement_quantity} replacement units of '{product.name}' for Order #{order.order_number}."
    )
    db.add(audit)


    db.commit()

    return {
        "message": f"Successfully replaced {payload.replacement_quantity} units of {product.name}",
        "remaining_available_stock": product.available_quantity
    }

@router.post("/{order_id}/ship", response_model=OrderOut)
def ship_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "manager", "operator"]))
):

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in ["SHIPPED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail=f"Order is already in '{order.status}' status")

    try:
        db.begin_nested() if db.in_transaction() else None

        # Ship order: Deduct shipped stock from total quantity, and release reserved stock
        for item in order.items:
            product = item.product
            if product:
                # Deduct physical stock
                product.quantity = max(0, product.quantity - item.quantity)
                # Unreserve
                product.reserved_quantity = max(0, product.reserved_quantity - item.quantity)
                product.updated_at = datetime.now(timezone.utc)

        order.status = "SHIPPED"
        order.updated_at = datetime.now(timezone.utc)

        # Create Shipment record
        shipment = Shipment(
            order_id=order.id,
            shipped_at=datetime.now(timezone.utc),
            shipped_by_id=current_user.id,
            tracking_code=f"TRACK-{order.order_number}"
        )
        db.add(shipment)

        audit = AuditLog(
            action="SHIP_ORDER",
            entity="Order",
            entity_id=order.id,
            user_id=current_user.id,
            user_name=current_user.username,
            timestamp=datetime.now(timezone.utc),
            details=f"Order #{order.order_number} shipped successfully."
        )
        db.add(audit)

        db.commit()
        db.refresh(order)

        return format_order_out(order)

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Shipment transaction failed: {str(e)}")
