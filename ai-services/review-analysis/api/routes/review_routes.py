from fastapi import APIRouter
from pydantic import BaseModel
from controllers.review_controller import analyze_review

router = APIRouter()

class ReviewRequest(BaseModel):
    text: str

@router.post("/analyze")
def analyze(data: ReviewRequest):
    return analyze_review(data)
