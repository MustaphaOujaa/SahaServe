from fastapi import APIRouter
from pydantic import BaseModel
from controllers.assistant_controller import handle_assistance

router = APIRouter()

class AssistantRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(data: AssistantRequest):
    return handle_assistance(data)
