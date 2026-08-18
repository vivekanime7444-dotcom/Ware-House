import sys
import os
# Ensure the backend package is on PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from mangum import Mangum

# Vercel expects a `handler` variable for the serverless function
handler = Mangum(app, lifespan="off")
