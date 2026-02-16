"""Error handling and recovery for AZ-OS v2.0.

Provides exception categorization, auto-retry with exponential backoff,
graceful degradation, and user-friendly error messages.
"""

import time
import logging
import traceback
from typing import Optional, Callable, Any, Type, Tuple
from functools import wraps
from enum import Enum

logger = logging.getLogger(__name__)


class ErrorCategory(Enum):
    """Error categories for classification and handling."""
    NETWORK = "network"
    RATE_LIMIT = "rate_limit"
    AUTHENTICATION = "authentication"
    VALIDATION = "validation"
    RESOURCE_NOT_FOUND = "resource_not_found"
    INTERNAL = "internal"
    EXTERNAL_API = "external_api"
    DATABASE = "database"
    FILESYSTEM = "filesystem"
    TIMEOUT = "timeout"
    UNKNOWN = "unknown"


class AZOSError(Exception):
    """Base exception for AZ-OS errors."""

    def __init__(
        self,
        message: str,
        category: ErrorCategory = ErrorCategory.UNKNOWN,
        recoverable: bool = True,
        details: Optional[dict] = None
    ):
        super().__init__(message)
        self.message = message
        self.category = category
        self.recoverable = recoverable
        self.details = details or {}

    def user_message(self) -> str:
        """Get user-friendly error message."""
        friendly_messages = {
            ErrorCategory.NETWORK: "Network connection issue. Please check your internet.",
            ErrorCategory.RATE_LIMIT: "Too many requests. Please wait a moment.",
            ErrorCategory.AUTHENTICATION: "Authentication failed. Check your API key.",
            ErrorCategory.VALIDATION: "Invalid input provided.",
            ErrorCategory.RESOURCE_NOT_FOUND: "Requested resource not found.",
            ErrorCategory.TIMEOUT: "Operation timed out. Please try again.",
            ErrorCategory.DATABASE: "Database error occurred.",
            ErrorCategory.FILESYSTEM: "File system error occurred.",
        }

        base_message = friendly_messages.get(
            self.category,
            "An error occurred"
        )

        if self.recoverable:
            return f"{base_message} (Retrying automatically...)"
        else:
            return f"{base_message} (Manual intervention required)"


class NetworkError(AZOSError):
    """Network-related errors."""
    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.NETWORK, **kwargs)


class RateLimitError(AZOSError):
    """Rate limit exceeded errors."""
    def __init__(self, message: str, retry_after: int = 60, **kwargs):
        super().__init__(message, category=ErrorCategory.RATE_LIMIT, **kwargs)
        self.retry_after = retry_after


class ValidationError(AZOSError):
    """Input validation errors."""
    def __init__(self, message: str, **kwargs):
        super().__init__(
            message,
            category=ErrorCategory.VALIDATION,
            recoverable=False,
            **kwargs
        )


def categorize_error(error: Exception) -> ErrorCategory:
    """Categorize exception into ErrorCategory."""
    error_name = type(error).__name__.lower()
    error_msg = str(error).lower()

    # Check for specific error types
    if isinstance(error, AZOSError):
        return error.category

    # Network errors
    if any(x in error_name for x in ['connection', 'timeout', 'network']):
        return ErrorCategory.NETWORK

    if any(x in error_msg for x in ['connection', 'network', 'timeout']):
        return ErrorCategory.NETWORK

    # Rate limit
    if '429' in error_msg or 'rate limit' in error_msg:
        return ErrorCategory.RATE_LIMIT

    # Authentication
    if any(x in error_msg for x in ['401', '403', 'unauthorized', 'forbidden']):
        return ErrorCategory.AUTHENTICATION

    # Not found
    if '404' in error_msg or 'not found' in error_msg:
        return ErrorCategory.RESOURCE_NOT_FOUND

    # Database
    if any(x in error_name for x in ['database', 'sql', 'integrity']):
        return ErrorCategory.DATABASE

    # Filesystem
    if any(x in error_name for x in ['file', 'io', 'permission']):
        return ErrorCategory.FILESYSTEM

    return ErrorCategory.UNKNOWN


def is_recoverable(error: Exception, category: ErrorCategory) -> bool:
    """Determine if error is recoverable with retry."""
    if isinstance(error, AZOSError):
        return error.recoverable

    # Network and rate limit errors are usually recoverable
    if category in [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT, ErrorCategory.TIMEOUT]:
        return True

    # Authentication and validation errors are not recoverable
    if category in [ErrorCategory.AUTHENTICATION, ErrorCategory.VALIDATION]:
        return False

    # Default to non-recoverable for unknown errors
    return False


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """Decorator for automatic retry with exponential backoff."""

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            attempt = 0
            delay = base_delay

            while attempt < max_retries:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    attempt += 1
                    category = categorize_error(e)

                    # Check if error is recoverable
                    if not is_recoverable(e, category):
                        logger.error(
                            f"Non-recoverable error in {func.__name__}: {e}"
                        )
                        raise

                    if attempt >= max_retries:
                        logger.error(
                            f"Max retries ({max_retries}) exceeded for {func.__name__}"
                        )
                        raise

                    # Calculate next delay with exponential backoff
                    delay = min(delay * exponential_base, max_delay)

                    logger.warning(
                        f"Attempt {attempt}/{max_retries} failed for {func.__name__}. "
                        f"Retrying in {delay:.1f}s... Error: {e}"
                    )

                    time.sleep(delay)

            # This should never be reached but satisfies type checker
            raise RuntimeError(f"Unexpected retry loop exit in {func.__name__}")

        return wrapper

    return decorator


class ErrorHandler:
    """Centralized error handling with logging and recovery."""

    def __init__(self):
        self.error_counts = {}

    def handle(
        self,
        error: Exception,
        context: str = "",
        raise_on_error: bool = True
    ) -> Optional[str]:
        """Handle error with categorization and logging."""
        category = categorize_error(error)
        recoverable = is_recoverable(error, category)

        # Log error with full traceback
        log_msg = f"Error in {context}: {error}"
        if recoverable:
            logger.warning(log_msg)
        else:
            logger.error(log_msg)
            logger.debug(traceback.format_exc())

        # Track error counts
        error_key = f"{category.value}:{context}"
        self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1

        # Get user-friendly message
        if isinstance(error, AZOSError):
            user_msg = error.user_message()
        else:
            user_msg = str(error)

        if raise_on_error:
            # Re-raise as AZOSError if not already
            if not isinstance(error, AZOSError):
                raise AZOSError(
                    message=str(error),
                    category=category,
                    recoverable=recoverable
                ) from error
            raise

        return user_msg

    def get_error_stats(self) -> dict:
        """Get error statistics."""
        return dict(self.error_counts)


# Global error handler instance
error_handler = ErrorHandler()


def safe_execute(func: Callable, *args, **kwargs) -> Tuple[bool, Any]:
    """Execute function safely, catching and logging errors.

    Returns:
        Tuple of (success: bool, result or error_message: Any)
    """
    try:
        result = func(*args, **kwargs)
        return True, result
    except Exception as e:
        error_msg = error_handler.handle(e, context=func.__name__, raise_on_error=False)
        return False, error_msg
