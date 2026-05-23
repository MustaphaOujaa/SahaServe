from services.openrouter_service import analyze_review_with_openrouter
from fastapi import HTTPException

def analyze_review(data):
    reviews = data.reviews

    result = analyze_review_with_openrouter(reviews)

    if "error" in result:
        if result.get("error") == "QUOTA_EXCEEDED":
            raise HTTPException(status_code=429, detail=result.get("message"))
        
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result
