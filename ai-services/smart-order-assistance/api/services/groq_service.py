import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# Initialize the Groq client
# The client automatically looks for the GROQ_API_KEY environment variable
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY is not set in the environment or .env file")

client = Groq(api_key=api_key)

# Load the menu.json file
# __file__ is .../api/services/groq_service.py
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up to api directory
api_dir = os.path.dirname(current_dir)
# Go up to smart-order-assistance directory
base_dir = os.path.dirname(api_dir)
menu_path = os.path.join(base_dir, "menu.json")

try:
    with open(menu_path, "r", encoding="utf-8") as f:
        menu_data = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError(f"Could not find menu.json at {menu_path}")

# Convert menu data to a JSON string to insert into the prompt
menu_str = json.dumps(menu_data, indent=2)

def get_recommendation(user_request: str) -> str:
    """
    Sends the user request and menu info to Llama 3.3 70B Versatile via Groq.
    """
    system_prompt = f"""You are a restaurant recommendation assistant.

You must ONLY recommend dishes from the provided menu.

MENU:
{menu_str}

Return ONLY valid JSON.

Format:
{{
  "recommended_dishes": [
    {{
      "id": 1,
      "name": "",
      "price": 0,
      "reason": ""
    }}
  ],
  "summary": ""
}}

Rules:
- Never invent dishes
- Recommend only existing dishes
- Keep reasons short
- No markdown
- No explanations outside JSON"""

    try:
        # Create the chat completion request
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_request,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2, # Low temperature for more deterministic/factual responses
            max_tokens=512,
            response_format={"type": "json_object"}
        )
        
        return json.loads(chat_completion.choices[0].message.content)
        
    except Exception as e:
        return f"An error occurred while communicating with the Groq API: {e}"
