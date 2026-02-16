"""
Security module for AZ-OS v2.0
Handles input validation, SQL injection prevention, API key encryption,
rate limiting, CORS protection, and audit logging.
"""

import re
import hashlib
import json
import time
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError


class Security:
    """Security utilities for AZ-OS"""
    
    def __init__(self, encryption_key: str):
        self.encryption_key = encryption_key
        self.cipher = Fernet(Fernet.generate_key() if not encryption_key else encryption_key.encode())
        self.rate_limits: Dict[str, List[float]] = {}
        self.audit_log: List[Dict[str, Any]] = []
    
    def validate_input(self, data: Dict[str, Any], schema: Dict[str, Any]) -> Tuple[bool, str]:
        """Validate and sanitize user input against schema"""
        errors = []
        
        for field, rules in schema.items():
            if field not in data:
                errors.append(f"Missing required field: {field}")
                continue
            
            value = data[field]
            
            # Type validation
            expected_type = rules.get('type')
            if expected_type and not isinstance(value, expected_type):
                errors.append(f"Field '{field}' must be {expected_type.__name__}")
                continue
            
            # Length validation
            if 'min_length' in rules and len(str(value)) < rules['min_length']:
                errors.append(f"Field '{field}' must be at least {rules['min_length']} characters")
            
            if 'max_length' in rules and len(str(value)) > rules['max_length']:
                errors.append(f"Field '{field}' must be at most {rules['max_length']} characters")
            
            # Pattern validation
            if 'pattern' in rules:
                pattern = re.compile(rules['pattern'])
                if not pattern.match(str(value)):
                    errors.append(f"Field '{field}' format is invalid")
            
            # Sanitization
            if isinstance(value, str):
                data[field] = self._sanitize_string(value)
        
        return (len(errors) == 0, "; ".join(errors))
    
    def _sanitize_string(self, value: str) -> str:
        """Remove potentially dangerous characters"""
        # Remove SQL injection patterns
        value = re.sub(r'(--|;|/\*|\*/|#|\/\/|\\)', '', value)
        # Remove XSS patterns
        value = re.sub(r'<script>|</script>|<|>', '', value)
        # Remove control characters
        value = ''.join(c for c in value if c.isprintable())
        return value
    
    def encrypt_key(self, key: str) -> str:
        """Encrypt API key for storage"""
        try:
            encrypted = self.cipher.encrypt(key.encode())
            return encrypted.decode()
        except Exception as e:
            raise ValueError(f"Encryption failed: {str(e)}")
    
    def decrypt_key(self, encrypted_key: str) -> str:
        """Decrypt API key for use"""
        try:
            decrypted = self.cipher.decrypt(encrypted_key.encode())
            return decrypted.decode()
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def check_rate_limit(self, endpoint: str, max_requests: int = 100, window: int = 60) -> bool:
        """Check if request exceeds rate limit (100 req/min)"""
        now = time.time()
        window_start = now - window
        
        # Clean old requests
        if endpoint in self.rate_limits:
            self.rate_limits[endpoint] = [timestamp for timestamp in self.rate_limits[endpoint] if timestamp > window_start]
        
        # Add current request
        if endpoint not in self.rate_limits:
            self.rate_limits[endpoint] = []
        self.rate_limits[endpoint].append(now)
        
        # Check limit
        return len(self.rate_limits[endpoint]) <= max_requests
    
    def log_security_event(self, event_type: str, details: Dict[str, Any], severity: str = "INFO") -> None:
        """Log security-related events"""
        event = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'details': details,
            'severity': severity,
            'source_ip': details.get('source_ip', 'unknown'),
            'user_id': details.get('user_id', 'anonymous')
        }
        self.audit_log.append(event)
        
        # Persist to file (in production, use database)
        with open('security_audit.log', 'a') as f:
            f.write(json.dumps(event) + '\n')
    
    def execute_safe_query(self, query: str, params: Dict[str, Any], engine) -> Any:
        """Execute SQL query with parameterized statements"""
        try:
            # Use parameterized queries to prevent SQL injection
            result = engine.execute(text(query), params)
            return result
        except SQLAlchemyError as e:
            self.log_security_event('sql_error', {'query': query, 'error': str(e)}, 'ERROR')
            raise


class CORSProtection:
    """CORS middleware for web endpoints"""
    
    def __init__(self, allowed_origins: List[str]):
        self.allowed_origins = allowed_origins
    
    def is_origin_allowed(self, origin: str) -> bool:
        """Check if origin is in allowed list"""
        return origin in self.allowed_origins or '*' in self.allowed_origins
    
    def get_cors_headers(self, origin: str) -> Dict[str, str]:
        """Get CORS headers for response"""
        if self.is_origin_allowed(origin):
            return {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true'
            }
        return {}
