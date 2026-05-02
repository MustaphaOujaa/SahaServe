from fastapi import APIRouter
from controllers.review_controller import analyze_review

router = APIRouter()

@router.post("/analyze")
def analyze(data: dict):
    return analyze_review(data)