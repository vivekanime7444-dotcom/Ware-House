from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.material import MaterialResponse

router = APIRouter(prefix="/api/materials", tags=["Materials"])

DEFAULT_MATERIALS = [
    {
        "id": "steel",
        "name": "Steel",
        "density": 7850.0,
        "friction": 0.5,
        "restitution": 0.4,
        "metadata_info": {"category": "Metal", "tensileStrength": "400-550 MPa", "note": "High density structural metal."}
    },
    {
        "id": "aluminium",
        "name": "Aluminium",
        "density": 2700.0,
        "friction": 0.45,
        "restitution": 0.5,
        "metadata_info": {"category": "Metal", "note": "Lightweight metal widely used in aerospace & prototyping."}
    },
    {
        "id": "copper",
        "name": "Copper",
        "density": 8960.0,
        "friction": 0.55,
        "restitution": 0.35,
        "metadata_info": {"category": "Metal", "note": "Dense conductive metal."}
    },
    {
        "id": "rubber",
        "name": "Rubber",
        "density": 1100.0,
        "friction": 0.9,
        "restitution": 0.85,
        "metadata_info": {"category": "Elastomer", "note": "High friction and elastic recovery."}
    },
    {
        "id": "wood",
        "name": "Wood (Oak)",
        "density": 750.0,
        "friction": 0.4,
        "restitution": 0.3,
        "metadata_info": {"category": "Organic", "note": "Approximate density; varies with moisture and species."}
    },
    {
        "id": "ice",
        "name": "Ice",
        "density": 917.0,
        "friction": 0.05,
        "restitution": 0.1,
        "metadata_info": {"category": "Solid", "note": "Low friction sliding surface."}
    }
]

@router.get("", response_model=List[MaterialResponse])
def get_materials(db: Session = Depends(get_db)):
    # Return default built-in material library
    return DEFAULT_MATERIALS
