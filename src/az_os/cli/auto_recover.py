from typing import Any, Dict, List, Optional
from ..core import SelfHealer, ErrorType, RecoveryStrategy
from ..core import TaskState, TaskResult, RecoveryAttempt
import click


@click.command()
@click.option('--task-id', '-t', required=True, help='Task ID to recover')
@click.option('--max-retries', '-r', default=3, help='Maximum recovery attempts')
@click.option('--verbose', '-v', is_flag=True, help='Show detailed recovery information')
def auto_recover(task_id: str, max_retries: int, verbose: bool):
    """Automatically recover a failed task."""
    # Initialize self-healer
    healer = SelfHealer(max_retries=max_retries)
    
    # Create dummy task and result for demonstration
    task = TaskState(
        task_id=task_id,
        task_type="demo",
        description="Sample task for recovery demonstration",
        created_at=time.time(),
        priority="medium"
    )
    
    result = TaskResult(
        task_id=task_id,
        status="error",
        output="",
        error="Simulated task failure",
        metrics={}
    )
    
    click.echo(f"Starting automatic recovery for task {task_id}...")
    click.echo(f"Max retries: {max_retries}")
    
    # Detect error
    error = healer.detect_error(task, result)
    if not error:
        click.echo("No error detected. Task may not need recovery.")
        return
    
    click.echo(f"Error detected: {error.error_message}")
    click.echo(f"Error type: {error.error_type.value}")
    
    # Perform recovery
    new_result, attempts = healer.auto_recover(task, result)
    
    click.echo(f"\nRecovery attempts: {len(attempts)}")
    
    if verbose:
        _print_recovery_details(attempts)
    
    if new_result.status == "completed":
        click.echo(f"\n✅ Task {task_id} successfully recovered!")
        click.echo(f"Final output: {new_result.output}")
    else:
        click.echo(f"\n❌ Recovery failed after {max_retries} attempts")
        click.echo(f"Last error: {new_result.error}")


def _print_recovery_details(attempts: List[RecoveryAttempt]):
    """Print detailed recovery information."""
    for i, attempt in enumerate(attempts, 1):
        click.echo(f"\nAttempt {i}:")
        click.echo(f"  Strategy: {attempt.strategy.value}")
        click.echo(f"  Success: {'✅' if attempt.success else '❌'}")
        click.echo(f"  Duration: {attempt.duration:.2f}s")
        if attempt.error_message:
            click.echo(f"  Error: {attempt.error_message}")


if __name__ == '__main__':
    auto_recover()
