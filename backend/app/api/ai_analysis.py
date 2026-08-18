from fastapi import APIRouter
from app.schemas.ai import SimulationAnalysisRequest, SimulationAnalysisResponse
from app.ai.provider import analyze_simulation

router = APIRouter(prefix="/api/simulations", tags=["Simulation AI"])

@router.post("/analyze", response_model=SimulationAnalysisResponse)
async def run_ai_analysis(req: SimulationAnalysisRequest):
    return await analyze_simulation(req)
