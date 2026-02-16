import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional


class Logger:
    def __init__(self, log_dir: str = "logs", max_logs: int = 1000):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        self.max_logs = max_logs
        self._setup_logger()
        self._initialize_log_file()

    def _setup_logger(self) -> None:
        """Setup Python logger"""
        self.logger = logging.getLogger("AZ-OS")
        self.logger.setLevel(logging.DEBUG)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

    def _initialize_log_file(self) -> None:
        """Initialize log file with header"""
        log_file = self._get_log_file()
        if not log_file.exists():
            with open(log_file, 'w') as f:
                f.write("AZ-OS Log File\n")
                f.write("=" * 50 + "\n\n")

    def _get_log_file(self) -> Path:
        """Get current log file path"""
        today = datetime.now().strftime("%Y-%m-%d")
        return self.log_dir / f"az_os_{today}.log"

    def _write_to_file(self, level: str, message: str) -> None:
        """Write log to file"""
        log_file = self._get_log_file()
        timestamp = datetime.now().isoformat()
        
        with open(log_file, 'a') as f:
            f.write(f"[{timestamp}] {level.upper()}: {message}\n")

    def _rotate_logs(self) -> None:
        """Rotate log files if they exceed max size"""
        log_file = self._get_log_file()
        if log_file.exists():
            with open(log_file, 'r') as f:
                lines = f.readlines()
            
            if len(lines) > self.max_logs:
                with open(log_file, 'w') as f:
                    f.writelines(lines[-self.max_logs:])

    def debug(self, message: str) -> None:
        """Log debug message"""
        self.logger.debug(message)
        self._write_to_file("DEBUG", message)

    def info(self, message: str) -> None:
        """Log info message"""
        self.logger.info(message)
        self._write_to_file("INFO", message)

    def warning(self, message: str) -> None:
        """Log warning message"""
        self.logger.warning(message)
        self._write_to_file("WARNING", message)

    def error(self, message: str) -> None:
        """Log error message"""
        self.logger.error(message)
        self._write_to_file("ERROR", message)

    def critical(self, message: str) -> None:
        """Log critical message"""
        self.logger.critical(message)
        self._write_to_file("CRITICAL", message)

    def get_recent_logs(self, count: int = 10, level: str = "INFO") -> List[str]:
        """Get recent logs"""
        try:
            log_file = self._get_log_file()
            if not log_file.exists():
                return []
            
            with open(log_file, 'r') as f:
                lines = f.readlines()
            
            # Filter by level
            level_value = getattr(logging, level)
            filtered_logs = []
            
            for line in reversed(lines):
                if "DEBUG" in line and level_value <= logging.DEBUG:
                    filtered_logs.append(line.strip())
                elif "INFO" in line and level_value <= logging.INFO:
                    filtered_logs.append(line.strip())
                elif "WARNING" in line and level_value <= logging.WARNING:
                    filtered_logs.append(line.strip())
                elif "ERROR" in line and level_value <= logging.ERROR:
                    filtered_logs.append(line.strip())
                elif "CRITICAL" in line and level_value <= logging.CRITICAL:
                    filtered_logs.append(line.strip())
            
            return filtered_logs[:count]
            
        except Exception as e:
            self.error(f"Failed to retrieve logs: {e}")
            return []

    def clear_logs(self) -> None:
        """Clear all log files"""
        for log_file in self.log_dir.glob("az_os_*.log"):
            try:
                log_file.unlink()
            except OSError as e:
                self.error(f"Failed to clear log file {log_file}: {e}")

    def get_log_count(self) -> int:
        """Get total number of log entries"""
        try:
            log_file = self._get_log_file()
            if not log_file.exists():
                return 0
            
            with open(log_file, 'r') as f:
                return len(f.readlines())
                
        except Exception as e:
            self.error(f"Failed to count logs: {e}")
            return 0