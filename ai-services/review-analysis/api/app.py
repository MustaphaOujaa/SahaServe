from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.review_routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


#uvicorn app:app --reload --port 5000
# http://localhost:5000/api/analyze-reviews