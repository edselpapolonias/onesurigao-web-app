import os
import google.generativeai as genai

# Load env manually to match the app
def load_env():
    from pathlib import Path
    base_dir = Path(__file__).resolve().parent.parent
    env_path = base_dir / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

load_env()
key = os.environ.get("GEMINI_API_KEY")

if not key:
    print("ERROR: No API Key found.")
else:
    genai.configure(api_key=key)
    try:
        print("Listing available models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
