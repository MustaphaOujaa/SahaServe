
from fastapi import FastAPI
from services.assistant_logic import process_smart_order

app = FastAPI()

@app.get("/assistant/chat")
async def chat_with_assistant(message: str):
    result = process_smart_order(message)
        
    return {
        "status": "success",
        "analysis": result,
        "suggestion": f"Searching for {result['intent']} under {result['max_price']}dh..."
    }