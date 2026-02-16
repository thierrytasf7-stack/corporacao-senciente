from typing import Any, Dict, List, Optional
from ..core import TaskScheduler, ScheduledTask, TaskExecution, TaskPriority, TaskStatus
import click
import time


@click.group()
def scheduler():
    """Manage task scheduler."""
    pass


@scheduler.command()
def status():
    """Show scheduler status."""
    # Initialize scheduler
    scheduler = TaskScheduler(max_concurrent_tasks=5)
    
    # Add some demo tasks
    _add_demo_tasks(scheduler)
    
    # Get status
    status = scheduler.get_queue_status()
    
    click.echo("Scheduler Status:")
    click.echo(f"Total tasks: {status['total_tasks']}")
    click.echo(f"Pending tasks: {status['pending_tasks']}")
    click.echo(f"Running tasks: {status['running_tasks']}")
    click.echo(f"Max concurrent: {status['max_concurrent']}")
    click.echo(f"Current concurrent: {status['current_concurrent']}")
    click.echo(f"Resource limits: {status['resource_limits']}")


@scheduler.command()
def start():
    """Start the scheduler."""
    scheduler = TaskScheduler(max_concurrent_tasks=5)
    _add_demo_tasks(scheduler)
    scheduler.start_scheduler()
    click.echo("Scheduler started")


@scheduler.command()
def stop():
    """Stop the scheduler."""
    scheduler = TaskScheduler(max_concurrent_tasks=5)
    scheduler.stop_scheduler()
    click.echo("Scheduler stopped")


@scheduler.command()
def list():
    """List all tasks."""
    scheduler = TaskScheduler(max_concurrent_tasks=5)
    _add_demo_tasks(scheduler)
    
    tasks = scheduler.get_all_tasks()
    
    click.echo("All Tasks:")
    for task in tasks:
        click.echo(f"\nTask ID: {task['task_id']}")
        click.echo(f"Status: {task['status']}")
        click.echo(f"Type: {task['type']}")
        if 'priority' in task:
            click.echo(f"Priority: {task['priority']}")
        if 'dependencies' in task and task['dependencies']:
            click.echo(f"Dependencies: {', '.join(task['dependencies'])}")


@scheduler.command()
def execute():
    """Execute scheduled tasks."""
    scheduler = TaskScheduler(max_concurrent_tasks=5)
    _add_demo_tasks(scheduler)
    
    executed = scheduler.execute_scheduled()
    
    click.echo(f"Executed {len(executed)} tasks:")
    for execution in executed:
        click.echo(f"\nTask ID: {execution.task_id}")
        click.echo(f"Status: {execution.status.value}")
        if execution.status == TaskStatus.COMPLETED:
            click.echo(f"Result: {execution.result}")
        elif execution.status == TaskStatus.FAILED:
            click.echo(f"Error: {execution.error}")
        click.echo(f"Duration: {execution.end_time - execution.start_time:.2f}s")


def _add_demo_tasks(scheduler: TaskScheduler):
    """Add demo tasks to scheduler."""
    # Demo task function
    def demo_task(name: str):
        time.sleep(1)
        return f"Task {name} completed successfully"
    
    # Add tasks
    scheduler.schedule(
        task_func=demo_task,
        task_id="task_1",
        priority=TaskPriority.HIGH,
        args=("High Priority Task",)
    )
    
    scheduler.schedule(
        task_func=demo_task,
        task_id="task_2",
        priority=TaskPriority.MEDIUM,
        args=("Medium Priority Task",)
    )
    
    scheduler.schedule(
        task_func=demo_task,
        task_id="task_3",
        priority=TaskPriority.LOW,
        args=("Low Priority Task",)
    )
    
    # Task with dependencies
    scheduler.schedule(
        task_func=demo_task,
        task_id="task_4",
        priority=TaskPriority.HIGH,
        args=("Dependent Task",),
        dependencies=["task_1", "task_2"]
    )


if __name__ == '__main__':
    scheduler()
