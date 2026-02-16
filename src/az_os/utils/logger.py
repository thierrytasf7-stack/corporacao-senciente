import os
import sys
import logging
import logging.handlers
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Union
from rich.console import Console
from rich.theme import Theme
from rich.logging import RichHandler


class StructuredMessage:
    def __init__(self, message: str, **kwargs):
        self.message = message
        self.kwargs = kwargs
    
    def to_dict(self) -> Dict:
        return {"message": self.message, **self.kwargs}


class TaskScopedLogger:
    def __init__(self, task_id: str, log_dir: str = "~/.az-os/logs/tasks"):
        self.task_id = task_id
        self.log_dir = os.path.expanduser(log_dir)
        self.log_file = os.path.join(self.log_dir, f"{task_id}.log")
        self.logger = self._setup_logger()
    
    def _setup_logger(self) -> logging.Logger:
        """Setup logger for task-scoped logging"""
        os.makedirs(self.log_dir, exist_ok=True)
        
        logger = logging.getLogger(f"task_{self.task_id}")
        logger.setLevel(logging.DEBUG)
        logger.propagate = False
        
        # Clear existing handlers
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        # File handler with rotation
        file_handler = logging.handlers.RotatingFileHandler(
            self.log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding="utf-8"
        )
        file_handler.setLevel(logging.DEBUG)
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # Formatters
        file_formatter = logging.Formatter(
            "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
        )
        console_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(message)s"
        )
        
        file_handler.setFormatter(file_formatter)
        console_handler.setFormatter(console_formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def debug(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log debug message"""
        if isinstance(message, StructuredMessage):
            self.logger.debug(message.message, extra=message.kwargs)
        else:
            self.logger.debug(message, extra=kwargs)
    
    def info(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log info message"""
        if isinstance(message, StructuredMessage):
            self.logger.info(message.message, extra=message.kwargs)
        else:
            self.logger.info(message, extra=kwargs)
    
    def warning(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log warning message"""
        if isinstance(message, StructuredMessage):
            self.logger.warning(message.message, extra=message.kwargs)
        else:
            self.logger.warning(message, extra=kwargs)
    
    def error(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log error message"""
        if isinstance(message, StructuredMessage):
            self.logger.error(message.message, extra=message.kwargs)
        else:
            self.logger.error(message, extra=kwargs)
    
    def exception(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log exception with traceback"""
        if isinstance(message, StructuredMessage):
            self.logger.exception(message.message, extra=kwargs)
        else:
            self.logger.exception(message, extra=kwargs)
    
    def get_logs(self, lines: int = 100) -> str:
        """Get last N lines from log file"""
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                lines_list = f.readlines()
            return ''.join(lines_list[-lines:])
        except FileNotFoundError:
            return "Log file not found"


class SystemLogger:
    def __init__(self, log_dir: str = "~/.az-os/logs"):
        self.log_dir = os.path.expanduser(log_dir)
        self.logger = self._setup_system_logger()
    
    def _setup_system_logger(self) -> logging.Logger:
        """Setup system-wide logger"""
        os.makedirs(self.log_dir, exist_ok=True)
        
        logger = logging.getLogger("az_os")
        logger.setLevel(logging.DEBUG)
        logger.propagate = False
        
        # Clear existing handlers
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        # File handler with rotation
        file_handler = logging.handlers.RotatingFileHandler(
            os.path.join(self.log_dir, "system.log"),
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding="utf-8"
        )
        file_handler.setLevel(logging.DEBUG)
        
        # Console handler with Rich formatting
        console = Console()
        rich_handler = RichHandler(
            console=console,
            show_time=True,
            show_path=False,
            markup=True
        )
        rich_handler.setLevel(logging.INFO)
        
        # Formatters
        file_formatter = logging.Formatter(
            "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
        )
        
        file_handler.setFormatter(file_formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(rich_handler)
        
        return logger
    
    def debug(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log debug message"""
        if isinstance(message, StructuredMessage):
            self.logger.debug(message.message, extra=message.kwargs)
        else:
            self.logger.debug(message, extra=kwargs)
    
    def info(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log info message"""
        if isinstance(message, StructuredMessage):
            self.logger.info(message.message, extra=message.kwargs)
        else:
            self.logger.info(message, extra=kwargs)
    
    def warning(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log warning message"""
        if isinstance(message, StructuredMessage):
            self.logger.warning(message.message, extra=message.kwargs)
        else:
            self.logger.warning(message, extra=kwargs)
    
    def error(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log error message"""
        if isinstance(message, StructuredMessage):
            self.logger.error(message.message, extra=message.kwargs)
        else:
            self.logger.error(message, extra=kwargs)
    
    def exception(self, message: Union[str, StructuredMessage], **kwargs) -> None:
        """Log exception with traceback"""
        if isinstance(message, StructuredMessage):
            self.logger.exception(message.message, extra=kwargs)
        else:
            self.logger.exception(message, extra=kwargs)


# CLI Commands
async def logs_show() -> None:
    """Show last 100 log lines"""
    from az_os.cli import app
    from rich.console import Console
    from rich.table import Table
    
    console = Console()
    
    # Show system logs
    system_logger = SystemLogger()
    system_logs = system_logger.logger.handlers[0].baseFilename
    
    console.print("[bold cyan]System Logs:[/bold cyan]")
    with open(system_logs, 'r', encoding='utf-8') as f:
        lines = f.readlines()[-100:]
        for line in lines:
            console.print(line.strip())
    
    # Show task logs
    task_logs_dir = os.path.expanduser("~/.az-os/logs/tasks")
    if os.path.exists(task_logs_dir):
        console.print(f"\n[bold cyan]Task Logs Directory:[/bold cyan] {task_logs_dir}")
        task_logs = os.listdir(task_logs_dir)
        if task_logs:
            table = Table(title="Recent Task Logs")
            table.add_column("Task ID", style="cyan")
            table.add_column("Size", style="green")
            table.add_column("Modified", style="yellow")
            
            for log_file in sorted(task_logs, reverse=True)[:10]:
                log_path = os.path.join(task_logs_dir, log_file)
                size = os.path.getsize(log_path)
                modified = datetime.fromtimestamp(os.path.getmtime(log_path)).strftime("%Y-%m-%d %H:%M")
                table.add_row(log_file, f"{size} bytes", modified)
            
            console.print(table)


async def logs_export(task_id: str) -> None:
    """Export full log for a specific task"""
    from az_os.cli import app
    
    task_logger = TaskScopedLogger(task_id)
    log_content = task_logger.get_logs(lines=10000)  # Get all lines
    
    output_path = f"{task_id}_full_log.txt"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(log_content)
    
    print(f"Full log for task {task_id} exported to {output_path}")


# Register CLI commands
app = typer.Typer()
app.command()(logs_show)
app.command()(logs_export)