from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from controllers.review_controller import analyze_review

router = APIRouter()

class ReviewRequest(BaseModel):
    reviews: List[Dict[str, Any]]

@router.post("/analyze-reviews")
def analyze(data: ReviewRequest):
    return analyze_review(data)
