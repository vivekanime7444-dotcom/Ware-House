import os
from dotenv import load_dotenv

load_dotenv()

# On Vercel, the filesystem is read-only except /tmp
# Use /tmp/wms.db for SQLite when deployed, ./wms.db locally
_default_db = "sqlite:////tmp/wms.db" if os.getenv("VERCEL") else "sqlite:///./wms.db"

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "StockFlow WMS")
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "stockflow-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

settings = Settings()

