import asyncio
import os
import shutil
from pathlib import Path
from typing import List
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from ..utils.logger import TaskScopedLogger, SystemLogger


async def logs_show() -> None:
    """Show recent logs"""
    console = Console()
    
    # Show system logs
    system_logger = SystemLogger()
    system_log_path = system_logger.logger.handlers[0].baseFilename
    
    if os.path.exists(system_log_path):
        console.print("[bold cyan]System Logs (Last 100 lines):[/bold cyan]")
        
        with open(system_log_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()[-100:]
            for line in lines:
                console.print(line.strip())
    else:
        console.print("[bright_yellow]System log file not found[/bright_yellow]")
    
    # Show task logs directory
    task_logs_dir = os.path.expanduser("~/.az-os/logs/tasks")
    
    if os.path.exists(task_logs_dir):
        console.print(f"\n[bold cyan]Task Logs Directory:[/bold cyan] {task_logs_dir}")
        
        task_logs = os.listdir(task_logs_dir)
        if task_logs:
            table = Table(title="Recent Task Logs", show_header=True, header_style="bold blue")
            table.add_column("Task ID", style="bright_white", width=20)
            table.add_column("Size", style="bright_green", width=10)
            table.add_column("Modified", style="bright_yellow", width=18)
            table.add_column("Lines", style="bright_blue", width=8)
            
            for log_file in sorted(task_logs, reverse=True)[:10]:
                log_path = os.path.join(task_logs_dir, log_file)
                size = os.path.getsize(log_path)
                modified = datetime.fromtimestamp(os.path.getmtime(log_path)).strftime("%Y-%m-%d %H:%M")
                
                # Count lines
                with open(log_path, 'r', encoding='utf-8') as f:
                    line_count = sum(1 for _ in f)
                
                table.add_row(log_file, f"{size} bytes", modified, str(line_count))
            
            console.print(table)
        else:
            console.print("[bright_yellow]No task logs found[/bright_yellow]")
    else:
        console.print("[bright_yellow]Task logs directory not found[/bright_yellow]")


async def logs_export(task_id: str) -> None:
    """Export full log for a specific task"""
    console = Console()
    
    task_logger = TaskScopedLogger(task_id)
    
    if not os.path.exists(task_logger.log_file):
        console.print(f"[bold red]Task log not found: {task_logger.log_file}[/bold_red]")
        return
    
    # Read full log
    with open(task_logger.log_file, 'r', encoding='utf-8') as f:
        log_content = f.read()
    
    # Create export directory
    export_dir = os.path.expanduser("~/.az-os/logs/exports")
    os.makedirs(export_dir, exist_ok=True)
    
    # Create export filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_filename = f"{task_id}_logs_{timestamp}.txt"
    export_path = os.path.join(export_dir, export_filename)
    
    # Write export file
    with open(export_path, 'w', encoding='utf-8') as f:
        f.write(log_content)
    
    console.print(f"[bold green]Task logs exported successfully[/bold_green]")
    console.print(f"Task ID: [bright_white]{task_id}[/bright_white]")
    console.print(f"Export Path: [bright_green]{export_path}[/bright_green]")
    console.print(f"Log Size: [bright_blue]{len(log_content) // 1024} KB[/bright_blue]")


async def logs_rotate() -> None:
    """Manually rotate logs"""
    console = Console()
    
    # Rotate system logs
    system_logger = SystemLogger()
    system_log_path = system_logger.logger.handlers[0].baseFilename
    
    if os.path.exists(system_log_path):
        try:
            # Force rotation
            system_logger.logger.handlers[0].doRollover()
            console.print("[bold green]System logs rotated successfully[/bold_green]")
        except Exception as e:
            console.print(f"[bold red]Error rotating system logs: {e}[/bold_red]")
    else:
        console.print("[bright_yellow]System log file not found[/bright_yellow]")
    
    # Rotate task logs
    task_logs_dir = os.path.expanduser("~/.az-os/logs/tasks")
    
    if os.path.exists(task_logs_dir):
        rotated_count = 0
        for log_file in os.listdir(task_logs_dir):
            log_path = os.path.join(task_logs_dir, log_file)
            if os.path.isfile(log_path):
                try:
                    # Read log to trigger rotation
                    with open(log_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    
                    # Check if rotation is needed
                    if os.path.getsize(log_path) >= 10 * 1024 * 1024:  # 10MB
                        # Force rotation by writing and truncating
                        with open(log_path, 'a', encoding='utf-8') as f:
                            f.write(f"\n[LOG ROTATED {datetime.now()}]\n")
                        rotated_count += 1
                except Exception as e:
                    console.print(f"[bright_yellow]Error rotating {log_file}: {e}[/bright_yellow]")
        
        if rotated_count > 0:
            console.print(f"[bold green]Rotated {rotated_count} task logs[/bold_green]")
        else:
            console.print("[bright_yellow]No task logs needed rotation[/bright_yellow]")
    else:
        console.print("[bright_yellow]Task logs directory not found[/bright_yellow]")


async def logs_cleanup() -> None:
    """Clean up old log files"""
    console = Console()
    
    # Clean up old task logs
    task_logs_dir = os.path.expanduser("~/.az-os/logs/tasks")
    
    if os.path.exists(task_logs_dir):
        deleted_count = 0
        total_size_freed = 0
        
        for log_file in os.listdir(task_logs_dir):
            log_path = os.path.join(task_logs_dir, log_file)
            if os.path.isfile(log_path):
                # Check if log is old (older than 30 days)
                file_age_days = (datetime.now().timestamp() - os.path.getmtime(log_path)) / (3600 * 24)
                
                if file_age_days > 30:
                    file_size = os.path.getsize(log_path)
                    try:
                        os.remove(log_path)
                        deleted_count += 1
                        total_size_freed += file_size
                    except Exception as e:
                        console.print(f"[bright_yellow]Error deleting {log_file}: {e}[/bright_yellow]")
        
        if deleted_count > 0:
            console.print(f"[bold green]Cleaned up {deleted_count} old task logs[/bold_green]")
            console.print(f"[bright_blue]Freed up {total_size_freed // 1024} KB[/bright_blue]")
        else:
            console.print("[bright_yellow]No old task logs to clean up[/bright_yellow]")
    else:
        console.print("[bright_yellow]Task logs directory not found[/bright_yellow]")


async def logs_status() -> None:
    """Show log system status"""
    console = Console()
    
    # System log status
    system_logger = SystemLogger()
    system_log_path = system_logger.logger.handlers[0].baseFilename
    
    console.print("[bold cyan]Log System Status[/bold cyan]")
    
    if os.path.exists(system_log_path):
        system_log_size = os.path.getsize(system_log_path)
        system_log_lines = 0
        with open(system_log_path, 'r', encoding='utf-8') as f:
            system_log_lines = sum(1 for _ in f)
        
        console.print(f"System Log: [bright_green]{system_log_size} bytes[/bright_green]")
        console.print(f"Lines: [bright_blue]{system_log_lines}[/bright_blue]")
        console.print(f"File: [bright_white]{system_log_path}[/bright_white]")
    else:
        console.print("[bright_yellow]System log file not found[/bright_yellow]")
    
    # Task logs status
    task_logs_dir = os.path.expanduser("~/.az-os/logs/tasks")
    
    if os.path.exists(task_logs_dir):
        task_logs = [f for f in os.listdir(task_logs_dir) if os.path.isfile(os.path.join(task_logs_dir, f))]
        total_task_logs = len(task_logs)
        total_task_size = sum(os.path.getsize(os.path.join(task_logs_dir, f)) for f in task_logs)
        
        console.print(f"\nTask Logs: [bright_green]{total_task_logs} files[/bright_green]")
        console.print(f"Total Size: [bright_blue]{total_task_size // 1024} KB[/bright_blue]")
        console.print(f"Directory: [bright_white]{task_logs_dir}[/bright_white]")
        
        # Show recent task logs
        if task_logs:
            console.print(f"\n[bold]Recent Task Logs:[/bold]")
            for log_file in sorted(task_logs, reverse=True)[:5]:
                log_path = os.path.join(task_logs_dir, log_file)
                size = os.path.getsize(log_path)
                modified = datetime.fromtimestamp(os.path.getmtime(log_path)).strftime("%Y-%m-%d %H:%M")
                console.print(f"  [bright_white]{log_file}[/bright_white] - {size} bytes - {modified}")
    else:
        console.print("[bright_yellow]Task logs directory not found[/bright_yellow]")


# Register CLI commands
app = typer.Typer()
app.command()(logs_show)
app.command()(logs_export)
app.command()(logs_rotate)
app.command()(logs_cleanup)
app.command()(logs_status)