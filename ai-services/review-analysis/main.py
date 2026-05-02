from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()

classifier = pipeline("zero-shot-classification")

LABELS = [
    "food quality",
    "food temperature",
    "taste issue",
    "slow service",
    "rude staff",
    "order mistake",
    "late delivery",
    "wrong order",
    "expensive",
    "not worth price"
]

@app.post("/analyze")
def analyze(data: dict):
    text = data["text"]

    result = classifier(text, LABELS)

    return {
        "text": text,
        "labels": result["labels"],
        "scores": result["scores"]
    }