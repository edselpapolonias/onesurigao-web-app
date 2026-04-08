import os
from google import genai

# Load env manually to match the app
def load_env():
    from pathlib import Path
    # Script is in backend/
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")
    else:
        print(f"DEBUG: .env not found at {env_path}")

load_env()
key = os.environ.get("GEMINI_API_KEY")

if not key:
    print("ERROR: No API Key found.")
else:
    client = genai.Client(api_key=key)
    try:
        print("Listing available models using google-genai...")
        # Get specific models to check their IDs
        models = client.models.list(config={'page_size': 50})
        for m in models:
            print(f" - {m.name}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
