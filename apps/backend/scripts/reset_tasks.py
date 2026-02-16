
import sys
import os
import asyncio
import logging

# Adicionar root ao path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.core.services.task_queue import get_task_queue, TaskStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TaskResetter")

async def reset_tasks():
    logger.info("Iniciando reset de tarefas IN_PROGRESS...")
    queue = get_task_queue()
    
    # Init já carrega a fila
    logger.info(f"Fila carregada com {len(queue.tasks)} tarefas")
    
    count = 0
    for task_id, task in queue.tasks.items():
        if task.status == TaskStatus.IN_PROGRESS:
            logger.info(f"Resetando {task_id} para PENDING")
            task.status = TaskStatus.PENDING
            task.metadata["reset_at"] = "2026-02-01Tnow"
            count += 1
            
    if count > 0:
        queue._save()
        logger.info(f"✅ {count} tarefas resetadas com sucesso!")
    else:
        logger.info("Nenhuma tarefa para resetar.")

if __name__ == "__main__":
    asyncio.run(reset_tasks())
