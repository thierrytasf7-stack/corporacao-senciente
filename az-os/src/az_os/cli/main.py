import asyncio
import os
import sys
from typing import List
import litellm
from dotenv import load_dotenv

# Forçar carregamento do .env
load_dotenv()

async def run_trinity_task(prompt_parts: List[str]):
    # Juntar todas as partes do prompt (arquivos @ e texto)
    full_prompt = " ".join(prompt_parts).strip()
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = "openrouter/arcee-ai/trinity-large-preview:free"
    
    print(f"[*] OZ-OS | Engine: Trinity | Status: Conectando...")
    print("-" * 50)

    try:
        # Desativar ruídos do litellm
        litellm.set_verbose = False
        
        response = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": full_prompt}],
            api_key=api_key
        )
        
        content = response.choices[0].message.content
        print(content)
        print("-" * 50)
        
    except Exception as e:
        print(f"[!] ERRO NO OZ-OS: {e}")

if __name__ == "__main__":
    # Pega todos os argumentos passados após o nome do script
    args = sys.argv[1:]
    
    # Se o primeiro argumento for 'task', removemos ele
    if args and args[0] == "task":
        args = args[1:]
        
    if not args:
        print("Uso: python -m az_os <prompt>")
    else:
        asyncio.run(run_trinity_task(args))
