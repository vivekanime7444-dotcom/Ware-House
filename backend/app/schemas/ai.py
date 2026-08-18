from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SimulationAnalysisRequest(BaseModel):
    project_name: Optional[str] = "Untitled Project"
    objects: List[Dict[str, Any]] = Field(default_factory=list)
    simulation_stats: Dict[str, Any] = Field(default_factory=dict)
    recent_events: List[Dict[str, Any]] = Field(default_factory=list)
    telemetry_summary: Dict[str, Any] = Field(default_factory=dict)

class PotentialProblem(BaseModel):
    object_name: str
    severity: str # "Low", "Medium", "High", "Critical"
    issue: str
    possible_cause: str
    suggested_fix: str

class SimulationAnalysisResponse(BaseModel):
    summary: str
    potential_problems: List[PotentialProblem]
    high_load_objects: List[str]
    unstable_objects: List[str]
    design_suggestions: List[str]
    limitations_disclaimer: str
