from __future__ import annotations
import asyncio
import json
from typing import Any

from typer import Typer, Option

from az_os.core.cost_tracker import CostTracker
from az_os.core.config_manager import ConfigManager, initialize_default_config
from az_os.utils.logger import StructuredLogger


app = Typer()


@app.command()
async def init() -> None:
    """Initialize AZ-OS system and create default configuration."""
    await initialize_default_config()
    print("AZ-OS initialized successfully.")


@app.command()
async def status() -> None:
    """Show system status and metrics."""
    tracker = CostTracker()
    manager = ConfigManager()
    
    total_cost = await tracker.get_total_cost()
    config = manager.get_config()
    
    print("AZ-OS System Status:")
    print(f"  Total Cost: ${total_cost:.4f}")
    print(f"  Model: {config.model}")
    print(f"  Timeout: {config.timeout}s")
    print(f"  Max Retries: {config.max_retries}")
    print(f"  Log Level: {config.log_level}")


@app.command()
async def metrics() -> None:
    """Access metrics commands."""
    from az_os.cli.commands.metrics import app as metrics_app
    await metrics_app()


@app.command()
async def config() -> None:
    """Access configuration commands."""
    from az_os.cli.commands.config import app as config_app
    await config_app()


@app.command()
async def logs() -> None:
    """Access logging commands."""
    from az_os.cli.commands.logs import app as logs_app
    await logs_app()