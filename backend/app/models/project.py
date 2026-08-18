from sqlalchemy import Column, String, DateTime, Text, JSON
from datetime import datetime
from app.database import Base

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    scene_data = Column(JSON, nullable=False)
