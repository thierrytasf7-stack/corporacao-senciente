import os
import sys
from pathlib import Path
from typing import List, Optional


def main():
    """Main entry point for AZ-OS CLI"""
    # Add src to Python path
    src_path = Path(__file__).parent.parent / "src"
    sys.path.insert(0, str(src_path))
    
    # Parse command line arguments
    args = sys.argv[1:]
    
    if not args:
        print("AZ-OS CLI")
        print("Usage: az <command> [options]")
        print("\nCommands:")
        print("  metrics  Show cost metrics and usage statistics")
        print("  config   Manage AZ-OS configuration")
        print("  logs     Show system logs")
        print("  help     Show this help message")
        return
    
    command = args[0]
    
    if command == "metrics":
        from az_os.cli.commands.metrics import metrics_cmd
        metrics_cmd.run()
    elif command == "config":
        from az_os.cli.commands.config import config_cmd
        config_cmd.run(parse_config_args(args[1:]))
    elif command == "logs":
        from az_os.cli.commands.logs import logs_cmd
        logs_cmd.run(parse_logs_args(args[1:]))
    elif command == "help":
        main()  # Show help
    else:
        print(f"Unknown command: {command}")
        print("Run 'az help' for usage information.")


def parse_config_args(args: List[str]) -> Optional[dict]:
    """Parse config command arguments"""
    if not args:
        return None
    
    if args[0] == "set":
        if len(args) < 3:
            print("Usage: az config set <key> <value>")
            return None
        
        return {
            'set': True,
            'key': args[1],
            'value': args[2]
        }
    
    return None


def parse_logs_args(args: List[str]) -> Optional[dict]:
    """Parse logs command arguments"""
    result = {}
    
    for arg in args:
        if arg.startswith("--level="):
            result['level'] = arg.split('=', 1)[1]
        elif arg.startswith("--count="):
            result['count'] = arg.split('=', 1)[1]
    
    return result


if __name__ == "__main__":
    main()