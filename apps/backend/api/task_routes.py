"""
Task Routes - API de Tarefas OAIOS v3.0

Endpoints para gerenciamento de tarefas da Corporação Senciente.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.core.services.task_queue import (
    get_task_queue,
    Task,
    TaskStatus,
    TaskPriority
)

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


class TaskCreate(BaseModel):
    """Schema para criação de tarefa."""
    description: str
    priority: str = "medium"
    agent_id: Optional[str] = None
    squad_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class TaskUpdate(BaseModel):
    """Schema para atualização de tarefa."""
    status: str
    metadata: Optional[Dict[str, Any]] = None


class TaskResponse(BaseModel):
    """Schema de resposta de tarefa."""
    id: str
    description: str
    priority: str
    status: str
    agent_id: Optional[str]
    squad_id: Optional[str]
    created_at: str
    updated_at: str
    metadata: Dict[str, Any]


@router.get("")
async def list_tasks(
    status: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Lista todas as tarefas.
    
    Args:
        status: Filtrar por status (pending, in_progress, completed, failed)
        limit: Limite de resultados (default: 50)
    """
    queue = get_task_queue()
    
    filter_status = TaskStatus(status) if status else None
    tasks = await queue.get_all(status=filter_status, limit=limit)
    
    return {
        "tasks": [t.to_dict() for t in tasks],
        "count": len(tasks),
        "stats": queue.get_stats()
    }


@router.post("")
async def create_task(task: TaskCreate) -> Dict[str, Any]:
    """
    Cria uma nova tarefa.
    
    Args:
        task: Dados da tarefa (description, priority, agent_id, squad_id)
    """
    queue = get_task_queue()
    
    try:
        priority = TaskPriority(task.priority)
    except ValueError:
        priority = TaskPriority.MEDIUM
    
    new_task = await queue.add(
        description=task.description,
        priority=priority,
        agent_id=task.agent_id,
        squad_id=task.squad_id,
        metadata=task.metadata
    )
    
    return {
        "success": True,
        "task": new_task.to_dict(),
        "message": f"Tarefa {new_task.id} criada com sucesso"
    }


@router.get("/{task_id}")
async def get_task(task_id: str) -> Dict[str, Any]:
    """Obtém uma tarefa por ID."""
    queue = get_task_queue()
    task = await queue.get(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail=f"Tarefa {task_id} não encontrada")
    
    return {"task": task.to_dict()}


@router.patch("/{task_id}")
async def update_task(task_id: str, update: TaskUpdate) -> Dict[str, Any]:
    """Atualiza o status de uma tarefa."""
    queue = get_task_queue()
    
    try:
        status = TaskStatus(update.status)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Status inválido: {update.status}. Use: pending, in_progress, completed, failed, blocked"
        )
    
    task = await queue.update_status(task_id, status, update.metadata)
    
    if not task:
        raise HTTPException(status_code=404, detail=f"Tarefa {task_id} não encontrada")
    
    return {
        "success": True,
        "task": task.to_dict(),
        "message": f"Tarefa {task_id} atualizada para {status.value}"
    }


@router.delete("/{task_id}")
async def delete_task(task_id: str) -> Dict[str, Any]:
    """Remove uma tarefa."""
    queue = get_task_queue()
    deleted = await queue.delete(task_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Tarefa {task_id} não encontrada")
    
    return {
        "success": True,
        "message": f"Tarefa {task_id} removida"
    }


@router.get("/next/pending")
async def get_next_task(agent_id: Optional[str] = None) -> Dict[str, Any]:
    """Obtém a próxima tarefa pendente por prioridade."""
    queue = get_task_queue()
    task = await queue.get_next(agent_id=agent_id)
    
    if not task:
        return {
            "task": None,
            "message": "Nenhuma tarefa pendente na fila"
        }
    
    return {"task": task.to_dict()}


@router.get("/stats/summary")
async def get_stats() -> Dict[str, Any]:
    """Obtém estatísticas da fila de tarefas."""
    queue = get_task_queue()
    return {
        "stats": queue.get_stats(),
        "message": "Estatísticas da TaskQueue"
    }
