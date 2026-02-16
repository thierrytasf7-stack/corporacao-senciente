import asyncio
import os
import sys
from dotenv import load_dotenv

# Carregar ENVS antes de importar o serviço
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
sys.path.append(os.getcwd())

from backend.core.services.qwen_service import QwenService

async def test_qwen_pool():
    print("🚀 Iniciando Teste de Validação de Modelos Alibaba...")
    qwen = QwenService()
    
    task = "Oi, responda apenas 'OK' se estiver funcionando."
    
    for model in qwen.models_pool:
        print(f"--- Testando Modelo: {model} ---")
        result = await qwen._call_api(task, model)
        if result.get("success"):
            print(f"✅ VALIDADO: {model} está FUNCIONANDO!")
        else:
            print(f"❌ REPROVADO: {model} falhou ({result.get('error')})")
    
    print("\n--- Resultado Final ---")

if __name__ == "__main__":
    asyncio.run(test_qwen_pool())
