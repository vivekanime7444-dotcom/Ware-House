import sys
import os

# Ensure all possible backend paths are on PYTHONPATH for Vercel's function environment
_this_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.join(_this_dir, "..")
_project_dir = os.path.join(_backend_dir, "..")

# Insert backend dir so `from app.xxx import` works
for _p in [_backend_dir, _this_dir, _project_dir]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Tell config.py it's running in a serverless environment
# so it uses /tmp/wms.db (writable) instead of the read-only bundle path
if not os.environ.get("VERCEL"):
    os.environ.setdefault("VERCEL", "1")

from app.main import app  # noqa: E402
from mangum import Mangum  # noqa: E402

# Vercel expects a `handler` variable for the serverless function
handler = Mangum(app, lifespan="off")

