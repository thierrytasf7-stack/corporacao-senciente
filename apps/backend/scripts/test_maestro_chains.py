import asyncio
import os
import sys
from dotenv import load_dotenv

# Carregar ENVS antes de importar o serviço
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
sys.path.append(os.getcwd())

from backend.core.services.aider_service import AiderService

async def test_maestro_chains():
    print("🚀 Iniciando Teste de Cadeias Maestro (Aider Only)...")
    aider = AiderService()
    
    # 1. Testar Cadeia de Planejamento (DeepSeek V3)
    print("\n[TESTE 1] Validando Cadeia de PLANEJAMENTO (DeepSeek V3)...")
    task_p = "Crie uma pequena descrição para um agente chamado 'Sophia'."
    res_p = await aider.execute(task_p, mode="chat", chain_type="planning")
    
    if res_p.get("success"):
        print(f"✅ PLANEJAMENTO OK! Modelo: {res_p.get('model')}")
        print(f"Resumo: {res_p.get('content')[:100]}...")
    else:
        print(f"❌ FALHA PLANEJAMENTO: {res_p.get('error')}")

    # 2. Testar Cadeia de Execução (Arcee/Qwen)
    print("\n[TESTE 2] Validando Cadeia de EXECUÇÃO (Trinity/Qwen)...")
    task_e = "Responda apenas com 'Trinity Actived' se você for o Arcee Trinity ou Qwen Coder."
    res_e = await aider.execute(task_e, mode="chat", chain_type="execution")
    
    if res_e.get("success"):
        print(f"✅ EXECUÇÃO OK! Modelo: {res_e.get('model')}")
        print(f"Resumo: {res_e.get('content')[:100]}...")
    else:
        print(f"❌ FALHA EXECUÇÃO: {res_e.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_maestro_chains())
