from typing import Optional, List
from az_os.core.logger import Logger
from az_os.cli.cli import AzCliCommand


class LogsCommand(AzCliCommand):
    name = "logs"
    description = "Show system logs"

    def __init__(self):
        super().__init__()
        self.logger = Logger()

    def run(self, args: Optional[dict] = None) -> None:
        """Display recent logs"""
        try:
            log_level = args.get('level', 'INFO') if args else 'INFO'
            count = int(args.get('count', 10)) if args and 'count' in args else 10
            
            logs: List[str] = self.logger.get_recent_logs(count, log_level)
            
            if not logs:
                print("No logs found.")
                return
                
            print(f"Recent {count} logs (level >= {log_level}):")
            for log in logs:
                print(f"  {log}")
                
        except Exception as e:
            print(f"Error retrieving logs: {e}")
            raise


logs_cmd = LogsCommand()