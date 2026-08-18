from sqlalchemy import Column, String, Float, JSON
from app.database import Base

class MaterialModel(Base):
    __tablename__ = "materials"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    density = Column(Float, nullable=False) # kg/m^3
    friction = Column(Float, nullable=False) # 0 to 1
    restitution = Column(Float, nullable=False) # 0 to 1
    metadata_info = Column(JSON, default={})
