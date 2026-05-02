import requests
from config.settings import GEMINI_API_KEY

MODEL = "models/gemini-2.0-flash-001"

URL = f"https://generativelanguage.googleapis.com/v1/{MODEL}:generateContent?key={GEMINI_API_KEY}"

def analyze_review_with_gemini(text):
    prompt = f"""
Analyze this restaurant review and return STRICT JSON only:

{{
  "sentiment": "positive or negative",
  "main_issue": "short phrase",
  "category": "food | service | delivery | price | cleanliness"
}}

Review: "{text}"
"""

    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(URL, json=body)

    if response.status_code != 200:
        return {"error": response.text}

    try:
        data = response.json()
        output = data["candidates"][0]["content"]["parts"][0]["text"]

        return output

    except Exception as e:
        return {"error": str(e), "raw": response.text}