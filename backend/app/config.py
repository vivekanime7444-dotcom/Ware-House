import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# On Vercel / Serverless, the root directory is read-only.
# We use /tmp/wms.db and initialize it from the bundled wms.db if present.
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    tmp_db = "/tmp/wms.db"
    bundled_db = Path(__file__).resolve().parent.parent / "wms.db"
    if not os.path.exists(tmp_db) and bundled_db.exists():
        try:
            shutil.copyfile(str(bundled_db), tmp_db)
        except Exception:
            pass
    _default_db = f"sqlite:///{tmp_db}"
else:
    _default_db = "sqlite:///./wms.db"

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "StockFlow WMS")
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "stockflow-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

settings = Settings()


