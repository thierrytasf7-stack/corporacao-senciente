"""Data models for AZ-OS."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any
from az_os.core.storage import TaskStatus, TaskPriority, LogLevel


@dataclass
class Task:
    """A task to be executed by the AI engine."""
    id: str
    command: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    model: Optional[str] = None
    cost: float = 0.0
    actual_tokens: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TaskLog:
    """A log entry for a task."""
    task_id: str
    log_level: LogLevel
    message: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CostTracking:
    """Tracking of LLM usage costs."""
    task_id: str
    provider: str
    model: str
    tokens_used: int
    cost: float
    timestamp: datetime = field(default_factory=datetime.now)
