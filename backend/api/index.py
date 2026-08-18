import sys
import os

# Add the backend directory to Python path so app imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
