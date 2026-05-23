from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.assistant_routes import router
import urllib.request
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/assistant")

@app.get("/debug/test-laravel")
def test_laravel():
    """Debug endpoint: test if Python can reach the Laravel filter API."""
    laravel_url = os.environ.get("LARAVEL_API_URL", "http://127.0.0.1:8000/api")
    url = f"{laravel_url}/ai/dishes/filter"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as response:
            raw = response.read().decode('utf-8')
            data = json.loads(raw)
            return {"status": "OK", "laravel_url": url, "dish_count": data.get("count", 0), "sample": data.get("data", [])[:2]}
    except Exception as e:
        return {"status": "FAILED", "laravel_url": url, "error": str(e)}
