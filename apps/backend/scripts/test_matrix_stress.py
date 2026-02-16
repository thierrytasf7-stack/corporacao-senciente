import asyncio
import os
import sys
from dotenv import load_dotenv

# Carregar ENVS
env_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\.env"
load_dotenv(dotenv_path=env_path, override=True)

# Adicionar raiz ao path
sys.path.append(os.getcwd())

from backend.scripts.matrix_orchestrator import MatrixOrchestrator

async def run_stress_test():
    print("🚀 [MATRIX] Iniciando Teste de Estresse: Evolução Paralela de 5 Documentos...")
    
    matrix = MatrixOrchestrator(".")
    
    # Bundle de tarefas para o Matrix
    docs = [
        "04_Evolucao_Sonhador_Senciencia.md",
        "05_Evolucao_Cerebro_Senciencia.md",
        "06_Evolucao_Cognitiva_Senciencia.md",
        "07_Evolucao_Do_CORPO_Senciencia.md",
        "08_Evolucao_Metabolismo_Obra_Senciencia.md"
    ]
    
    task_bundles = []
    for doc in docs:
        task_bundles.append({
            "id": doc.split("_")[0],
            "task": f"Evolua o documento {doc} para o padrão Areté Nível 22. Melhore a base filosófica, técnica e ontológica. Use C4 se houver arquitetura mencionada. Aplique tipagem estrita em exemplos de código.",
            "files": [f"METRICAS_DIRECAO_EVOLUCAO/{doc}"]
        })

    print(f"🔥 [MATRIX] DISPARANDO {len(task_bundles)} INSTÂNCIAS SIMULTÂNEAS...")
    
    results = await matrix.run_parallel(task_bundles)
    
    print("\n" + "="*50)
    print("📊 RELATÓRIO FINAL DA MATRIX")
    print("="*50)
    for res in results:
        status = "✅ SUCESSO" if res['success'] else f"❌ FALHA: {res.get('error')}"
        print(f"Braço {res['worker_id']}: {status}")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(run_stress_test())
