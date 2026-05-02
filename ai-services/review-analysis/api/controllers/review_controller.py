from services.gemini_service import analyze_review_with_gemini
import json

def analyze_review(data):
    text = data.get("text")

    result = analyze_review_with_gemini(text)

    try:
        parsed = json.loads(result)
        return parsed
    except:
        return {
            "raw_output": result
        }