import asyncio
import os
import yaml
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from ..core.config_manager import ConfigManager, ConfigSchema


async def config_show() -> None:
    """Show current configuration"""
    console = Console()
    manager = ConfigManager()
    
    try:
        await manager.load_config()
        config = manager.get_config()
        
        # Display configuration summary
        panel = Panel(
            Text("Current Configuration", style="bold cyan"),
            title="Configuration",
            border_style="cyan"
        )
        console.print(panel)
        
        # Display config values
        table = Table(show_header=True, header_style="bold blue")
        table.add_column("Key", style="bright_white", width=12)
        table.add_column("Value", style="bright_green", width=20)
        table.add_column("Description", style="bright_yellow")
        
        for field in config.__fields__.values():
            value = getattr(config, field.name)
            if value is None:
                value_str = "None"
            elif isinstance(value, str):
                value_str = value
            else:
                value_str = str(value)
            
            table.add_row(
                field.name,
                value_str,
                field.description or "",
            )
        
        console.print(table)
        
        # Show environment overrides
        env_overrides = manager._env_overrides
        if env_overrides:
            console.print(f"\n[bold cyan]Environment Overrides:[/bold cyan]")
            for key, value in env_overrides.items():
                console.print(f"  [bright_white]{key}[/bright_white]: [bright_green]{value}[/bright_green]")
        
    except Exception as e:
        console.print(f"[bold red]Error loading configuration: {e}[/bold red]")
        raise SystemExit(1)


async def config_set(key: str, value: str) -> None:
    """Set configuration value"""
    console = Console()
    manager = ConfigManager()
    
    try:
        await manager.load_config()
        
        # Validate key
        if key not in manager._config.__fields__:
            console.print(f"[bold red]Invalid configuration key: {key}[/bold red]")
            console.print("[bright_yellow]Valid keys:[/bright_yellow]")
            for field in manager._config.__fields__.values():
                console.print(f"  [bright_white]{field.name}[/bright_white] - {field.description or ''}")
            raise SystemExit(1)
        
        # Convert value to appropriate type
        field = manager._config.__fields__[key]
        original_value = getattr(manager._config, key)
        
        try:
            if field.annotation == int:
                value = int(value)
            elif field.annotation == bool:
                value = value.lower() in ("true", "1", "yes")
            elif field.annotation == float:
                value = float(value)
            
            # Set and save
            manager.set(key, value)
            await manager.save_config()
            
            console.print(f"[bold green]Successfully set {key} to {value}[/bold_green]")
            console.print(f"[bright_black]Previous value: {original_value}[/bright_black]")
            
        except ValueError as e:
            console.print(f"[bold red]Invalid value for {key}: {e}[/bold_red]")
            raise SystemExit(1)
            
    except Exception as e:
        console.print(f"[bold red]Error setting configuration: {e}[/bold_red]")
        raise SystemExit(1)


async def config_validate() -> None:
    """Validate configuration"""
    console = Console()
    manager = ConfigManager()
    
    try:
        await manager.load_config()
        
        if manager.validate_config():
            console.print("[bold green]Configuration is valid[/bold_green]")
            
            # Show current config
            config = manager.get_config()
            console.print("[bright_black]Current configuration:[/bright_black]")
            for field in config.__fields__.values():
                value = getattr(config, field.name)
                console.print(f"  [bright_white]{field.name}[/bright_white]: [bright_green]{value}[/bright_green]")
                
        else:
            console.print("[bold red]Configuration is invalid[/bold_red]")
            raise SystemExit(1)
            
    except Exception as e:
        console.print(f"[bold red]Error validating configuration: {e}[/bold_red]")
        raise SystemExit(1)


async def config_reset() -> None:
    """Reset configuration to defaults"""
    console = Console()
    manager = ConfigManager()
    
    try:
        # Create default config
        default_config = ConfigSchema()
        
        # Save default config
        os.makedirs(os.path.dirname(manager.config_path), exist_ok=True)
        with open(manager.config_path, 'w') as f:
            yaml.safe_dump(default_config.model_dump(), f)
        
        console.print("[bold green]Configuration reset to defaults[/bold_green]")
        
    except Exception as e:
        console.print(f"[bold red]Error resetting configuration: {e}[/bold_red]")
        raise SystemExit(1)


async def config_path() -> None:
    """Show configuration file path"""
    console = Console()
    manager = ConfigManager()
    
    try:
        await manager.load_config()
        console.print(f"[bold cyan]Configuration file:[/bold cyan] [bright_green]{manager.config_path}[/bright_green]")
        
        # Show if file exists
        if os.path.exists(manager.config_path):
            console.print(f"[bright_black]File exists and is loaded[/bright_black]")
        else:
            console.print(f"[bright_black]File does not exist, using defaults[/bright_black]")
            
    except Exception as e:
        console.print(f"[bold red]Error getting configuration path: {e}[/bold_red]")
        raise SystemExit(1)


# Register CLI commands
app = typer.Typer()
app.command()(config_show)
app.command()(config_set)
app.command()(config_validate)
app.command()(config_reset)
app.command()(config_path)