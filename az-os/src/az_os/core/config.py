import os
from pathlib import Path
from typing import Any, Dict, Optional
from dynaconf import Dynaconf


class Config:
    def __init__(self):
        self.settings = Dynaconf(
            settings_files=["config/default.yaml", "config/local.yaml"],
            env_switcher="AZ_OS_SETTINGS",
            environments=True,
            envvar_prefix="AZ_OS",
        )
        
        # Set default values if not configured
        self._set_defaults()
    
    def _set_defaults(self):
        """Set default configuration values."""
        if not self.settings.get("llm"):
            self.settings.llm = {
                "default_model": "claude-3-sonnet-20240229",
                "providers": ["anthropic", "google", "openai"],
                "timeout": 30,
                "max_tokens": 4096,
                "temperature": 0.7,
                "budget": {
                    "daily": 100.0,
                    "monthly": 3000.0,
                    "alert_threshold": 0.8,
                },
            }
        
        if not self.settings.get("database"):
            self.settings.database = {
                "path": str(Path.home() / ".az-os" / "az_os.db"),
                "timeout": 30.0,
                "check_same_thread": False,
            }
        
        if not self.settings.get("logging"):
            self.settings.logging = {
                "level": "INFO",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "file": str(Path.home() / ".az-os" / "az_os.log"),
            }
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self.settings.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set configuration value."""
        self.settings.set(key, value)
    
    def all(self) -> Dict[str, Any]:
        """Get all configuration."""
        return self.settings.to_dict()