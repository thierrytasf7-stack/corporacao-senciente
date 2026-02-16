import asyncio
import logging
import os
from typing import Any, Dict, Optional, Union
from pathlib import Path
from datetime import datetime

import yaml
from pydantic import BaseModel, Field, validator
from dynaconf import Dynaconf, Validator

logger = logging.getLogger(__name__)


class ConfigSchema(BaseModel):
    class Config:
        extra = "allow"
    
    # Database Configuration
    database: Dict[str, Any] = Field(default_factory=dict)
    database_url: str = Field(default="sqlite:///az_os.db")
    database_echo: bool = Field(default=False)
    
    # LiteLLM Configuration
    litellm: Dict[str, Any] = Field(default_factory=dict)
    litellm_provider: str = Field(default="anthropic")
    litellm_api_key: Optional[str] = Field(default=None)
    litellm_model: str = Field(default="claude-3-sonnet-20240229")
    litellm_temperature: float = Field(default=0.7)
    litellm_max_tokens: int = Field(default=4096)
    
    # MCP Configuration
    mcp: Dict[str, Any] = Field(default_factory=dict)
    mcp_server_url: str = Field(default="http://localhost:3000")
    mcp_auto_discover: bool = Field(default=True)
    
    # Logging Configuration
    logging: Dict[str, Any] = Field(default_factory=dict)
    log_level: str = Field(default="INFO")
    log_file: Optional[str] = Field(default=None)
    log_max_size: int = Field(default=10 * 1024 * 1024)  # 10MB
    log_backup_count: int = Field(default=5)
    
    # Cost Tracking Configuration
    cost_tracking: Dict[str, Any] = Field(default_factory=dict)
    cost_enabled: bool = Field(default=True)
    cost_currency: str = Field(default="USD")
    cost_budget: float = Field(default=100.0)
    cost_alert_percentage: float = Field(default=80.0)
    
    # Task Configuration
    task: Dict[str, Any] = Field(default_factory=dict)
    task_default_priority: str = Field(default="medium")
    task_default_model: str = Field(default="claude-3-sonnet-20240229")
    task_max_retries: int = Field(default=3)
    task_retry_delay: int = Field(default=30)  # seconds
    
    # CLI Configuration
    cli: Dict[str, Any] = Field(default_factory=dict)
    cli_theme: str = Field(default="default")
    cli_auto_complete: bool = Field(default=True)
    cli_show_progress: bool = Field(default=True)
    
    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level: {v}. Must be one of {valid_levels}")
        return v.upper()
    
    @validator('task_default_priority')
    def validate_priority(cls, v):
        valid_priorities = {"low", "medium", "high", "urgent"}
        if v.lower() not in valid_priorities:
            raise ValueError(f"Invalid priority: {v}. Must be one of {valid_priorities}")
        return v.lower()


