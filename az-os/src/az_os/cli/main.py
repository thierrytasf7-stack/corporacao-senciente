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
    name="az",
    help="Agent Zero Operating System - CLI-first AI operating system",
    add_completion=True,
)

config = Config()
db = Database(config)
llm_client = LLMClient(config, db)
execution_engine = ExecutionEngine(db, llm_client)

@app.callback()
def main(
    ctx: typer.Context,
    verbose: bool = typer.Option(False, help="Enable verbose output"),
    debug: bool = typer.Option(False, help="Enable debug mode"),
):
    """Agent Zero Operating System - CLI-first AI operating system."""
    ctx.obj = {
        "verbose": verbose,
        "debug": debug,
        "config": config,
        "llm_client": llm_client,
        "db": db,
        "execution_engine": execution_engine,
    }
    
    if debug:
        typer.echo(f"Debug mode enabled")
        typer.echo(f"Config: {config.settings}")

@app.command()
def task(
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
def config(
    key: Optional[str] = Option(None, help="Configuration key"),
    value: Optional[str] = Option(None, help="Configuration value"),
    list_all: bool = Option(False, help="List all configuration"),
):
    """Manage configuration settings."""
    if list_all:
        typer.echo("Current configuration:")
        for k, v in config.settings.items():
            typer.echo(f"  {k}: {v}")
        return
    
    if key and value:
        config.set(key, value)
        typer.echo(f"Set {key} = {value}")
    elif key:
        value = config.get(key)
        if value is not None:
            typer.echo(f"{key}: {value}")
        else:
            typer.echo(f"Key {key} not found", err=True)
            raise typer.Exit(1)
    else:
        typer.echo("Usage: az config [key] [value] --list", err=True)
        raise typer.Exit(1)

@app.command()
def health():
    """Check system health and status."""
    typer.echo("System Health Check:")
    typer.echo(f"  Status: ✅ OK")
    typer.echo(f"  Version: {__version__}")
    typer.echo(f"  Python: {__import__('sys').version}")
    typer.echo(f"  Config loaded: {bool(config.settings)}")
    
    try:
        db_status = db.check()
        typer.echo(f"  Database: ✅ Connected")
        typer.echo(f"  Tables: {len(db_status.tables)}")
    except Exception as e:
        typer.echo(f"  Database: ❌ Error - {e}", err=True)
    
    try:
        llm_status = llm_client.check()
        typer.echo(f"  LLM Client: ✅ Connected")
        typer.echo(f"  Models: {len(llm_status.models)}")
    except Exception as e:
        typer.echo(f"  LLM Client: ❌ Error - {e}", err=True)

if __name__ == "__main__":
    app()