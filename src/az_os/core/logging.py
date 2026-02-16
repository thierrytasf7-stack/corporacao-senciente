"""
Logging utilities for Agent Zero Operating System
"""

import logging
import sys
from typing import Any, Dict, Optional
from datetime import datetime


def get_logger(name: str) -> logging.Logger:
    """Get configured logger"""
    logger = logging.getLogger(name)
    
    # Prevent adding handlers multiple times
    if logger.handlers:
        return logger
    
    # Configure logger
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    
    # Add handler
    logger.addHandler(console_handler)
    logger.propagate = False
    
    return logger


class StructuredLogger:
    """Structured logger for AZ-OS"""
    
    def __init__(self, name: str):
        self.logger = get_logger(name)
    
    def info(self, message: str, data: Optional[Dict[str, Any]] = None) -> None:
        """Log info message with structured data"""
        if data:
            self.logger.info(f"{message} | {json.dumps(data)}")
        else:
            self.logger.info(message)
    
    def error(self, message: str, error: Optional[Exception] = None, data: Optional[Dict[str, Any]] = None) -> None:
        """Log error message with structured data"""
        error_info = {}
        if error:
            error_info = {
                "error_type": type(error).__name__,
                "error_message": str(error),
                "error_traceback": self._format_exception(error)
            }
        
        if data:
            error_info.update(data)
        
        if error_info:
            self.logger.error(f"{message} | {json.dumps(error_info)}")
        else:
            self.logger.error(message)
    
    def warning(self, message: str, data: Optional[Dict[str, Any]] = None) -> None:
        """Log warning message with structured data"""
        if data:
            self.logger.warning(f"{message} | {json.dumps(data)}")
        else:
            self.logger.warning(message)
    
    def debug(self, message: str, data: Optional[Dict[str, Any]] = None) -> None:
        """Log debug message with structured data"""
        if data:
            self.logger.debug(f"{message} | {json.dumps(data)}")
        else:
            self.logger.debug(message)
    
    def _format_exception(self, error: Exception) -> str:
        """Format exception traceback"""
        import traceback
        return ''.join(traceback.format_exception(type(error), error, error.__traceback__))


# Global structured logger
structured_logger = StructuredLogger("az_os")


# Convenience functions
def log_info(message: str, data: Optional[Dict[str, Any]] = None) -> None:
    structured_logger.info(message, data)


def log_error(message: str, error: Optional[Exception] = None, data: Optional[Dict[str, Any]] = None) -> None:
    structured_logger.error(message, error, data)


def log_warning(message: str, data: Optional[Dict[str, Any]] = None) -> None:
    structured_logger.warning(message, data)


def log_debug(message: str, data: Optional[Dict[str, Any]] = None) -> None:
    structured_logger.debug(message, data)