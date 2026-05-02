from api.services.ai_service import analyze_review

def handle_review(data):
    text = data.review

    result = analyze_review(text)

    return {
        "review": text,
        "analysis": result
    }