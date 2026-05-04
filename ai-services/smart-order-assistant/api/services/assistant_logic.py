
import re
from services.classifier import get_user_intent

def process_smart_order(user_message):
    intent, confidence = get_user_intent(user_message)
    
    price_match = re.search(r'(\d+)\s*(dh|mad|dirham)', user_message.lower())
    max_price = int(price_match.group(1)) if price_match else None
    
    return {
        "intent": intent,
        "confidence": confidence,
        "max_price": max_price
    }