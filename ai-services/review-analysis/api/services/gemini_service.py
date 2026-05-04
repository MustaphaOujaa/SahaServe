from google import genai
import json
from config.settings import GEMINI_API_KEY

MODEL_NAME = "gemini-2.0-flash-lite" 

client = genai.Client(api_key=GEMINI_API_KEY)

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

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )
        
        return json.loads(response.text)

    except Exception as e:
        if "429" in str(e):
            return {
                "error": "QUOTA_EXCEEDED",
                "message": "The API is currently busy. Please wait 60 seconds and try again."
            }
        
        return {"error": str(e)}