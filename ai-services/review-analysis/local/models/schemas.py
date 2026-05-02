from pydantic import BaseModel

class ReviewRequest(BaseModel):
    review: str