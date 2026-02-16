"""
Script de teste para Qwen Service via DashScope
"""

import asyncio
import sys
import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

# Adicionar backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.services.qwen_service import qwen_service

async def test_qwen():
    print("🧪 Testando Qwen Service com DashScope")
    print("=" * 50)
    
    # Verificar configuração
    print(f"Provider: {qwen_service.provider}")
    print(f"Model: {qwen_service.model}")
    print(f"API URL: {qwen_service.api_url}")
    print(f"API Key configurada: {'✅' if qwen_service.api_key else '❌'}")
    print()
    
    if not qwen_service.api_key:
        print("❌ API key não configurada!")
        return
    
    # Teste 1: Tarefa simples
    print("📝 Teste 1: Gerar docstring simples")
    print("-" * 50)
    
    task = "Gerar docstring para uma função Python que soma dois números"
    
    try:
        result = await qwen_service.execute(task)
        
        if result.get("success"):
            print("✅ Sucesso!")
            print(f"Duração: {result.get('duration_seconds', 0):.2f}s")
            print(f"\nResposta:\n{result.get('content', '')[:500]}...")
        else:
            print(f"❌ Falhou: {result.get('error')}")
    
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    asyncio.run(test_qwen())
