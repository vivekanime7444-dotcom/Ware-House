import math
from typing import Dict, Any, List
from app.schemas.ai import SimulationAnalysisRequest, SimulationAnalysisResponse, PotentialProblem

def analyze_simulation_fallback(req: SimulationAnalysisRequest) -> SimulationAnalysisResponse:
    objects = req.objects
    stats = req.simulation_stats
    events = req.recent_events
    telemetry = req.telemetry_summary

    problems: List[PotentialProblem] = []
    high_load_objects: List[str] = []
    unstable_objects: List[str] = []
    suggestions: List[str] = []

    total_objects = len(objects)
    total_collisions = stats.get("collisionCount", 0)
    sim_time = stats.get("simTime", 0.0)

    for obj in objects:
        name = obj.get("name", "Unnamed")
        mass = float(obj.get("mass", 1.0))
        vx = float(obj.get("velocity", {}).get("x", 0.0))
        vy = float(obj.get("velocity", {}).get("y", 0.0))
        vz = float(obj.get("velocity", {}).get("z", 0.0))
        speed = math.sqrt(vx*vx + vy*vy + vz*vz)

        pos_y = float(obj.get("position", {}).get("y", 0.0))
        restitution = float(obj.get("restitution", 0.5))
        friction = float(obj.get("friction", 0.5))

        # Check 1: Falling into void
        if pos_y < -50:
            unstable_objects.append(name)
            problems.append(PotentialProblem(
                object_name=name,
                severity="High",
                issue="Object has fallen below acceptable viewport bounds (y < -50m).",
                possible_cause="Insufficient surface support, missing collider, or excessive downward force.",
                suggested_fix="Add a ground plane or increase collider boundaries."
            ))

        # Check 2: High velocity
        if speed > 40.0:
            high_load_objects.append(name)
            problems.append(PotentialProblem(
                object_name=name,
                severity="Medium",
                issue=f"Excessive linear velocity ({speed:.2f} m/s).",
                possible_cause="Unbounded force accumulation, high spring stiffness, or steep acceleration.",
                suggested_fix="Increase damping, reduce applied force magnitude, or adjust restitution."
            ))

        # Check 3: Low friction sliding risk
        if friction < 0.05 and abs(vx) + abs(vz) > 5.0:
            suggestions.append(f"Consider increasing friction for '{name}' to prevent uncontrollable slipping (current friction: {friction}).")

        # Check 4: High bounciness / energy accumulation
        if restitution > 0.95 and speed > 10.0:
            problems.append(PotentialProblem(
                object_name=name,
                severity="Low",
                issue=f"Near-perfect elastic restitution coefficient ({restitution}).",
                possible_cause="Energy remains trapped inside rigid body without dissipation.",
                suggested_fix="Lower restitution (bounciness) to 0.6 - 0.8 for realistic material behavior."
            ))

    # General observations & recommendations
    if total_objects == 0:
        summary = "No objects present in the 3D scene. Add primitives from the component library to begin simulation."
        suggestions.append("Add shapes or mechanical components from the left sidebar panel.")
    else:
        summary = f"Simulated {total_objects} rigid body object(s) over {sim_time:.2f} seconds with {total_collisions} logged collision event(s)."

    if total_collisions > 100:
        suggestions.append("High collision rate detected. Check for intersecting colliders in initial positions.")

    if not suggestions:
        suggestions.append("Structure appears overall dynamically stable within current force and gravity parameters.")

    disclaimer = (
        "Notice: This automated analysis is based on simplified 3D rigid-body simulation telemetry "
        "and numerical physics approximations. It does NOT constitute professional FEA, CAE, or structural engineering certification."
    )

    return SimulationAnalysisResponse(
        summary=summary,
        potential_problems=problems,
        high_load_objects=list(set(high_load_objects)),
        unstable_objects=list(set(unstable_objects)),
        design_suggestions=suggestions,
        limitations_disclaimer=disclaimer
    )
