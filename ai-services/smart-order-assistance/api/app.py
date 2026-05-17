from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.assistant_routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/assistant")


# uvicorn app:app --reload --port 8000
# http://localhost:8000/assistant/chat
