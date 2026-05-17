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
# We construct the path relative to this script's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
menu_path = os.path.join(os.path.dirname(current_dir), "menu.json")

try:
    with open(menu_path, "r") as f:
        menu_data = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError(f"Could not find menu.json at {menu_path}")

# Convert menu data to a JSON string to insert into the prompt
menu_str = json.dumps(menu_data, indent=2)

def get_recommendation(user_request: str) -> str:
    """
    Sends the user request and menu info to Llama 3.3 70B Versatile via Groq.
    """
    system_prompt = f"""You are a restaurant assistant.

You must ONLY recommend dishes from the provided menu.

MENU:
{menu_str}

Rules:
- Never invent dishes
- Recommend only existing dishes
- Explain briefly why the dish matches the user request
- If nothing matches, say so politely"""

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
            max_tokens=256
        )
        
        return chat_completion.choices[0].message.content
        
    except Exception as e:
        return f"An error occurred while communicating with the Groq API: {e}"

if __name__ == "__main__":
    print("Welcome to the SahaServe Smart Order Assistant!")
    print("Type 'quit' or 'exit' to stop.")
    print("-" * 50)
    
    # Interactive loop
    while True:
        user_input = input("\nUser -> ")
        
        if user_input.lower() in ['quit', 'exit']:
            print("Goodbye!")
            break
            
        if not user_input.strip():
            continue
            
        print("Llama -> Thinking...")
        response = get_recommendation(user_input)
        
        # Overwrite the "Thinking..." line with the actual response
        print(f"\rLlama -> {response}")
