from typing import List
from ..core.config_manager import ConfigManager
from ..core.system_manager import SystemManager

class CommandHandler:
    """Handles CLI commands."""
    
    def __init__(self):
        self.config_manager = ConfigManager()
        self.system_manager = SystemManager()
    
    def handle_config(self, args: List[str]) -> None:
        """Handle config command."""
        if not args:
            print("Usage: az-os config [set|get] [key] [value]")
            return
        
        action = args[0]
        if action == 'set':
            if len(args) < 3:
                print("Usage: az-os config set [key] [value]")
                return
            key, value = args[1], args[2]
            self.config_manager.set(key, value)
            print(f"Set {key} = {value}")
        elif action == 'get':
            if len(args) < 2:
                print("Usage: az-os config get [key]")
                return
            key = args[1]
            value = self.config_manager.get(key)
            print(f"{key}: {value}")
        else:
            print(f"Unknown config action: {action}")
    
    def handle_system(self, args: List[str]) -> None:
        """Handle system command."""
        info = self.system_manager.get_system_info()
        print("AZ-OS System Information:")
        for key, value in info.items():
            print(f"  {key}: {value}")