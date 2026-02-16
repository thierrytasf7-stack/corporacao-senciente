from typing import Optional, Dict, Any
from az_os.core.config_manager import ConfigManager
from az_os.cli.cli import AzCliCommand


class ConfigCommand(AzCliCommand):
    name = "config"
    description = "Manage AZ-OS configuration"

    def __init__(self):
        super().__init__()
        self.config_manager = ConfigManager()

    def run(self, args: Optional[dict] = None) -> None:
        """Show or set configuration"""
        if args is None or 'set' not in args:
            self.show_config()
        else:
            self.set_config(args)

    def show_config(self) -> None:
        """Display current configuration"""
        try:
            config = self.config_manager.get_all()
            print("Current Configuration:")
            for key, value in config.items():
                print(f"  {key}: {value}")
                
        except Exception as e:
            print(f"Error showing config: {e}")
            raise

    def set_config(self, args: dict) -> None:
        """Set configuration value"""
        try:
            key = args.get('key')
            value = args.get('value')
            
            if not key or value is None:
                print("Usage: az config set key=value")
                return
                
            self.config_manager.set(key, value)
            print(f"Config updated: {key} = {value}")
            
        except Exception as e:
            print(f"Error setting config: {e}")
            raise


config_cmd = ConfigCommand()