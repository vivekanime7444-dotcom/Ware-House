import os
import json
import httpx
from app.config import settings
from app.schemas.ai import SimulationAnalysisRequest, SimulationAnalysisResponse
from app.ai.fallback_analyzer import analyze_simulation_fallback

async def analyze_simulation(req: SimulationAnalysisRequest) -> SimulationAnalysisResponse:
    provider = settings.AI_PROVIDER.lower()
    api_key = settings.AI_API_KEY.strip()

    if not api_key or provider == "fallback":
        return analyze_simulation_fallback(req)

    # Generic LLM call logic if API key is provided
    try:
        if provider == "openai":
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            prompt = f"Analyze this physics simulation data and return JSON:\n{req.json()}"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a senior physics and engineering diagnostic AI. Provide clear structural feedback without claiming professional engineering certification."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    data = json.loads(content)
                    return SimulationAnalysisResponse(**data)
    except Exception as e:
        print(f"AI Provider error ({provider}): {e}, using fallback analyzer.")

    # Default back to deterministic fallback engine
    return analyze_simulation_fallback(req)
