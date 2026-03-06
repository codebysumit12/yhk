import os
from openai import OpenAI

GITHUB_API_BASE = "https://models.github.ai/inference"
GITHUB_MODEL = "openai/gpt-4.1"  # You can change to another available model

def get_github_token():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("[ERROR] Please set the GITHUB_TOKEN environment variable.")
        exit(1)
    return token

def search_recipe(client, model):
    query = input("Enter ingredients or recipe name to search: ")
    prompt = f"Suggest a recipe based on: {query}. Give a short description and a list of ingredients."
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful cooking assistant."},
            {"role": "user", "content": prompt}
        ],
        model=model,
        temperature=0.7,
        top_p=1
    )
    print("\n--- Recipe Suggestion ---")
    print(response.choices[0].message.content)
    print("------------------------\n")

def extract_ingredients(client, model):
    recipe_text = input("Paste the recipe text to extract ingredients: ")
    prompt = f"Extract the list of ingredients from the following recipe text. Only output the ingredients as a bullet list.\n\n{recipe_text}"
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful cooking assistant."},
            {"role": "user", "content": prompt}
        ],
        model=model,
        temperature=0.3,
        top_p=1
    )
    print("\n--- Extracted Ingredients ---")
    print(response.choices[0].message.content)
    print("----------------------------\n")

def main():
    print("=== Cooking AI Agent ===")
    token = get_github_token()
    client = OpenAI(base_url=GITHUB_API_BASE, api_key=token)
    model = GITHUB_MODEL
    while True:
        print("Choose an option:")
        print("1. Search for a recipe")
        print("2. Extract ingredients from recipe text")
        print("3. Exit")
        choice = input("Enter your choice (1/2/3): ").strip()
        if choice == "1":
            search_recipe(client, model)
        elif choice == "2":
            extract_ingredients(client, model)
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.\n")

if __name__ == "__main__":
    main()
