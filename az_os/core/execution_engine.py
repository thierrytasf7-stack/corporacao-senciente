import asyncio
import logging
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from az_os.core.interfaces import TaskExecutor, TaskStatus, TaskPriority
from az_os.data.models import Task
from az_os.data.sqlite_repository import SQLiteRepository

logger = logging.getLogger(__name__)


class ExecutionStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskProgress(BaseModel):
    current: int = Field(default=0, description="Current progress step")
    total: int = Field(default=1, description="Total progress steps")
    message: str = Field(default="", description="Progress message")


class ExecutionResult(BaseModel):
    success: bool = Field(default=False, description="Execution success status")
    result: Any = Field(default=None, description="Execution result")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    duration: float = Field(default=0.0, description="Execution duration in seconds")
    progress: TaskProgress = Field(default_factory=TaskProgress, description="Task progress")


class CommandExecutionEngine(TaskExecutor):
    def __init__(self, repository: SQLiteRepository):
        self.repository = repository
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_locks: Dict[str, asyncio.Lock] = {}
        self.execution_queue: asyncio.Queue = asyncio.Queue()
        self.is_running = False
        
    async def initialize(self) -> None:
        """Initialize execution engine"""
        await self.load_pending_tasks()
        await self.start_execution_loop()
        logger.info("Execution engine initialized")

    async def load_pending_tasks(self) -> None:
        """Load pending tasks from database"""
        tasks = await self.repository.list_tasks(status=TaskStatus.PENDING)
        for task in tasks:
            await self.execution_queue.put(task)
        logger.info(f"Loaded {len(tasks)} pending tasks")

    async def start_execution_loop(self) -> None:
        """Start the main execution loop"""
        if self.is_running:
            return
            
        self.is_running = True
        asyncio.create_task(self.process_execution_queue())
        logger.info("Execution loop started")

    async def process_execution_queue(self) -> None:
        """Process tasks from the execution queue"""
        while self.is_running:
            try:
                task = await self.execution_queue.get()
                if task.id in self.running_tasks:
                    logger.warning(f"Task {task.id} is already running")
                    continue
                    
                # Execute task
                execution_task = asyncio.create_task(
                    self.execute_task(task)
                )
                self.running_tasks[task.id] = execution_task
                
                # Wait for completion
                await execution_task
                
                # Clean up
                if task.id in self.running_tasks:
                    del self.running_tasks[task.id]
                    
            except Exception as e:
                logger.error(f"Error processing execution queue: {e}")
            finally:
                self.execution_queue.task_done()

    async def execute_task(self, task: Task) -> ExecutionResult:
        """Execute a single task"""
        start_time = datetime.now()
        task.status = TaskStatus.RUNNING
        task.started_at = start_time
        await self.repository.update_task(task)
        
        result = ExecutionResult()
        
        try:
            # Simulate task execution
            await asyncio.sleep(1)  # Replace with actual execution logic
            
            result.success = True
            result.result = f"Task {task.id} completed successfully"
            result.progress = TaskProgress(current=1, total=1, message="Completed")
            
        except Exception as e:
            result.success = False
            result.error = str(e)
            result.progress = TaskProgress(current=1, total=1, message=f"Failed: {str(e)}")
            logger.error(f"Task {task.id} failed: {e}")
            
        finally:
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            task.status = TaskStatus.COMPLETED if result.success else TaskStatus.FAILED
            task.completed_at = end_time
            task.updated_at = end_time
            await self.repository.update_task(task)
            
            result.duration = duration
            logger.info(f"Task {task.id} executed in {duration:.2f}s")
            
        return result

    async def submit_task(self, task: Task) -> str:
        """Submit a new task for execution"""
        task.status = TaskStatus.PENDING
        task.created_at = datetime.now()
        await self.repository.create_task(task)
        
        await self.execution_queue.put(task)
        logger.info(f"Task {task.id} submitted for execution")
        
        return task.id

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        task = await self.repository.get_task(task_id)
        if not task:
            return {"error": "Task not found"}
            
        return {
            "id": task.id,
            "command": task.command,
            "status": task.status,
            "priority": task.priority,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "duration": (
                (task.completed_at - task.started_at).total_seconds()
                if task.completed_at and task.started_at else None
            )
        }

    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task"""
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
            task.cancel()
            del self.running_tasks[task_id]
            
            # Update task status in database
            task_record = await self.repository.get_task(task_id)
            if task_record:
                task_record.status = TaskStatus.CANCELLED
                task_record.completed_at = datetime.now()
                await self.repository.update_task(task_record)
            
            logger.info(f"Task {task_id} cancelled")
            return True
            
        return False

    async def list_tasks(self, status: Optional[TaskStatus] = None) -> List[Dict[str, Any]]:
        """List all tasks with optional status filter"""
        tasks = await self.repository.list_tasks(status=status)
        
        return [{
            "id": task.id,
            "command": task.command,
            "status": task.status,
            "priority": task.priority,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "duration": (
                (task.completed_at - task.started_at).total_seconds()
                if task.completed_at and task.started_at else None
            )
        } for task in tasks]

    async def shutdown(self) -> None:
        """Shutdown the execution engine"""
        self.is_running = False
        
        # Cancel running tasks
        for task_id, task in self.running_tasks.items():
            task.cancel()
        
        # Wait for queue to empty
        while not self.execution_queue.empty():
            await asyncio.sleep(0.1)
        
        logger.info("Execution engine shutdown complete")


# CLI Commands
async def task_run(command: str, model: str = "claude", priority: str = "medium") -> None:
    """Run a new task"""
    from az_os.cli import app
    from az_os.core.interfaces import TaskPriority
    
    # Map priority string to enum
    priority_map = {
        "low": TaskPriority.LOW,
        "medium": TaskPriority.MEDIUM,
        "high": TaskPriority.HIGH,
        "urgent": TaskPriority.URGENT
    }
    
    task_priority = priority_map.get(priority.lower(), TaskPriority.MEDIUM)
    
    # Create and submit task
    from az_os.core.execution_engine import CommandExecutionEngine
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    engine = CommandExecutionEngine(repository)
    await engine.initialize()
    
    from az_os.data.models import Task
    task = Task(
        id=f"task-{datetime.now().isoformat()}",
        command=command,
        priority=task_priority.value,
        model=model
    )
    
    task_id = await engine.submit_task(task)
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    console.print(Panel(
        f"[bold]Task submitted successfully[/]\n" 
        f"Task ID: {task_id}\n"
        f"Command: {command}\n"
        f"Model: {model}\n"
        f"Priority: {priority}",
        title="Task Submission"
    ))


async def task_status(task_id: str) -> None:
    """Get status of a specific task"""
    from az_os.cli import app
    
    from az_os.core.execution_engine import CommandExecutionEngine
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    engine = CommandExecutionEngine(repository)
    await engine.initialize()
    
    status = await engine.get_task_status(task_id)
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    if "error" in status:
        console.print(Panel(
            f"[bold red]Error:[/] {status['error']}",
            title="Task Status",
            style="red"
        ))
    else:
        console.print(Panel(
            f"[bold]ID:[/] {status['id']}\n" 
            f"[bold]Command:[/] {status['command']}\n"
            f"[bold]Status:[/] {status['status']}\n"
            f"[bold]Priority:[/] {status['priority']}\n"
            f"[bold]Created:[/] {status['created_at']}\n"
            f"[bold]Started:[/] {status['started_at']}\n"
            f"[bold]Completed:[/] {status['completed_at']}\n"
            f"[bold]Duration:[/] {status['duration']}s",
            title="Task Status"
        ))


async def task_list(status: str = "all") -> None:
    """List all tasks with optional status filter"""
    from az_os.cli import app
    
    from az_os.core.execution_engine import CommandExecutionEngine
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    engine = CommandExecutionEngine(repository)
    await engine.initialize()
    
    # Map status string to enum
    from az_os.core.interfaces import TaskStatus
    status_map = {
        "all": None,
        "pending": TaskStatus.PENDING,
        "running": TaskStatus.RUNNING,
        "completed": TaskStatus.COMPLETED,
        "failed": TaskStatus.FAILED,
        "cancelled": TaskStatus.CANCELLED
    }
    
    filter_status = status_map.get(status.lower(), None)
    tasks = await engine.list_tasks(status=filter_status)
    
    from rich.console import Console
    from rich.table import Table
    
    console = Console()
    table = Table(title="Tasks")
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Command", style="magenta")
    table.add_column("Status", style="green")
    table.add_column("Priority", style="yellow")
    table.add_column("Created", style="blue")
    table.add_column("Duration", style="red")
    
    for task in tasks:
        table.add_row(
            task["id"],
            task["command"],
            task["status"],
            task["priority"],
            task["created_at"],
            f"{task['duration']}s" if task['duration'] else "N/A"
        )
    
    console.print(table)


# Register CLI commands
async def register_execution_commands() -> None:
    from az_os.cli import app
    
    @app.command()
    async def task_run(command: str, model: str = "claude", priority: str = "medium"):
        """Run a new task"""
        await az_os.core.execution_engine.task_run(command, model, priority)
    
    @app.command()
    async def task_status(task_id: str):
        """Get status of a specific task"""
        await az_os.core.execution_engine.task_status(task_id)
    
    @app.command()
    async def task_list(status: str = "all"):
        """List all tasks with optional status filter"""
        await az_os.core.execution_engine.task_list(status)