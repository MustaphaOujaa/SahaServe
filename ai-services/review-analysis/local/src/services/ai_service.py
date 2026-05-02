from transformers import pipeline

# sentiment
sentiment_pipeline = pipeline("sentiment-analysis")

# zero-shot (categories)
classifier = pipeline("zero-shot-classification")

LABELS = ["food", "service", "price", "delivery", "cleanliness"]

def analyze_review(text):
    # 1. sentiment
    sentiment_result = sentiment_pipeline(text)[0]

    # 2. category
    category_result = classifier(text, LABELS)

    main_category = category_result["labels"][0]

    return {
        "sentiment": sentiment_result["label"],
        "score": sentiment_result["score"],
        "category": main_category
    }