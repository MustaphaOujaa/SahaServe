from fastapi import FastAPI
from routes.review_routes import router

app = FastAPI()

app.include_router(router, prefix="/review")