from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog
from app.schemas import AuditLogOut

router = APIRouter(prefix="/api/activity", tags=["Audit Activity"])

@router.get("", response_model=List[AuditLogOut])
def get_activity_log(limit: int = 25, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [AuditLogOut.model_validate(l) for l in logs]
