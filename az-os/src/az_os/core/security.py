"""Security module for AZ-OS v2.0.

Provides input validation, SQL injection prevention, API key encryption,
rate limiting, and audit logging for production security.
"""

import re
import hashlib
import hmac
import secrets
import base64
import time
import logging
from typing import Dict, Any, Optional, List
from functools import wraps
from collections import defaultdict
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend

logger = logging.getLogger(__name__)


class InputValidator:
    """Validate and sanitize user inputs to prevent injection attacks."""

    # Regex patterns for validation
    PATTERNS = {
        'task_id': re.compile(r'^[a-zA-Z0-9_-]{1,64}$'),
        'model_name': re.compile(r'^[a-zA-Z0-9_/-]{1,128}$'),
        'file_path': re.compile(r'^[a-zA-Z0-9_./\-]{1,512}$'),
        'command': re.compile(r'^[a-zA-Z0-9_\-\s.]{1,1024}$'),
        'email': re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    }

    @classmethod
    def validate(cls, value: str, field_type: str) -> bool:
        """Validate input against pattern for field type."""
        if not isinstance(value, str):
            return False

        pattern = cls.PATTERNS.get(field_type)
        if pattern is None:
            logger.warning(f"Unknown field type: {field_type}")
            return False

        return pattern.match(value) is not None

    @classmethod
    def sanitize_sql(cls, value: str) -> str:
        """Sanitize string for SQL queries (always use parameterized queries)."""
        # This is a fallback - ALWAYS use parameterized queries
        dangerous_chars = ["'", '"', ";", "--", "/*", "*/", "xp_", "sp_"]
        sanitized = value
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, "")
        return sanitized

    @classmethod
    def sanitize_path(cls, path: str) -> str:
        """Sanitize file paths to prevent directory traversal."""
        # Remove .. and absolute path references
        sanitized = path.replace("..", "").replace("~", "")
        # Remove leading slashes
        sanitized = sanitized.lstrip("/\\")
        return sanitized


class APIKeyEncryption:
    """Encrypt and decrypt API keys using Fernet symmetric encryption."""

    def __init__(self, master_password: Optional[str] = None):
        """Initialize with master password (from env or generate new)."""
        if master_password is None:
            # Generate random master password
            master_password = secrets.token_urlsafe(32)
            logger.warning("No master password provided, generated random one")

        # Derive encryption key from password using PBKDF2
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'az-os-salt-2025',  # In production, use random salt
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(master_password.encode()))
        self.cipher = Fernet(key)

    def encrypt(self, api_key: str) -> str:
        """Encrypt API key and return base64 encoded ciphertext."""
        encrypted = self.cipher.encrypt(api_key.encode())
        return base64.b64encode(encrypted).decode()

    def decrypt(self, encrypted_key: str) -> str:
        """Decrypt base64 encoded ciphertext and return API key."""
        encrypted = base64.b64decode(encrypted_key.encode())
        decrypted = self.cipher.decrypt(encrypted)
        return decrypted.decode()


class RateLimiter:
    """Token bucket rate limiter for API requests."""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        """Initialize rate limiter with max requests per window."""
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.buckets: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed for given identifier (user, IP, etc)."""
        now = time.time()
        window_start = now - self.window_seconds

        # Remove old timestamps outside window
        self.buckets[identifier] = [
            ts for ts in self.buckets[identifier]
            if ts > window_start
        ]

        # Check if under limit
        if len(self.buckets[identifier]) < self.max_requests:
            self.buckets[identifier].append(now)
            return True

        logger.warning(f"Rate limit exceeded for {identifier}")
        return False

    def get_retry_after(self, identifier: str) -> int:
        """Get seconds until next request allowed."""
        if not self.buckets[identifier]:
            return 0

        oldest = min(self.buckets[identifier])
        retry_after = int(oldest + self.window_seconds - time.time())
        return max(0, retry_after)


class AuditLogger:
    """Audit logging for security-sensitive operations."""

    def __init__(self, log_file: str = "~/.az-os/audit.log"):
        """Initialize audit logger with file path."""
        import os
        self.log_file = os.path.expanduser(log_file)

        # Ensure log directory exists
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)

        # Configure audit logger (separate from main logger)
        self.audit_logger = logging.getLogger("az_os.audit")
        self.audit_logger.setLevel(logging.INFO)

        # File handler with rotation
        from logging.handlers import RotatingFileHandler
        handler = RotatingFileHandler(
            self.log_file,
            maxBytes=10*1024*1024,  # 10 MB
            backupCount=5
        )
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        self.audit_logger.addHandler(handler)

    def log_event(
        self,
        event_type: str,
        user: str,
        action: str,
        resource: str,
        status: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log security event to audit log."""
        event = {
            'type': event_type,
            'user': user,
            'action': action,
            'resource': resource,
            'status': status,
            'timestamp': datetime.utcnow().isoformat(),
            'details': details or {}
        }

        self.audit_logger.info(
            f"{event_type} | {user} | {action} | {resource} | {status}"
        )


def require_auth(func):
    """Decorator to require authentication for function."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # TODO: Implement actual authentication check
        # For now, just log the attempt
        logger.info(f"Auth check for {func.__name__}")
        return func(*args, **kwargs)
    return wrapper


def rate_limit(max_requests: int = 60, window: int = 60):
    """Decorator to apply rate limiting to function."""
    limiter = RateLimiter(max_requests, window)

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Use function name as identifier (in production, use user ID)
            if not limiter.is_allowed(func.__name__):
                retry_after = limiter.get_retry_after(func.__name__)
                raise PermissionError(
                    f"Rate limit exceeded. Retry after {retry_after}s"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator


# Global instances
validator = InputValidator()
rate_limiter = RateLimiter()
audit_logger = AuditLogger()
