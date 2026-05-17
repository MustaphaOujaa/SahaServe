from fastapi import HTTPException
from services.groq_service import get_recommendation

def handle_assistance(data):
    message = data.message

    if not message or not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    result = get_recommendation(message)

    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=500, detail=result.get("error"))

    if isinstance(result, str) and result.startswith("An error occurred"):
        raise HTTPException(status_code=500, detail=result)

    return {"response": result}
