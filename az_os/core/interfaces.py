from typing import Any, AsyncGenerator, Dict, List, Optional, Union
from datetime import datetime
from enum import Enum


class TaskStatus(Enum):
    INITIALIZED = "initialized"
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ToolClient:
    async def connect(self) -> bool:
        """Connect to tool server"""
        pass
    
    async def list_tools(self) -> List[Dict[str, Any]]:
        """List available tools"""
        pass
    
    async def execute_tool(self, tool_name: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool"""
        pass


class ToolResponse:
    def __init__(self, success: bool, result: Any = None, error: Optional[str] = None, 
                 tool: Optional[str] = None, task_id: Optional[str] = None):
        self.success = success
        self.result = result
        self.error = error
        self.tool = tool
        self.task_id = task_id


class TaskExecutor:
    async def initialize(self) -> None:
        """Initialize the executor"""
        pass
    
    async def submit_task(self, task: Any) -> str:
        """Submit a task for execution"""
        pass
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        pass
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task"""
        pass
    
    async def list_tasks(self, status: Optional[TaskStatus] = None) -> List[Dict[str, Any]]:
        """List all tasks with optional status filter"""
        pass
    
    async def shutdown(self) -> None:
        """Shutdown the executor"""
        pass


class CostTracker:
    async def track_cost(self, task_id: str, tokens: int, model: str, provider: str) -> float:
        """Track cost for a task"""
        pass
    
    async def get_cost_metrics(self, period: str = "daily") -> Dict[str, Any]:
        """Get cost metrics"""
        pass
    
    async def get_cost_breakdown(self, period: str = "daily") -> List[Dict[str, Any]]:
        """Get cost breakdown"""
        pass
    
    async def set_budget_alert(self, amount: float, alert_percentage: float = 80.0) -> None:
        """Set budget alert"""
        pass
    
    async def check_budget(self) -> Dict[str, Any]:
        """Check current budget status"""
        pass


class ConfigManager:
    async def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value"""
        pass
    
    async def set(self, key: str, value: Any) -> None:
        """Set a configuration value"""
        pass
    
    async def get_all(self) -> Dict[str, Any]:
        """Get all configuration values"""
        pass
    
    async def reset_to_defaults(self) -> None:
        """Reset configuration to defaults"""
        pass