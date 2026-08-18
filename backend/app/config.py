import os
import shutil
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# On Vercel / Serverless, the root filesystem is read-only except /tmp.
# We copy the bundled wms.db to /tmp/wms.db so that SQLite writes work.
# If the copy fails, we start fresh (seed_database will populate it).
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    tmp_db = "/tmp/wms.db"
    _default_db = f"sqlite:///{tmp_db}"

    if not os.path.exists(tmp_db):
        # Try multiple possible locations where wms.db could be bundled
        _here = Path(__file__).resolve().parent       # backend/app
        _possible = [
            _here.parent / "wms.db",                  # backend/wms.db
            _here.parent.parent / "wms.db",           # project root/wms.db
            _here.parent / "api" / "wms.db",          # backend/api/wms.db (Vercel bundle)
            Path("/var/task/backend/wms.db"),          # Vercel Lambda absolute path
            Path("/var/task/wms.db"),                  # Vercel Lambda root
        ]
        for _src in _possible:
            if _src.exists():
                try:
                    shutil.copyfile(str(_src), tmp_db)
                    print(f"[INFO] Copied {_src} -> {tmp_db}")
                    break
                except Exception as e:
                    print(f"[WARN] Failed to copy {_src}: {e}")
        else:
            print("[INFO] No bundled wms.db found — will create fresh and seed")
else:
    _default_db = "sqlite:///./wms.db"


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "StockFlow WMS")
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "stockflow-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours


settings = Settings()



