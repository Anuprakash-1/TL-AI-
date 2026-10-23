import os
import sys
import socket
from pathlib import Path

# Safe UTF-8 encoding for standard output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "truthlens.db"

# Environment configurations
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Search settings
MAX_SEARCH_RESULTS_PER_CLAIM = 6
REQUEST_TIMEOUT_SECONDS = 10.0
USER_AGENT = "TruthLens-AI-Verifier/1.0 (+https://truthlens.ai/bot; verification-research)"
