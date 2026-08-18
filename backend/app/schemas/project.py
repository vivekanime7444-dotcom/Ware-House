from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = ""
    scene_data: Dict[str, Any] = Field(default_factory=dict)

class ProjectCreate(ProjectBase):
    id: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scene_data: Optional[Dict[str, Any]] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
