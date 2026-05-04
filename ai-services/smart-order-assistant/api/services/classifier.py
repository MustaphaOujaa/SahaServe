import requests
import time
from config.settings import HF_TOKEN, API_URL

headers = {"Authorization": f"Bearer {HF_TOKEN}"}

import requests
import time
from config.settings import HF_TOKEN, API_URL

def query_huggingface(payload):
    clean_url = API_URL.strip()
    headers = {"Authorization": f"Bearer {HF_TOKEN.strip()}"}

    try:
        response = requests.post(clean_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code in [404, 405]:
            return {"error": f"Endpoint not found. Check your API_URL. Status: {response.status_code}"}

        if response.status_code == 503:
            estimated_time = response.json().get("estimated_time", 20)
            print(f"Model is loading... Waiting {estimated_time}s")
            time.sleep(estimated_time)
            return query_huggingface(payload)

        return response.json()
    except Exception as e:
        return {"error": f"Connection failed: {str(e)}"}

def get_user_intent(user_input):
    labels = ["light meal", "heavy meal", "drink", "dessert", "cheap", "traditional"]
    
    payload = {
        "inputs": user_input,
        "parameters": {"candidate_labels": labels, "wait_for_model": True} # أضفنا هذا السطر لانتظار التحميل
    }
    
    output = query_huggingface(payload)
    
    print(f"HF Output: {output}") 
    
    if isinstance(output, dict) and "labels" in output:
        return output['labels'][0], output['scores'][0]
    
    return None, 0