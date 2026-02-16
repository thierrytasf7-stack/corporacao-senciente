import os
import yaml
import asyncio
from pathlib import Path
from typing import Any, Dict, Optional, TypeVar, Generic
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from ..storage import get_config_path


T = TypeVar("T")


class ConfigSchema(BaseSettings):
    model: str = Field(default="claude", description="Default AI model")
    timeout: int = Field(default=30, description="Request timeout in seconds")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    log_level: str = Field(default="INFO", description="Logging level")
    api_key: Optional[str] = Field(default=None, description="API key for AI services")
    base_url: str = Field(default="https://api.lite.llm", description="Base URL for LiteLLM")
    
    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = {"DEBUG", "INFO", "WARN", "ERROR"}
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level: {v}. Must be one of {valid_levels}")
        return v.upper()


class ConfigManager:
    def __init__(self):
        self.config_path = get_config_path()
        self._config: ConfigSchema = ConfigSchema()
        self._env_overrides: Dict[str, Any] = {}
        self._observers: Dict[str, Observer] = {}
        self._loaded = False
        
    async def load_config(self, reload: bool = False) -> None:
        """Load configuration from YAML file and environment variables"""
        if self._loaded and not reload:
            return
            
        # Load from file
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                file_config = yaml.safe_load(f) or {}
        else:
            file_config = {}
        
        # Load environment variables
        env_config = {}
        for key, value in os.environ.items():
            if key.startswith("AZ_"):
                config_key = key[3:].lower()
                env_config[config_key] = value
        
        # Merge configurations (env overrides file)
        merged_config = {**file_config, **env_config}
        
        # Update config
        self._config = ConfigSchema(**merged_config)
        self._env_overrides = env_config
        self._loaded = True
        
        # Start file watcher
        self._start_watcher()
    
    def _start_watcher(self) -> None:
        """Start file watcher for config changes"""
        if self.config_path in self._observers:
            return
            
        dir_path = os.path.dirname(self.config_path)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path, exist_ok=True)
        
        observer = Observer()
        event_handler = ConfigFileEventHandler(self)
        observer.schedule(event_handler, path=dir_path, recursive=False)
        observer.start()
        self._observers[self.config_path] = observer
    
    def _stop_watcher(self) -> None:
        """Stop file watcher"""
        if self.config_path in self._observers:
            observer = self._observers.pop(self.config_path)
            observer.stop()
            observer.join()
    
    def get_config(self) -> ConfigSchema:
        """Get current configuration"""
        return self._config
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get config value by key"""
        return getattr(self._config, key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set config value"""
        if hasattr(self._config, key):
            setattr(self._config, key, value)
        else:
            raise KeyError(f"Invalid config key: {key}")
    
    async def save_config(self) -> None:
        """Save current config to file"""
        config_dict = self._config.model_dump()
        
        # Remove environment-only overrides
        for key in self._env_overrides.keys():
            if key in config_dict:
                del config_dict[key]
        
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w') as f:
            yaml.safe_dump(config_dict, f)
    
    def validate_config(self) -> bool:
        """Validate current configuration"""
        try:
            self._config.model_dump()
            return True
        except Exception as e:
            print(f"Config validation error: {e}")
            return False
    
    def reload(self) -> None:
        """Reload configuration from file"""
        asyncio.run(self.load_config(reload=True))


class ConfigFileEventHandler(FileSystemEventHandler):
    def __init__(self, config_manager: ConfigManager):
        self.config_manager = config_manager
    
    def on_modified(self, event):
        if event.src_path == self.config_manager.config_path:
            print(f"Config file modified: {event.src_path}")
            self.config_manager.reload()
    
    def on_created(self, event):
        if event.src_path == self.config_manager.config_path:
            print(f"Config file created: {event.src_path}")
            self.config_manager.reload()


# CLI Commands
async def config_show() -> None:
    """Show current configuration"""
    from az_os.cli import app
    from rich.console import Console
    from rich.table import Table
    
    console = Console()
    manager = ConfigManager()
    await manager.load_config()
    
    config = manager.get_config()
    
    table = Table(title="Configuration")
    table.add_column("Key", style="cyan")
    table.add_column("Value", style="green")
    table.add_column("Description", style="yellow")
    
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


async def config_set(key: str, value: str) -> None:
    """Set configuration value"""
    from az_os.cli import app
    
    manager = ConfigManager()
    await manager.load_config()
    
    try:
        # Convert value to appropriate type
        field = manager._config.__fields__.get(key)
        if not field:
            raise KeyError(f"Invalid config key: {key}")
        
        # Convert value based on field type
        if field.annotation == int:
            value = int(value)
        elif field.annotation == bool:
            value = value.lower() in ("true", "1", "yes")
        elif field.annotation == float:
            value = float(value)
        
        manager.set(key, value)
        await manager.save_config()
        print(f"Config {key} set to {value}")
        
    except Exception as e:
        print(f"Error setting config: {e}")
        raise typer.Exit(1)


async def config_validate() -> None:
    """Validate configuration"""
    from az_os.cli import app
    
    manager = ConfigManager()
    await manager.load_config()
    
    if manager.validate_config():
        print("Configuration is valid")
    else:
        print("Configuration is invalid")
        raise typer.Exit(1)


# Register CLI commands
app = typer.Typer()
app.command()(config_show)
app.command()(config_set)
app.command()(config_validate)