from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DamageMissingRecord
from app.schemas import DamageMissingRecordOut

router = APIRouter(prefix="/api/damaged-missing", tags=["Damaged & Missing"])

@router.get("", response_model=Dict[str, Any])
def get_damaged_missing_records(db: Session = Depends(get_db)):
    records = db.query(DamageMissingRecord).order_by(DamageMissingRecord.created_at.desc()).all()
    
    formatted_records = []
    total_damaged = 0
    total_missing = 0

    for r in records:
        total_damaged += r.damaged_quantity
        total_missing += r.missing_quantity

        product = r.product
        order = r.order

        formatted_records.append(DamageMissingRecordOut(
            id=r.id,
            order_id=r.order_id,
            order_number=order.order_number if order else "N/A",
            product_id=r.product_id,
            product_name=product.name if product else "Unknown Product",
            product_code=product.product_code if product else "N/A",
            product_image=product.image_url if product else None,
            category_name=product.category.name if (product and product.category) else "N/A",
            damaged_quantity=r.damaged_quantity,
            missing_quantity=r.missing_quantity,
            status=r.status,
            created_at=r.created_at
        ))

    return {
        "summary": {
            "total_damaged": total_damaged,
            "total_missing": total_missing,
            "total_affected": total_damaged + total_missing,
            "record_count": len(records)
        },
        "records": formatted_records
    }
