from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class MaterialBase(BaseModel):
    name: str = Field(..., description="Material display name")
    density: float = Field(..., gt=0, description="Density in kg/m^3")
    friction: float = Field(..., ge=0, le=1, description="Friction coefficient")
    restitution: float = Field(..., ge=0, le=1, description="Restitution (bounciness)")
    metadata_info: Optional[Dict[str, Any]] = Field(default_factory=dict)

class MaterialCreate(MaterialBase):
    id: str

class MaterialResponse(MaterialBase):
    id: str

    class Config:
        from_attributes = True
