"""
TaskQueue Service - Fila de Tarefas OAIOS v3.0

Sistema de gerenciamento de tarefas da Corporação Senciente.
Baseado no workflow-orchestrator.js do aios-core.
"""

import json
import os
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class TaskStatus(str, Enum):
    """Status possíveis de uma tarefa."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TaskPriority(str, Enum):
    """Prioridades de tarefa."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Task:
    """Representa uma tarefa no sistema."""
    
    def __init__(
        self,
        id: str,
        description: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        status: TaskStatus = TaskStatus.PENDING,
        agent_id: Optional[str] = None,
        squad_id: Optional[str] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.id = id
        self.description = description
        self.priority = priority
        self.status = status
        self.agent_id = agent_id
        self.squad_id = squad_id
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or self.created_at
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário."""
        return {
            "id": self.id,
            "description": self.description,
            "priority": self.priority.value if isinstance(self.priority, TaskPriority) else self.priority,
            "status": self.status.value if isinstance(self.status, TaskStatus) else self.status,
            "agent_id": self.agent_id,
            "squad_id": self.squad_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Task":
        """Cria Task a partir de dicionário."""
        return cls(
            id=data["id"],
            description=data["description"],
            priority=TaskPriority(data.get("priority", "medium")),
            status=TaskStatus(data.get("status", "pending")),
            agent_id=data.get("agent_id"),
            squad_id=data.get("squad_id"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            metadata=data.get("metadata", {})
        )


class TaskQueue:
    """
    Fila de Tarefas da Corporação Senciente.
    
    Gerencia tarefas pendentes, em execução e concluídas.
    Suporta prioridades, agentes específicos e squads.
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Inicializa a TaskQueue.
        
        Args:
            storage_path: Caminho para arquivo JSON de persistência.
                         Se None, usa data/tasks.json
        """
        self.storage_path = storage_path or os.path.join(
            os.path.dirname(__file__), 
            "..", "..", "..", "data", "tasks.json"
        )
        self.tasks: Dict[str, Task] = {}
        self._counter = 0
        self._lock = asyncio.Lock()
        
        # Carregar tarefas existentes
        self._load()
    
    def _load(self):
        """Carrega tarefas do arquivo JSON."""
        try:
            path = Path(self.storage_path)
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.tasks = {
                        k: Task.from_dict(v) 
                        for k, v in data.get("tasks", {}).items()
                    }
                    self._counter = data.get("counter", 0)
                    logger.info(f"TaskQueue: {len(self.tasks)} tarefas carregadas")
            else:
                # Criar diretório se não existir
                path.parent.mkdir(parents=True, exist_ok=True)
                self._save()
        except Exception as e:
            logger.error(f"Erro ao carregar TaskQueue: {e}")
            self.tasks = {}
            self._counter = 0
    
    def _save(self):
        """Salva tarefas no arquivo JSON."""
        try:
            path = Path(self.storage_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            data = {
                "counter": self._counter,
                "tasks": {k: v.to_dict() for k, v in self.tasks.items()},
                "updated_at": datetime.now().isoformat()
            }
            
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Erro ao salvar TaskQueue: {e}")
    
    async def add(
        self,
        description: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        agent_id: Optional[str] = None,
        squad_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Task:
        """
        Adiciona uma nova tarefa à fila.
        
        Args:
            description: Descrição da tarefa
            priority: Prioridade (critical, high, medium, low)
            agent_id: ID do agente específico (opcional)
            squad_id: ID do squad (opcional)
            metadata: Dados adicionais (opcional)
        
        Returns:
            Task: A tarefa criada
        """
        async with self._lock:
            self._counter += 1
            task_id = f"TASK-{self._counter:04d}"
            
            task = Task(
                id=task_id,
                description=description,
                priority=priority,
                agent_id=agent_id,
                squad_id=squad_id,
                metadata=metadata
            )
            
            self.tasks[task_id] = task
            self._save()
            
            logger.info(f"TaskQueue: Tarefa {task_id} adicionada - {description[:50]}...")
            return task
    
    async def get_next(self, agent_id: Optional[str] = None) -> Optional[Task]:
        """
        Obtém a próxima tarefa pendente por prioridade.
        
        Args:
            agent_id: Filtrar por agente específico (opcional)
        
        Returns:
            Task ou None se não houver tarefas pendentes
        """
        async with self._lock:
            # Ordenar por prioridade
            priority_order = {
                TaskPriority.CRITICAL: 0,
                TaskPriority.HIGH: 1,
                TaskPriority.MEDIUM: 2,
                TaskPriority.LOW: 3
            }
            
            pending = [
                t for t in self.tasks.values()
                if t.status == TaskStatus.PENDING
                and (agent_id is None or t.agent_id == agent_id or t.agent_id is None)
            ]
            
            if not pending:
                return None
            
            # Ordenar por prioridade e data de criação
            pending.sort(key=lambda t: (
                priority_order.get(t.priority, 2),
                t.created_at
            ))
            
            return pending[0]
    
    async def update_status(
        self, 
        task_id: str, 
        status: TaskStatus,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Task]:
        """
        Atualiza o status de uma tarefa.
        
        Args:
            task_id: ID da tarefa
            status: Novo status
            metadata: Dados adicionais para merge (opcional)
        
        Returns:
            Task atualizada ou None se não encontrada
        """
        async with self._lock:
            if task_id not in self.tasks:
                return None
            
            task = self.tasks[task_id]
            task.status = status
            task.updated_at = datetime.now().isoformat()
            
            if metadata:
                task.metadata.update(metadata)
            
            self._save()
            logger.info(f"TaskQueue: {task_id} -> {status.value}")
            return task
    
    async def get_all(
        self, 
        status: Optional[TaskStatus] = None,
        limit: int = 50
    ) -> List[Task]:
        """
        Lista todas as tarefas.
        
        Args:
            status: Filtrar por status (opcional)
            limit: Limite de resultados
        
        Returns:
            Lista de tarefas
        """
        tasks = list(self.tasks.values())
        
        if status:
            tasks = [t for t in tasks if t.status == status]
        
        # Ordenar por prioridade e data
        priority_order = {
            TaskPriority.CRITICAL: 0,
            TaskPriority.HIGH: 1,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 3
        }
        
        tasks.sort(key=lambda t: (
            priority_order.get(t.priority, 2),
            t.created_at
        ))
        
        return tasks[:limit]
    
    async def get(self, task_id: str) -> Optional[Task]:
        """Obtém uma tarefa por ID."""
        return self.tasks.get(task_id)
    
    async def delete(self, task_id: str) -> bool:
        """Remove uma tarefa."""
        async with self._lock:
            if task_id in self.tasks:
                del self.tasks[task_id]
                self._save()
                return True
            return False
    
    def get_stats(self) -> Dict[str, int]:
        """Retorna estatísticas da fila."""
        stats = {
            "total": len(self.tasks),
            "pending": 0,
            "in_progress": 0,
            "completed": 0,
            "failed": 0,
            "blocked": 0
        }
        
        for task in self.tasks.values():
            status_key = task.status.value if isinstance(task.status, TaskStatus) else task.status
            if status_key in stats:
                stats[status_key] += 1
        
        return stats


# Singleton global
_task_queue: Optional[TaskQueue] = None


def get_task_queue() -> TaskQueue:
    """Obtém a instância singleton do TaskQueue."""
    global _task_queue
    if _task_queue is None:
        _task_queue = TaskQueue()
    return _task_queue
