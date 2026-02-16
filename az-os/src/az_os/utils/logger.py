import logging
import sys
from pathlib import Path
from typing import Optional, Union
from datetime import datetime


class Logger:
    def __init__(self, name: str, config: Optional[dict] = None):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Configure from config or defaults
        self._configure(config or self._get_default_config())
    
    def _get_default_config(self) -> dict:
        """Get default logging configuration."""
        return {
            "level": "INFO",
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
            "file": str(Path.home() / ".az-os" / "az_os.log"),
            "console": True,
            "file_mode": "a",
        }
    
    def _configure(self, config: dict) -> None:
        """Configure the logger."""
        # Set log level
        level = getattr(logging, config["level"].upper(), logging.INFO)
        self.logger.setLevel(level)
        
        # Create formatters
        formatter = logging.Formatter(
            fmt=config["format"],
            datefmt=config["datefmt"]
        )
        
        # Console handler
        if config.get("console", True):
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(level)
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
        
        # File handler
        if config.get("file"):
            log_dir = Path(config["file"]).parent
            log_dir.mkdir(parents=True, exist_ok=True)
            
            file_handler = logging.FileHandler(
                filename=config["file"],
                mode=config["file_mode"]
            )
            file_handler.setLevel(level)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def debug(self, message: str, *args, **kwargs) -> None:
        """Log debug message."""
        self.logger.debug(message, *args, **kwargs)
    
    def info(self, message: str, *args, **kwargs) -> None:
        """Log info message."""
        self.logger.info(message, *args, **kwargs)
    
    def warning(self, message: str, *args, **kwargs) -> None:
        """Log warning message."""
        self.logger.warning(message, *args, **kwargs)
    
    def error(self, message: str, *args, **kwargs) -> None:
        """Log error message."""
        self.logger.error(message, *args, **kwargs)
    
    def critical(self, message: str, *args, **kwargs) -> None:
        """Log critical message."""
        self.logger.critical(message, *args, **kwargs)
    
    def exception(self, message: str, *args, **kwargs) -> None:
        """Log exception with traceback."""
        self.logger.exception(message, *args, **kwargs)
    
    def log(self, level: int, message: str, *args, **kwargs) -> None:
        """Log message with specified level."""
        self.logger.log(level, message, *args, **kwargs)
    
    def with_metadata(self, metadata: dict):
        """Create a logger with metadata."""
        class MetaLogger:
            def __init__(self, logger, metadata):
                self.logger = logger
                self.metadata = metadata
            
            def _add_metadata(self, message):
                meta_str = json.dumps(self.metadata, separators=(",", ":"))
                return f"[{meta_str}] {message}"
            
            def debug(self, message, *args, **kwargs):
                self.logger.debug(self._add_metadata(message), *args, **kwargs)
            
            def info(self, message, *args, **kwargs):
                self.logger.info(self._add_metadata(message), *args, **kwargs)
            
            def warning(self, message, *args, **kwargs):
                self.logger.warning(self._add_metadata(message), *args, **kwargs)
            
            def error(self, message, *args, **kwargs):
                self.logger.error(self._add_metadata(message), *args, **kwargs)
            
            def critical(self, message, *args, **kwargs):
                self.logger.critical(self._add_metadata(message), *args, **kwargs)
            
            def exception(self, message, *args, **kwargs):
                self.logger.exception(self._add_metadata(message), *args, **kwargs)
            
            def log(self, level, message, *args, **kwargs):
                self.logger.log(level, self._add_metadata(message), *args, **kwargs)
        
        return MetaLogger(self.logger, metadata)


# Global logger instance
logger = Logger("az_os")


def get_logger(name: str) -> Logger:
    """Get a logger instance."""
    return Logger(name)


# Convenience functions
def debug(message: str, *args, **kwargs) -> None:
    logger.debug(message, *args, **kwargs)

def info(message: str, *args, **kwargs) -> None:
    logger.info(message, *args, **kwargs)

def warning(message: str, *args, **kwargs) -> None:
    logger.warning(message, *args, **kwargs)

def error(message: str, *args, **kwargs) -> None:
    logger.error(message, *args, **kwargs)

def critical(message: str, *args, **kwargs) -> None:
    logger.critical(message, *args, **kwargs)

def exception(message: str, *args, **kwargs) -> None:
    logger.exception(message, *args, **kwargs)

def log(level: int, message: str, *args, **kwargs) -> None:
    logger.log(level, message, *args, **kwargs)