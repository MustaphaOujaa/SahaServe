from fastapi import APIRouter
from pydantic import BaseModel
from controllers.assistant_controller import handle_assistance

router = APIRouter()

from typing import Optional

class AssistantRequest(BaseModel):
    message: str
    auth_token: Optional[str] = None

@router.post("/chat")
def chat(data: AssistantRequest):
    return handle_assistance(data)
