from typing import Dict, Any
from .config_manager import ConfigManager

class SystemManager:
    """Manages AZ-OS system operations."""
    
    def __init__(self):
        self.config = ConfigManager()
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get system information."""
        return {
            'os': 'AZ-OS',
            'version': '1.0.0',
            'model': self.config.get('model'),
            'timeout': self.config.get('timeout')
        }
    
    def set_model(self, model: str) -> None:
        """Set AI model."""
        self.config.set('model', model)
    
    def set_timeout(self, timeout: int) -> None:
        """Set timeout."""
        self.config.set('timeout', timeout)
    
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration."""
        return {
            'model': self.config.get('model'),
            'timeout': self.config.get('timeout')
        }