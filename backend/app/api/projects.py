import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.project import ProjectModel
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(ProjectModel).order_by(ProjectModel.updated_at.desc()).all()

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    proj_id = project_in.id or str(uuid.uuid4())
    existing = db.query(ProjectModel).filter(ProjectModel.id == proj_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project with this ID already exists.")

    new_project = ProjectModel(
        id=proj_id,
        name=project_in.name,
        description=project_in.description or "",
        scene_data=project_in.scene_data or {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
    return proj

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, project_in: ProjectUpdate, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    if project_in.name is not None:
        proj.name = project_in.name
    if project_in.description is not None:
        proj.description = project_in.description
    if project_in.scene_data is not None:
        proj.scene_data = project_in.scene_data

    proj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(proj)
    return proj

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(proj)
    db.commit()
    return None

@router.post("/{project_id}/duplicate", response_model=ProjectResponse)
def duplicate_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    new_id = str(uuid.uuid4())
    dup_project = ProjectModel(
        id=new_id,
        name=f"{proj.name} (Copy)",
        description=proj.description,
        scene_data=proj.scene_data,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(dup_project)
    db.commit()
    db.refresh(dup_project)
    return dup_project
