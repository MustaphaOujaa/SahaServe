import requests
import json
import re
from config.settings import OPENROUTER_API_KEY

MODEL_NAME = "deepseek/deepseek-chat"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"


def analyze_review_with_openrouter(text):
    prompt = f"""
    Analyze the following restaurant review and return ONLY a valid JSON object with no extra text.

    JSON Schema:
    {{
      "sentiment": "positive | negative | neutral",
      "confidence": <float 0.0-1.0>,
      "aspects": {{
        "food": "positive | negative | neutral | N/A",
        "service": "positive | negative | neutral | N/A",
        "delivery": "positive | negative | neutral | N/A",
        "price": "positive | negative | neutral | N/A",
        "cleanliness": "positive | negative | neutral | N/A"
      }},
      "key_points": ["<phrase 1>", "<phrase 2>"],
      "main_issue": "<short description of the primary complaint, or null>",
      "category": "<restaurant type>",
      "business_insight": {{
        "main_problem": "<root cause identification>",
        "recommendation": "<actionable advice for the owner>"
      }},
      "severity_score": <float 0.0-10.0 representing how critical the issues are, where 10 is most severe>
    }}

    Review Text:
    ---
    {text}
    ---
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sahaserve.app",   # optional but recommended by OpenRouter
        "X-Title": "SahaServe Review Analysis",    # optional label shown in OpenRouter dashboard
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "response_format": {"type": "json_object"},
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)

        if response.status_code == 429:
            return {
                "error": "QUOTA_EXCEEDED",
                "message": "The AI service quota has been exceeded or it is too busy. Please try again in a few minutes."
            }

        if response.status_code != 200:
            return {"error": f"OpenRouter API error: {response.status_code} - {response.text}"}

        data = response.json()

        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not raw_content:
            return {"error": "Empty response from AI service"}

        # Clean response text in case of unexpected markdown wrappers
        text_response = raw_content.strip()
        if text_response.startswith("```json"):
            text_response = re.sub(r"^```json\n?|\n?```$", "", text_response).strip()

        try:
            return json.loads(text_response)
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI response as JSON", "raw": text_response}

    except requests.Timeout:
        return {"error": "Request to AI service timed out. Please try again."}

    except Exception as e:
        error_msg = str(e)
        if any(x in error_msg.lower() for x in ["429", "quota", "limit exceeded", "exhausted"]):
            return {
                "error": "QUOTA_EXCEEDED",
                "message": "The AI service quota has been exceeded or it is too busy. Please try again in a few minutes."
            }

        return {"error": error_msg}
