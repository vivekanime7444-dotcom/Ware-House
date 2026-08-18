from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.api import (
    auth, products, restocks, orders, tracking,
    damaged_missing, analytics, activity
)
from app.seed import seed_database


# Initialize DB tables on startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[WARN] DB table creation failed: {e}")

# Auto-seed database if empty
try:
    db = SessionLocal()
    seed_database(db)
    db.close()
except Exception as e:
    print(f"[WARN] DB seeding failed: {e}")
    try:
        db.close()
    except Exception:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="StockFlow Warehouse Management System (WMS) REST Backend API"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(restocks.router)
app.include_router(orders.router)
app.include_router(tracking.router)
app.include_router(damaged_missing.router)
app.include_router(analytics.router)
app.include_router(activity.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

