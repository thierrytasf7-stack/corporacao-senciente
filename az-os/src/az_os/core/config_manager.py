"""Configuration management for AZ-OS."""
from pathlib import Path
from typing import Any, Dict, Optional
import yaml


class ConfigManager:
    """Manage AZ-OS configuration."""

    DEFAULT_CONFIG = {
        'llm': {
            'default_model': 'claude-3-sonnet',
            'timeout': 30,
            'max_retries': 3,
            'rate_limit_backoff': 1.5,
            'models': [
                'claude-3-sonnet',
                'gemini-1.5-pro',
                'mistral-small',
            ],
        },
        'database': {
            'path': '~/.az-os/db/tasks.db',
        },
        'logging': {
            'level': 'INFO',
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            'file': '~/.az-os/logs/az-os.log',
        },
        'performance': {
            'max_workers': 4,
            'cache_size_mb': 512,
            'batch_size': 10,
        },
    }

    def __init__(self, config_path: Optional[str] = None):
        """Initialize config manager."""
        if config_path:
            self.config_path = Path(config_path)
        else:
            self.config_path = Path.home() / '.az-os' / 'config.yaml'

        self.data = self.load()

    def load(self) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    config = yaml.safe_load(f)
                    return config or self.DEFAULT_CONFIG.copy()
            else:
                # Create default config file
                self.config_path.parent.mkdir(parents=True, exist_ok=True)
                self.save()
                return self.DEFAULT_CONFIG.copy()
        except Exception:
            return self.DEFAULT_CONFIG.copy()

    def save(self):
        """Save configuration to file."""
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w') as f:
                yaml.dump(self.data, f, default_flow_style=False)
        except Exception as e:
            raise RuntimeError(f"Failed to save config: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-separated key."""
        keys = key.split('.')
        value = self.data

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

        return value if value is not None else default

    def set(self, key: str, value: Any):
        """Set configuration value by dot-separated key."""
        keys = key.split('.')
        config = self.data

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value
        self.save()

    def validate(self) -> bool:
        """Validate configuration."""
        required_keys = [
            'llm.default_model',
            'database.path',
            'logging.level',
        ]

        for key in required_keys:
            if self.get(key) is None:
                return False

        return True
