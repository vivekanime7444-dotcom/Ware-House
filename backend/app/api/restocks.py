from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, RestockTransaction, User, AuditLog
from app.schemas import RestockCreate, RestockOut
from app.auth import get_current_user, require_roles
from datetime import datetime, timezone


router = APIRouter(prefix="/api/restocks", tags=["Restocking"])

@router.post("", response_model=RestockOut)
def restock_product(
    item: RestockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "manager", "staff"]))
):

    if item.quantity_added <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restock quantity must be greater than zero"
        )

    # Atomic transaction
    try:
        db.begin_nested() if db.in_transaction() else None

        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        prev_qty = product.quantity
        new_qty = prev_qty + item.quantity_added

        # Update inventory quantity
        product.quantity = new_qty
        product.updated_at = datetime.now(timezone.utc)

        # Create restock transaction record
        tx = RestockTransaction(
            product_id=product.id,
            quantity_added=item.quantity_added,
            previous_quantity=prev_qty,
            new_quantity=new_qty,
            user_id=current_user.id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(tx)

        # Record audit log
        audit = AuditLog(
            action="RESTOCK",
            entity="Product",
            entity_id=product.id,
            user_id=current_user.id,
            user_name=current_user.username,
            timestamp=datetime.now(timezone.utc),
            details=f"Restocked {product.name} ({product.product_code}) +{item.quantity_added} units. New stock: {new_qty}."
        )
        db.add(audit)

        db.commit()
        db.refresh(tx)
        db.refresh(product)

        return RestockOut(
            id=tx.id,
            product_id=product.id,
            product_name=product.name,
            product_code=product.product_code,
            quantity_added=tx.quantity_added,
            previous_quantity=tx.previous_quantity,
            new_quantity=tx.new_quantity,
            user_name=current_user.username,
            created_at=tx.created_at
        )
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Restocking transaction failed: {str(e)}")

@router.get("", response_model=List[RestockOut])
def get_restock_history(db: Session = Depends(get_db)):
    txs = db.query(RestockTransaction).order_by(RestockTransaction.created_at.desc()).limit(100).all()
    results = []
    for tx in txs:
        product_name = tx.product.name if tx.product else "Unknown"
        product_code = tx.product.product_code if tx.product else "N/A"
        user_name = tx.user.username if tx.user else "System"
        results.append(RestockOut(
            id=tx.id,
            product_id=tx.product_id,
            product_name=product_name,
            product_code=product_code,
            quantity_added=tx.quantity_added,
            previous_quantity=tx.previous_quantity,
            new_quantity=tx.new_quantity,
            user_name=user_name,
            created_at=tx.created_at
        ))
    return results
