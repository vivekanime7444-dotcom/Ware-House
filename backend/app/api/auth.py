from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AuditLog
from app.schemas import LoginRequest, Token, UserOut
from app.auth import verify_password, create_access_token, get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    # Audit log
    audit = AuditLog(
        action="LOGIN",
        entity="User",
        entity_id=user.id,
        user_id=user.id,
        user_name=user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"User {user.username} logged in successfully."
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
