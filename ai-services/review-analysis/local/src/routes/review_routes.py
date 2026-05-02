from fastapi import APIRouter
from models.schemas import ReviewRequest
from api.controllers.review_controller import handle_review

router = APIRouter()

@router.post("/")
def analyze(data: ReviewRequest):
    return handle_review(data)