import typer
from typing import Optional
from datetime import datetime
from pathlib import Path
from ..storage import Storage
from ..core.rag_engine import RAGEngine
from ..core.checkpoint_manager import CheckpointManager

app = typer.Typer()

storage = Storage()
rag_engine = RAGEngine(storage, None)  # LLMClient will be injected later
checkpoint_manager = CheckpointManager(storage)


@app.command()
def show(task_id: str):
    """Show detailed analysis of a task"""
    try:
        task = storage.get_task(task_id)
        if not task:
            typer.echo(f"Task {task_id} not found")
            raise typer.Exit(1)
        
        typer.echo(f"\nTask Analysis: {task_id}")
        typer.echo("=" * 50)
        typer.echo(f"Title: {task.get('title', 'No title')}")
        typer.echo(f"Description: {task.get('description', 'No description')}")
        typer.echo(f"Status: {task.get('status', 'unknown')}")
        typer.echo(f"Created: {task.get('created_at', 'Unknown')}")
        typer.echo(f"Updated: {task.get('updated_at', 'Unknown')}")
        
        # Show checkpoints
        checkpoints = checkpoint_manager.list_checkpoints(task_id)
        if checkpoints:
            typer.echo(f"\nCheckpoints ({len(checkpoints)}):")
            for cp in checkpoints:
                typer.echo(f"  • {cp['checkpoint_id'][:12]}... - {cp['description']}")
                typer.echo(f"    Timestamp: {cp['timestamp']}")
                typer.echo(f"    Git: {cp.get('git_commit', 'None')}")
                typer.echo(f"    State: {cp['state_size']} items")
        else:
            typer.echo(f"\nNo checkpoints found")
        
        # Show RAG context
        context = rag_engine.get_context(task_id)
        if context:
            typer.echo(f"\nRAG Context ({len(context.split('### Context')) - 1} sources):")
            typer.echo("=" * 50)
            typer.echo(context[:2000])  # Limit output
            if len(context) > 2000:
                typer.echo("... (truncated)")
        else:
            typer.echo(f"\nNo RAG context available")
        
        # Show task state
        task_state = storage.get_task_state(task_id)
        if task_state:
            typer.echo(f"\nTask State:")
            typer.echo("=" * 50)
            for key, value in task_state.items():
                typer.echo(f"  {key}: {value}")
        
    except Exception as e:
        typer.echo(f"Error analyzing task: {e}")
        raise typer.Exit(1)


@app.command()
def stats():
    """Show system statistics"""
    try:
        # Task statistics
        tasks = storage.list_tasks()
        completed = sum(1 for t in tasks if t.get('status') == 'completed')
        pending = sum(1 for t in tasks if t.get('status') == 'pending')
        failed = sum(1 for t in tasks if t.get('status') == 'failed')
        
        typer.echo(f"\nSystem Statistics")
        typer.echo("=" * 50)
        typer.echo(f"Total Tasks: {len(tasks)}")
        typer.echo(f"Completed: {completed}")
        typer.echo(f"Pending: {pending}")
        typer.echo(f"Failed: {failed}")
        
        # Checkpoint statistics
        checkpoint_dirs = Path(".az-os/checkpoints").glob("*/")
        total_checkpoints = sum(len(list(d.glob("*.json"))) for d in checkpoint_dirs)
        typer.echo(f"\nCheckpoints: {total_checkpoints}")
        
        # Memory statistics
        memory_manager = MemoryManager(storage)
        stats = memory_manager.get_memory_stats()
        typer.echo(f"\nMemory:")
        typer.echo(f"  Total Memories: {stats['total_memories']}")
        typer.echo(f"  Total Usage: {stats['total_usage']}")
        typer.echo(f"  Avg Usage/Memory: {stats['avg_usage_per_memory']:.2f}")
        typer.echo(f"  Priority Distribution: {stats['priority_distribution']}")
        typer.echo(f"  Top Tags: {stats['top_tags']}")
        
    except Exception as e:
        typer.echo(f"Error getting stats: {e}")
        raise typer.Exit(1)


@app.command()
def health():
    """Check system health"""
    try:
        # Check storage
        storage_health = storage.health_check()
        
        # Check ChromaDB
        try:
            rag_engine.auto_index_project_docs()
            chroma_health = "Healthy"
        except Exception as e:
            chroma_health = f"Failed: {e}"
        
        # Check Git
        try:
            checkpoint_manager._init_git_repo()
            git_health = "Healthy"
        except Exception as e:
            git_health = f"Failed: {e}"
        
        typer.echo(f"\nSystem Health Check")
        typer.echo("=" * 50)
        typer.echo(f"Storage: {storage_health}")
        typer.echo(f"ChromaDB: {chroma_health}")
        typer.echo(f"Git: {git_health}")
        
    except Exception as e:
        typer.echo(f"Error checking health: {e}")
        raise typer.Exit(1)
