import asyncio
import os
import sys
import logging
from dotenv import load_dotenv

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_review")

# Carregar ENVS
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
sys.path.append(os.getcwd())

from backend.core.services.cerebro_orchestrator import CerebroOrchestrator, AgentType
from backend.core.services.task_queue import Task, TaskPriority

async def test_full_review_loop():
    print("🚀 Iniciando Teste do Loop de Revisão Areté...")
    
    # Mock do Notificador WhatsApp (simula o POST para a API local)
    async def mock_whatsapp(msg):
        print(f"📱 [WHATSAPP]: {msg}")

    orchestrator = CerebroOrchestrator(whatsapp_notifier=mock_whatsapp)
    
    # Criar uma Task que propositalmente pode ser "mal avaliada" se não seguir o padrão
    # Vamos pedir algo que exija tipagem e C4, mas no prompt do orchestrator 
    # vams ver se ele consegue detectar se o output foi medíocre.
    
    test_task = Task(
        id="REFACTOR-TEST-001",
        description="Desenvolver uma função Python que calcula a sequência de Fibonacci, MAS SEM USAR TIPAGEM E COM NOMES DE VARIÁVEIS GENÉRICOS (ex: a, b, c).",
        priority=TaskPriority.HIGH
    )
    
    print("\n--- PASSO 1: Executando Task Propositalmente 'Mal Feita' ---")
    # O process_task vai rodar a task, a Dike vai revisar. 
    # Como pedimos "sem tipagem", a Dike DEVE reprovar se estiver configurada para exigir o padrão Areté.
    
    success = await orchestrator.process_task(test_task)
    
    if success:
        print("\n✅ TESTE FINALIZADO: O sistema conseguiu processar (e possivelmente corrigir) a task.")
    else:
        print("\n❌ TESTE FINALIZADO: O sistema falhou no processo.")

if __name__ == "__main__":
    asyncio.run(test_full_review_loop())