class ConfigManager:
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or os.getenv("AZ_OS_CONFIG", "config.yaml")
        self._config = None
        self._dynaconf = None
        
    async def load_config(self) -> ConfigSchema:
        """Load configuration from file and environment variables"""
        if self._config:
            return self._config
            
        # Load from file
        config_data = self._load_from_file()
        
        # Override with environment variables
        config_data = self._apply_environment_overrides(config_data)
        
        # Validate and create config object
        self._config = ConfigSchema(**config_data)
        
        logger.info(f"Configuration loaded from {self.config_path}")
        return self._config
    
    def _load_from_file(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        config_path = Path(self.config_path)
        
        if not config_path.exists():
            logger.warning(f"Config file {self.config_path} not found, using defaults")
            return {}
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = yaml.safe_load(f) or {}
            return config_data
        except Exception as e:
            logger.error(f"Failed to load config file: {e}")
            return {}
    
    def _apply_environment_overrides(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply environment variable overrides"""
        # Environment variable prefix
        prefix = "AZ_OS_"
        
        for key, value in os.environ.items():
            if key.startswith(prefix):
                # Convert AZ_OS_DATABASE_URL to database.url
                config_key = key[len(prefix):].lower().replace('_', '.')
                
                # Set the value in the config dictionary
                current = config_data
                parts = config_key.split('.')
                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]
                current[parts[-1]] = value
                
                logger.debug(f"Overrode config {config_key} with environment variable {key}")
        
        return config_data
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value"""
        config = await self.load_config()
        keys = key.split('.')
        
        value = config
        for k in keys:
            if not hasattr(value, k):
                return default
            value = getattr(value, k)
        
        return value
    
    async def set(self, key: str, value: Any) -> None:
        """Set a configuration value"""
        config = await self.load_config()
        keys = key.split('.')
        
        # Update the config object
        current = config
        for k in keys[:-1]:
            if not hasattr(current, k):
                raise KeyError(f"Config key {k} not found")
            current = getattr(current, k)
        
        setattr(current, keys[-1], value)
        
        # Save to file
        await self.save_config(config)
        
        logger.info(f"Config {key} set to {value}")
    
    async def save_config(self, config: ConfigSchema) -> None:
        """Save configuration to file"""
        config_path = Path(self.config_path)
        config_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(config_path, 'w', encoding='utf-8') as f:
                yaml.dump(config.model_dump(), f, default_flow_style=False, sort_keys=False)
            logger.info(f"Configuration saved to {self.config_path}")
        except Exception as e:
            logger.error(f"Failed to save config file: {e}")
    
    async def get_all(self) -> Dict[str, Any]:
        """Get all configuration values"""
        config = await self.load_config()
        return config.model_dump()
    
    async def reset_to_defaults(self) -> None:
        """Reset configuration to default values"""
        self._config = None
        await self.save_config(ConfigSchema())
        logger.info("Configuration reset to defaults")


# CLI Commands
async def config_get(key: str = "") -> None:
    """Get configuration value"""
    from az_os.cli import app
    
    from az_os.core.config_manager import ConfigManager
    manager = ConfigManager()
    
    if key:
        value = await manager.get(key)
        if value is not None:
            from rich.console import Console
            from rich.panel import Panel
            
            console = Console()
            console.print(Panel(
                f"[bold]{key}:[/] {value}",
                title="Configuration",
                style="green"
            ))
        else:
            print(f"Config key '{key}' not found")
    else:
        # Show all config
        all_config = await manager.get_all()
        
        from rich.console import Console
        from rich.syntax import Syntax
        
        console = Console()
        syntax = Syntax(
            yaml.dump(all_config, sort_keys=False),
            "yaml",
            theme="monokai",
            line_numbers=True
        )
        console.print(syntax)


async def config_set(key: str, value: str) -> None:
    """Set configuration value"""
    from az_os.cli import app
    
    from az_os.core.config_manager import ConfigManager
    manager = ConfigManager()
    
    # Convert value to appropriate type
    # Try to parse as YAML first, then fallback to string
    try:
        import yaml
        parsed_value = yaml.safe_load(value)
    except:
        parsed_value = value
    
    await manager.set(key, parsed_value)
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    console.print(Panel(
        f"[bold]{key}:[/] {parsed_value}\n" 
        f"[green]Configuration updated successfully[/]",
        title="Configuration",
        style="green"
    ))


async def config_reset() -> None:
    """Reset configuration to defaults"""
    from az_os.cli import app
    
    from az_os.core.config_manager import ConfigManager
    manager = ConfigManager()
    
    await manager.reset_to_defaults()
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    console.print(Panel(
        "[bold green]Configuration reset to defaults[/]",
        title="Configuration",
        style="green"
    ))


async def config_show() -> None:
    """Show current configuration"""
    from az_os.cli import app
    
    from az_os.core.config_manager import ConfigManager
    manager = ConfigManager()
    
    all_config = await manager.get_all()
    
    from rich.console import Console
    from rich.syntax import Syntax
    
    console = Console()
    syntax = Syntax(
        yaml.dump(all_config, sort_keys=False),
        "yaml",
        theme="monokai",
        line_numbers=True
    )
    console.print(syntax)


# Register CLI commands
async def register_config_commands() -> None:
    from az_os.cli import app
    
    @app.command()
    async def config_get(key: str = ""):
        """Get configuration value"""
        await az_os.core.config_manager.config_get(key)
    
    @app.command()
    async def config_set(key: str, value: str):
        """Set configuration value"""
        await az_os.core.config_manager.config_set(key, value)
    
    @app.command()
    async def config_reset():
        """Reset configuration to defaults"""
        await az_os.core.config_manager.config_reset()
    
    @app.command()
    async def config_show():
        """Show current configuration"""
        await az_os.core.config_manager.config_show()