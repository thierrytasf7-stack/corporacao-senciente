import typer
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.theme import Theme
from rich.logging import RichHandler
import logging
import sys
from .metrics_commands import app as metrics_app
from .config_commands import app as config_app
from .logs_commands import app as logs_app


# Custom theme for rich
custom_theme = Theme({
    "info": "dim cyan",
    "warning": "dim yellow",
    "danger": "bold red",
    "success": "bold green",
})


# Main CLI app
app = typer.Typer(
    name="az",
    help="Agent Zero Operating System - CLI-first AI operating system",
    add_completion=True,
)


@app.callback()
def main_callback(
    ctx: typer.Context,
    verbose: bool = typer.Option(False, help="Enable verbose logging"),
    config: Optional[str] = typer.Option(None, help="Path to config file"),
):
    """Agent Zero Operating System CLI"""
    # Setup logging
    console = Console(theme=custom_theme)
    
    # Configure logging level
    log_level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(message)s",
        handlers=[RichHandler(console=console, show_time=True, show_path=False)],
    )
    
    # Set config path if provided
    if config:
        os.environ["AZ_CONFIG_PATH"] = config


@app.command()
async def version() -> None:
    """Show AZ-OS version and info"""
    console = Console(theme=custom_theme)
    
    panel = Panel(
        Text("AZ-OS (Agent Zero Operating System)", style="bold cyan"),
        title="Version 1.0.0",
        border_style="cyan",
    )
    
    console.print(panel)
    console.print("\n[bold]Core Features:[/bold]")
    console.print("  • CLI Framework with Typer")
    console.print("  • SQLite Persistence")
    console.print("  • LiteLLM Integration")
    console.print("  • MCP Client")
    console.print("  • Cost Tracking")
    console.print("  • Config Management")
    console.print("  • Logging & Observability")


@app.command()
async def help() -> None:
    """Show help and usage information"""
    console = Console(theme=custom_theme)
    
    console.print("[bold cyan]AZ-OS CLI[/bold cyan]")
    console.print("\n[bold]Core Commands:[/bold]")
    console.print("  az version          Show version info")
    console.print("  az help             Show this help")
    console.print("\n[bold]Metrics Commands:[/bold]")
    console.print("  az metrics show     Show cost metrics")
    console.print("  az metrics export   Export metrics to CSV")
    console.print("  az metrics task     Show task cost details")
    console.print("  az metrics model    Show model cost details")
    console.print("  az metrics aggregate Show aggregated stats")
    console.print("\n[bold]Config Commands:[/bold]")
    console.print("  az config show      Show current configuration")
    console.print("  az config set       Set configuration value")
    console.print("  az config validate  Validate configuration")
    console.print("  az config reset     Reset to defaults")
    console.print("  az config path      Show config file path")
    console.print("\n[bold]Logs Commands:[/bold]")
    console.print("  az logs show        Show recent logs")
    console.print("  az logs export      Export task logs")
    console.print("\n[bold]Usage Examples:[/bold]")
    console.print("  az metrics show")
    console.print("  az config set model=claude")
    console.print("  az logs export task-123")


# Add subcommands
app.add_typer(metrics_app, name="metrics")
app.add_typer(config_app, name="config")
app.add_typer(logs_app, name="logs")


if __name__ == "__main__":
    app()


# Error handling
@app.exception()
def handle_exception(exc: Exception) -> None:
    """Handle exceptions gracefully"""
    console = Console(theme=custom_theme)
    
    if isinstance(exc, typer.Exit):
        raise exc
    
    console.print(f"[bold red]Error:[/bold red] {exc}", style="danger")
    console.print("[bright_black]Run 'az help' for usage information[/bright_black]")
    raise typer.Exit(1)


# Graceful shutdown
@app.callback()
def shutdown_callback():
    """Handle graceful shutdown"""
    import atexit
    
    @atexit.register
    def cleanup():
        # Cleanup resources if needed
        pass