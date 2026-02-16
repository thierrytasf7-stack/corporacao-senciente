from typing import Optional, List, Dict, Any
from datetime import datetime
import typer
from typer import Argument, Option, Prompt, Abort
from pathlib import Path

from az_os.core.config import Config
from az_os.core.storage import Database, TaskStatus, TaskPriority
from az_os.core.llm_client import LLMClient
from az_os.core.execution_engine import ExecutionEngine

app = typer.Typer(
    name="task",
    help="Task management and execution commands",
    add_completion=True,
)

config = Config()
db = Database(config)
llm_client = LLMClient(config, db)
execution_engine = ExecutionEngine(db, llm_client)

@app.command()
def run(
    command: str = Argument(..., help="Command to execute"),
    model: Optional[str] = Option(None, help="LLM model to use"),
    priority: str = Option("medium", help="Task priority"),
    dry_run: bool = Option(False, help="Show what would be executed"),
    interactive: bool = Option(False, help="Interactive mode"),
):
    """Execute a task using the AI engine."""
    if dry_run:
        typer.echo(f"Would execute: {command}")
        typer.echo(f"Model: {model or config.settings.llm.default_model}")
        typer.echo(f"Priority: {priority}")
        raise typer.Exit()
    
    typer.echo(f"Executing task: {command}")
    typer.echo(f"Using model: {model or config.settings.llm.default_model}")
    typer.echo(f"Priority: {priority}")
    
    task = execution_engine.create_task(
        command=command,
        model=model,
        priority=priority,
    )
    
    result = execution_engine.execute_task(task)
    
    typer.echo(f"Task completed: {result}")

@app.command()
def list(
    status: Optional[str] = Option(None, help="Filter by status"),
    priority: Optional[str] = Option(None, help="Filter by priority"),
    limit: int = Option(20, help="Number of tasks to show"),
    offset: int = Option(0, help="Offset for pagination"),
):
    """List all tasks with optional filters."""
    tasks = execution_engine.list_tasks(status=status, priority=priority, limit=limit, offset=offset)
    
    if not tasks:
        typer.echo("No tasks found")
        return
    
    typer.echo(f"Found {len(tasks)} tasks:")
    for task in tasks:
        typer.echo(f"  {task.id} - {task.command[:50]}... ({task.status})")

@app.command()
def pause(
    task_id: str = Argument(..., help="Task ID to pause"),
):
    """Pause a running task."""
    success = execution_engine.pause_task(task_id)
    if success:
        typer.echo(f"Task {task_id} paused successfully")
    else:
        typer.echo(f"Task {task_id} not found or not running", err=True)
        raise typer.Exit(1)

@app.command()
def resume(
    task_id: str = Argument(..., help="Task ID to resume"),
):
    """Resume a paused task."""
    success = execution_engine.resume_task(task_id)
    if success:
        typer.echo(f"Task {task_id} resumed successfully")
    else:
        typer.echo(f"Task {task_id} not found or not paused", err=True)
        raise typer.Exit(1)

@app.command()
def cancel(
    task_id: str = Argument(..., help="Task ID to cancel"),
):
    """Cancel a task."""
    success = execution_engine.cancel_task(task_id)
    if success:
        typer.echo(f"Task {task_id} cancelled successfully")
    else:
        typer.echo(f"Task {task_id} not found", err=True)
        raise typer.Exit(1)

@app.command()
def show(
    task_id: str = Argument(..., help="Task ID to show"),
):
    """Show detailed information about a task."""
    task = execution_engine.get_task(task_id)
    if not task:
        typer.echo(f"Task {task_id} not found", err=True)
        raise typer.Exit(1)
    
    typer.echo(f"Task ID: {task.id}")
    typer.echo(f"Command: {task.command}")
    typer.echo(f"Status: {task.status}")
    typer.echo(f"Priority: {task.priority}")
    typer.echo(f"Model: {task.model}")
    typer.echo(f"Cost: ${task.cost:.4f}")
    typer.echo(f"Created: {task.created_at}")
    typer.echo(f"Updated: {task.updated_at}")

@app.command()
def logs(
    task_id: str = Argument(..., help="Task ID to show logs for"),
    level: Optional[str] = Option(None, help="Log level filter"),
    limit: int = Option(50, help="Number of log entries to show"),
):
    """Show logs for a specific task."""
    logs = execution_engine.get_task_logs(task_id, level=level, limit=limit)
    
    if not logs:
        typer.echo("No logs found")
        return
    
    typer.echo(f"Logs for task {task_id}:")
    for log in logs:
        typer.echo(f"  [{log.timestamp}] {log.level.upper()}: {log.message}")

@app.command()
def metrics(
    task_id: Optional[str] = Option(None, help="Task ID to show metrics for"),
):
    """Show metrics for a task or all tasks."""
    if task_id:
        metrics = execution_engine.get_task_metrics(task_id)
        if not metrics:
            typer.echo(f"No metrics found for task {task_id}")
            return
        
        typer.echo(f"Metrics for task {task_id}:")
        for metric in metrics:
            typer.echo(f"  {metric.metric_name}: {metric.value}")
    else:
        all_metrics = execution_engine.get_all_metrics()
        typer.echo(f"Overall metrics:")
        for metric_name, value in all_metrics.items():
            typer.echo(f"  {metric_name}: {value}")