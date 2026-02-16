from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class TaskStatus(str, Enum):
    INITIALIZED = "initialized"
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(BaseModel):
    id: str
    command: str
    status: TaskStatus = TaskStatus.INITIALIZED
    priority: TaskPriority = TaskPriority.MEDIUM
    model: Optional[str] = None
    cost: float = 0.0
    estimated_tokens: int = 0
    actual_tokens: int = 0
    created_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    updated_at: datetime | None = None
    parent_task_id: Optional[str] = None
    metadata: Dict[str, Any] | None = None


class TaskLog(BaseModel):
    id: int
    task_id: str
    log_level: str
    message: str
    timestamp: datetime
    metadata: Dict[str, Any] | None = None


class CostTracking(BaseModel):
    id: int
    task_id: str
    provider: str
    model: str
    tokens_used: int
    cost: float
    timestamp: datetime


class TaskStateSnapshot(BaseModel):
    id: int
    task_id: str
    snapshot_name: str
    state_data: str
    created_at: datetime