# Virtual Physics Prototyping Simulator (PhysiLab 3D)

A complete, working, browser-based **Virtual Physics Prototyping Simulator** built with **React**, **TypeScript**, **Vite**, **Three.js**, **Rapier 3D WASM**, **Tailwind CSS**, and **FastAPI**.

Allows users to construct virtual prototypes using 3D primitives and mechanical components, assign physical and material properties (Steel, Aluminium, Copper, Rubber, Wood, Ice, Custom), connect objects with springs and joints, apply vector forces and motor torques, run rigid-body physics simulations, inspect numerical telemetry, view real-time energy graphs, save/load projects, export JSON/CSV data, and run AI-assisted simulation diagnostics.

---

## 🌟 Key Features

1. **3D Interactive Workspace**:
   - Three.js WebGL viewport with OrbitControls, Transform Gizmos (Translate `G`, Rotate `R`, Scale `S`, Select `V`), shadow rendering, and object raycasting selection.
   - Component library for 3D primitives (Cube, Sphere, Cylinder, Capsule, Plane, Cone) and mechanical parts (Structural Beam, Cylindrical Rod, Wheel Disc).
2. **60 FPS Rigid-Body Physics Engine**:
   - Powered by `@dimforge/rapier3d-compat` (Rapier 3D WASM).
   - Simulates gravity, rigid bodies, colliders, friction coefficients, restitution/bounciness, forces, impulses, torques, Hooke springs ($F = -k(x - L_0) - c v$), and joint constraints (Fixed welds, Hinge rotational axles).
3. **Live Dynamics & Telemetry Graphs**:
   - Mechanical energy calculation: Kinetic Energy ($KE = \frac{1}{2} m v^2$), Potential Energy ($PE = m g h$), and Total Mechanical Energy ($E = KE + PE$).
   - Real-time line charts using Recharts for Energy, Velocity, and Displacement vs. Time.
   - Real-time Collision Log table with contact event logging.
4. **Preset Physics Scenarios**:
   - 1: Falling Ball & Bouncing Collision
   - 2: Sliding Block with Kinetic Friction Deceleration
   - 3: Projectile Launch Parabolic Trajectory
   - 4: Harmonic Spring Mass Oscillator
   - 5: Vehicle Axle & Wheel Rotational Drive
5. **AI Simulation Diagnostics**:
   - AI analysis endpoint evaluating assembly telemetry, speed spikes, out-of-bounds drops, and providing structured design improvement suggestions with safety disclaimers.
   - Includes deterministic fallback rule-based diagnostic engine.
6. **Project Persistence & Export**:
   - FastAPI REST API + SQLite/PostgreSQL persistence.
   - Offline localStorage fallback when running standalone.
   - Downloadable JSON project configuration and CSV telemetry logs.

---

## 📁 Repository Structure

```
project 1/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI server entry point
│   │   ├── config.py            # Environment & app settings
│   │   ├── database.py          # SQLAlchemy session setup
│   │   ├── models/              # Project and Material DB models
│   │   ├── schemas/             # Pydantic schema validation
│   │   ├── api/                 # REST endpoints (/projects, /materials, /simulations/analyze)
│   │   └── ai/                  # AI diagnostic service & fallback engine
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── types/               # Physics, Component, Telemetry types
│   │   ├── physics/             # RapierManager WASM integration
│   │   ├── three/               # Viewport, lighting, gizmo controller
│   │   ├── state/               # Simulator store hook & undo/redo
│   │   ├── components/          # Toolbar, ComponentLibrary, Inspector, TelemetryPanel, Modals
│   │   ├── pages/               # LandingPage & SimulatorPage
│   │   ├── services/            # API client with offline fallback
│   │   └── utils/               # Materials, Presets, Exporters, Analytical verifier
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js (v18+) & npm
- Python (3.10+)

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
# On Windows PowerShell: .venv\Scripts\Activate
# On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API documentation will be accessible at `http://127.0.0.1:8000/docs`.

---

## 🔬 Physics Engine & Analytical Verification

The simulator uses Rapier 3D WASM for numerical integration. Simulated trajectories can be verified against analytical mechanics formulas:

- **Free Fall**: $y(t) = y_0 - \frac{1}{2}g t^2$
- **Projectile Motion**: $x(t) = v_{0x} t$
- **Friction Deceleration**: $v(t) = v_0 - \mu g t$

_Disclaimer_: PhysiLab 3D is designed for interactive prototyping, physics demonstration, and conceptual validation. It provides high-precision classical mechanics rigid-body numerical approximations, but does NOT replace full professional engineering CAE, FEA stress analysis, or official safety certification software.
