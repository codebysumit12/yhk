# Cooking AI Agent App

This is a Python interactive console application that leverages GitHub-hosted AI language models to support recipe search and ingredient extraction.

## Features
- **Recipe Search**: Find recipes based on user queries.
- **Ingredient Extraction**: Extract ingredients from a given recipe text.

## Requirements
- Python 3.10+
- [agent-framework-core](https://pypi.org/project/agent-framework-core/)
- [agent-framework-azure-ai](https://pypi.org/project/agent-framework-azure-ai/)
- [openai](https://pypi.org/project/openai/)

## Setup
1. Create a [GitHub Models API token](https://github.com/github/ai#authentication) and set it as an environment variable:
   ```sh
   export GITHUB_TOKEN=your_token_here
   # On Windows (cmd):
   set GITHUB_TOKEN=your_token_here
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the app:
   ```sh
   python main.py
   ```

## Notes
- This app uses the [openai](https://pypi.org/project/openai/) Python SDK to connect to GitHub models.
- For production, consider using the [agent-framework](https://github.com/microsoft/agent-framework) for advanced agent orchestration.
