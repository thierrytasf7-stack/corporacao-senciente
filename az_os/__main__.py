import asyncio
import logging
from typing import Any, Dict, List, Optional, Union
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from az_os.core.config_manager import ConfigManager
from az_os.core.execution_engine import CommandExecutionEngine
from az_os.core.cost_tracker import CostTracker
from az_os.core.mcp_client import MCPClient
from az_os.data.sqlite_repository import SQLiteRepository

logger = logging.getLogger(__name__)
console = Console()


async def initialize_system() -> Dict[str, Any]:
    """Initialize the AZ-OS system"""
    
    # Initialize database
    repository = SQLiteRepository()
    await repository.initialize()
    
    # Initialize config manager
    config_manager = ConfigManager()
    config = await config_manager.load_config()
    
    # Initialize execution engine
    execution_engine = CommandExecutionEngine(repository)
    await execution_engine.initialize()
    
    # Initialize cost tracker
    cost_tracker = CostTracker(repository)
    
    # Initialize MCP client
    mcp_client = MCPClient()
    await mcp_client.connect()
    
    # Check budget status
    budget_status = await cost_tracker.check_budget()
    
    return {
        "repository": repository,
        "config_manager": config_manager,
        "execution_engine": execution_engine,
        "cost_tracker": cost_tracker,
        "mcp_client": mcp_client,
        "budget_status": budget_status,
        "config": config
    }


async def system_status() -> None:
    """Show system status"""
    
    # Initialize system
    system = await initialize_system()
    
    # Get system information
    from rich.panel import Panel
    from rich.syntax import Syntax
    
    # System info panel
    system_info = f"[bold]AZ-OS System Status[/]\n"
    system_info += f"[bold]Database:[/] Initialized\n"
    system_info += f"[bold]Config:[/] Loaded\n"
    system_info += f"[bold]Execution Engine:[/] Running\n"
    system_info += f"[bold]Cost Tracker:[/] Active\n"
    system_info += f"[bold]MCP Client:[/] Connected\n"
    
    if "error" in system["budget_status"]:
        system_info += f"[bold red]Budget:[/] {system['budget_status']['error']}[/]\n"
    else:
        alert_style = "red" if system["budget_status"]["alert_triggered"] else "green"
        alert_text = "[bold red]ALERT: Budget threshold exceeded![/]" if system["budget_status"]["alert_triggered"] else "[bold green]Budget OK[/]"
        system_info += f"[bold]Budget:[/] ${system['budget_status']['spent_amount']:.2f} / ${system['budget_status']['budget_amount']:.2f} ({system['budget_status']['spent_percentage']:.1f}%)\n"
        system_info += f"[bold]Status:[/] {alert_text}\n"
    
    console.print(Panel(
        system_info,
        title="System Status",
        style="blue"
    ))


async def show_welcome() -> None:
    """Show welcome message"""
    
    welcome_text = """
    [bold green]Welcome to AZ-OS[/]
    [bold]Agent Zero Operating System[/]
    
    [bold blue]CLI-First AI Operating System[/]
    [bold]Version: 1.0.0[/]
    [bold]Status: System Ready[/]
    
    [bold]Commands:[/]
    • az task run <command> - Execute a task
    • az task list - List all tasks
    • az cost show - Show cost metrics
    • az tools list - List available tools
    • az config get - Get configuration
    
    [bold]Documentation:[/]
    • az --help - Show all commands
    • az <command> --help - Show command help
    """
    
    console.print(welcome_text)


async def main() -> None:
    """Main entry point"""
    
    # Initialize system
    system = await initialize_system()
    
    # Show welcome message
    await show_welcome()
    
    # Show system status
    await system_status()


if __name__ == "__main__":
    asyncio.run(main())