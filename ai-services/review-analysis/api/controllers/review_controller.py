from services.openrouter_service import analyze_review_with_openrouter
from fastapi import HTTPException

def analyze_review(data):
    text = data.text

    result = analyze_review_with_openrouter(text)

    if "error" in result:
        # Check for specific errors like Quota
        if result.get("error") == "QUOTA_EXCEEDED":
            raise HTTPException(status_code=429, detail=result.get("message"))
        
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result
