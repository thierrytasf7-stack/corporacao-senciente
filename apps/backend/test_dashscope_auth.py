"""
Teste simples de autenticação DashScope
"""

import os
from dotenv import load_dotenv
import requests

load_dotenv()

api_key = os.getenv("DASHSCOPE_API_KEY")
print(f"API Key: {api_key[:20]}..." if api_key else "Não encontrada")

# Testar endpoint
url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "qwen-plus",
    "messages": [{"role": "user", "content": "Olá"}],
    "max_tokens": 10
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Erro: {e}")
