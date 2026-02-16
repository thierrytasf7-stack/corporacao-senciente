"""
Error handling and recovery module for AZ-OS v2.0
Handles comprehensive exception handling, error categorization,
automatic retry with exponential backoff, and user-friendly error messages.
"""

import time
import logging
from typing import Any, Dict, Optional, Tuple, Type
from enum import Enum
from datetime import datetime, timedelta


class ErrorCategory(Enum):
    """Error categorization for retry logic"""
    RETRYABLE = "retryable"
    FATAL = "fatal"
    TRANSIENT = "transient"


class ErrorHandler:
    """Comprehensive error handling for AZ-OS"""
    
    def __init__(self, max_retries: int = 3, base_delay: int = 1):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.logger = logging.getLogger(__name__)
        self.telemetry_enabled = True
    
    def handle_error(self, error: Exception, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle error with categorization and retry logic"""
        error_info = {
            'timestamp': datetime.utcnow().isoformat(),
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'retry_count': 0,
            'should_retry': False,
            'user_message': 'An unexpected error occurred'
        }
        
        try:
            # Categorize error
            category = self.categorize(error)
            error_info['category'] = category.value
            
            # Determine retry logic
            if category == ErrorCategory.RETRYABLE:
                error_info['should_retry'] = True
                error_info['retry_count'] = self.max_retries
                error_info['user_message'] = self._get_retryable_message(error)
            elif category == ErrorCategory.TRANSIENT:
                error_info['should_retry'] = True
                error_info['retry_count'] = min(self.max_retries, 5)
                error_info['user_message'] = self._get_transient_message(error)
            else:
                error_info['user_message'] = self._get_fatal_message(error)
            
            # Report to telemetry
            if self.telemetry_enabled:
                self._report_to_telemetry(error_info)
            
            # Log for debugging
            self._log_error(error_info)
            
        except Exception as log_error:
            error_info['handling_error'] = str(log_error)
            self.logger.error(f"Error handling failed: {log_error}")
        
        return error_info
    
    def categorize(self, error: Exception) -> ErrorCategory:
        """Categorize error for retry logic"""
        retryable_errors = (
            ConnectionError,
            TimeoutError,
            OSError,
            # Database connection errors
            *self._get_database_errors(),
            # Network errors
            *self._get_network_errors()
        )
        
        transient_errors = (
            # API rate limiting
            *self._get_rate_limit_errors(),
            # Service unavailable
            *self._get_service_errors()
        )
        
        if isinstance(error, retryable_errors):
            return ErrorCategory.RETRYABLE
        elif isinstance(error, transient_errors):
            return ErrorCategory.TRANSIENT
        return ErrorCategory.FATAL
    
    def should_retry(self, error: Exception, attempt: int) -> Tuple[bool, int]:
        """Determine if error should be retried and calculate delay"""
        category = self.categorize(error)
        
        if category in (ErrorCategory.RETRYABLE, ErrorCategory.TRANSIENT):
            if attempt < self.max_retries:
                delay = self._calculate_exponential_backoff(attempt)
                return (True, delay)
        
        return (False, 0)
    
    def _calculate_exponential_backoff(self, attempt: int) -> int:
        """Calculate exponential backoff delay"""
        delay = self.base_delay * (2 ** attempt)
        # Add jitter to prevent thundering herd
        jitter = delay * 0.1
        return int(delay + jitter)
    
    def format_message(self, error_info: Dict[str, Any]) -> str:
        """Format user-friendly error message"""
        if error_info['category'] == ErrorCategory.RETRYABLE.value:
            return f"Temporary issue: {error_info['user_message']}. Please try again."
        elif error_info['category'] == ErrorCategory.TRANSIENT.value:
            return f"Service temporarily unavailable: {error_info['user_message']}. Retrying..."
        return f"Error: {error_info['user_message']}"
    
    def _get_retryable_message(self, error: Exception) -> str:
        """Get message for retryable errors"""
        if isinstance(error, ConnectionError):
            return "Connection failed"
        return "Temporary service issue"
    
    def _get_transient_message(self, error: Exception) -> str:
        """Get message for transient errors"""
        if isinstance(error, TimeoutError):
            return "Request timed out"
        return "Service temporarily unavailable"
    
    def _get_fatal_message(self, error: Exception) -> str:
        """Get message for fatal errors"""
        return "An unexpected error occurred. Please contact support."
    
    def _report_to_telemetry(self, error_info: Dict[str, Any]) -> None:
        """Report error to telemetry system"""
        # In production, send to telemetry service
        self.logger.info(f"Telemetry report: {error_info}")
    
    def _log_error(self, error_info: Dict[str, Any]) -> None:
        """Log error for debugging"""
        self.logger.error(f"Error: {error_info['error_message']}", 
                        extra=error_info)
    
    def _get_database_errors(self) -> Tuple[Type[Exception], ...]:
        """Get database-related error types"""
        try:
            import sqlalchemy
            return (sqlalchemy.exc.OperationalError, sqlalchemy.exc.IntegrityError)
        except ImportError:
            return ()
    
    def _get_network_errors(self) -> Tuple[Type[Exception], ...]:
        """Get network-related error types"""
        try:
            import requests
            return (requests.exceptions.ConnectionError, requests.exceptions.Timeout)
        except ImportError:
            return ()
    
    def _get_rate_limit_errors(self) -> Tuple[Type[Exception], ...]:
        """Get rate limit error types"""
        try:
            import requests
            return (requests.exceptions.HTTPError,)
        except ImportError:
            return ()
    
    def _get_service_errors(self) -> Tuple[Type[Exception], ...]:
        """Get service unavailable error types"""
        try:
            import requests
            return (requests.exceptions.HTTPError,)
        except ImportError:
            return ()
