from fastapi import FastAPI
from api.routes.review_routes import router

app = FastAPI()

app.include_router(router, prefix="/ai/review")