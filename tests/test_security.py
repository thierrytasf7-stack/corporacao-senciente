import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from src.az_os.core.security import Security, CORSProtection


class TestSecurity:
    """Test security module functionality"""
    
    def test_input_validation_valid(self):
        """Test valid input validation"""
        security = Security(encryption_key=None)
        
        schema = {
            'username': {'type': str, 'min_length': 3, 'max_length': 20, 'pattern': r'^[a-zA-Z0-9_]+$'},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'},
            'age': {'type': int, 'min_length': 1, 'max_length': 3}
        }
        
        data = {
            'username': 'test_user',
            'email': 'test@example.com',
            'age': 25
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is True
        assert errors == ""
    
    def test_input_validation_invalid(self):
        """Test invalid input validation"""
        security = Security(encryption_key=None)
        
        schema = {
            'username': {'type': str, 'min_length': 3, 'max_length': 20, 'pattern': r'^[a-zA-Z0-9_]+$'},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'},
            'age': {'type': int, 'min_length': 1, 'max_length': 3}
        }
        
        data = {
            'username': 'te',  # Too short
            'email': 'invalid-email',
            'age': 'twenty-five'  # Wrong type
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is False
        assert "Field 'username' must be at least 3 characters" in errors
        assert "Field 'email' format is invalid" in errors
        assert "Field 'age' must be int" in errors
    
    def test_input_sanitization(self):
        """Test input sanitization"""
        security = Security(encryption_key=None)
        
        malicious_input = "<script>alert('xss');</script> DROP TABLE users; --"
        sanitized = security._sanitize_string(malicious_input)
        
        assert "<script>" not in sanitized
        assert "DROP TABLE" not in sanitized
        assert "--" not in sanitized
        assert "alert('xss');" not in sanitized
    
    def test_key_encryption_decryption(self):
        """Test API key encryption and decryption"""
        security = Security(encryption_key=None)
        
        original_key = "my-secret-api-key-12345"
        encrypted = security.encrypt_key(original_key)
        decrypted = security.decrypt_key(encrypted)
        
        assert decrypted == original_key
    
    def test_cors_protection(self):
        """Test CORS protection"""
        cors = CORSProtection(allowed_origins=['https://example.com'])
        
        # Test allowed origin
        assert cors.is_origin_allowed('https://example.com') is True
        
        # Test disallowed origin
        assert cors.is_origin_allowed('https://evil.com') is False
    
    def test_security_headers(self):
        """Test security headers"""
        security = Security(encryption_key=None)
        
        headers = security.get_security_headers()
        
        assert 'X-Content-Type-Options' in headers
        assert 'X-Frame-Options' in headers
        assert 'X-XSS-Protection' in headers
        assert 'Strict-Transport-Security' in headers
    
    def test_rate_limiting(self):
        """Test rate limiting"""
        security = Security(encryption_key=None)
        
        # Test rate limiting
        assert security.is_rate_limited('user1') is False
        
        # Simulate multiple requests
        for i in range(10):
            security.increment_request_count('user1')
        
        assert security.is_rate_limited('user1') is True
    
    def test_input_validation_schema(self):
        """Test input validation schema"""
        security = Security(encryption_key=None)
        
        schema = {
            'username': {'type': str, 'required': True},
            'password': {'type': str, 'required': True, 'min_length': 8},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'},
            'age': {'type': int, 'min_length': 1, 'max_length': 3}
        }
        
        # Test valid data
        data = {
            'username': 'test_user',
            'password': 'password123',
            'email': 'test@example.com',
            'age': 25
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is True
        assert errors == ""
        
        # Test missing required field
        data = {
            'username': 'test_user',
            'email': 'test@example.com',
            'age': 25
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is False
        assert "Missing required field: password" in errors
    
    def test_input_validation_patterns(self):
        """Test input validation patterns"""
        security = Security(encryption_key=None)
        
        schema = {
            'username': {'type': str, 'pattern': r'^[a-zA-Z0-9_]+$'},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'},
            'phone': {'type': str, 'pattern': r'^\+?[1-9]\d{1,14}$'}
        }
        
        # Test valid patterns
        data = {
            'username': 'test_user123',
            'email': 'test@example.com',
            'phone': '+1234567890'
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is True
        assert errors == ""
        
        # Test invalid patterns
        data = {
            'username': 'test user!',  # Space and special character
            'email': 'invalid-email',
            'phone': '12345'  # Missing country code
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is False
        assert "Field 'username' format is invalid" in errors
        assert "Field 'email' format is invalid" in errors
        assert "Field 'phone' format is invalid" in errors
    
    def test_input_validation_length(self):
        """Test input validation length"""
        security = Security(encryption_key=None)
        
        schema = {
            'username': {'type': str, 'min_length': 3, 'max_length': 20},
            'description': {'type': str, 'max_length': 500},
            'age': {'type': int, 'min_length': 1, 'max_length': 3}
        }
        
        # Test valid lengths
        data = {
            'username': 'user',
            'description': 'A' * 500,
            'age': 25
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is True
        assert errors == ""
        
        # Test invalid lengths
        data = {
            'username': 'ab',  # Too short
            'description': 'A' * 501,  # Too long
            'age': 1000  # Too large
        }
        
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is False
        assert "Field 'username' must be at least 3 characters" in errors
        assert "Field 'description' must be at most 500 characters" in errors
        assert "Field 'age' must be at most 3 characters" in errors
    
    def test_security_encryption(self):
        """Test security encryption"""
        security = Security(encryption_key=None)
        
        # Test encryption with key
        security_with_key = Security(encryption_key='test-key')
        original = "sensitive data"
        encrypted = security_with_key.encrypt_key(original)
        decrypted = security_with_key.decrypt_key(encrypted)
        
        assert decrypted == original
        
        # Test encryption without key (should return original)
        original = "non-sensitive data"
        encrypted = security.encrypt_key(original)
        decrypted = security.decrypt_key(encrypted)
        
        assert decrypted == original
    
    def test_security_decryption_failure(self):
        """Test security decryption failure"""
        security = Security(encryption_key=None)
        
        # Test decryption with invalid data
        invalid_data = "invalid-encrypted-data"
        
        with pytest.raises(ValueError):
            security.decrypt_key(invalid_data)
    
    def test_cors_wildcard_origin(self):
        """Test CORS wildcard origin"""
        cors = CORSProtection(allowed_origins=['*'])
        
        # Test wildcard origin
        assert cors.is_origin_allowed('https://any-domain.com') is True
        assert cors.is_origin_allowed('https://another-domain.com') is True
    
    def test_cors_multiple_origins(self):
        """Test CORS multiple origins"""
        cors = CORSProtection(allowed_origins=['https://example.com', 'https://api.example.com'])
        
        # Test allowed origins
        assert cors.is_origin_allowed('https://example.com') is True
        assert cors.is_origin_allowed('https://api.example.com') is True
        
        # Test disallowed origin
        assert cors.is_origin_allowed('https://evil.com') is False
    
    def test_security_headers_content(self):
        """Test security headers content"""
        security = Security(encryption_key=None)
        
        headers = security.get_security_headers()
        
        assert headers['X-Content-Type-Options'] == 'nosniff'
        assert headers['X-Frame-Options'] == 'DENY'
        assert headers['X-XSS-Protection'] == '1; mode=block'
        assert headers['Strict-Transport-Security'] == 'max-age=31536000; includeSubDomains'
    
    def test_rate_limiting_reset(self):
        """Test rate limiting reset"""
        security = Security(encryption_key=None)
        
        user_id = 'test_user'
        
        # Simulate requests
        for i in range(5):
            security.increment_request_count(user_id)
        
        assert security.is_rate_limited(user_id) is False
        
        # Simulate more requests to hit limit
        for i in range(6):
            security.increment_request_count(user_id)
        
        assert security.is_rate_limited(user_id) is True
        
        # Reset rate limit
        security.reset_rate_limit(user_id)
        assert security.is_rate_limited(user_id) is False


class TestSecurityIntegration:
    """Test security integration"""
    
    def test_security_pipeline(self):
        """Test security pipeline"""
        security = Security(encryption_key=None)
        
        # Test complete security pipeline
        schema = {
            'username': {'type': str, 'min_length': 3, 'max_length': 20, 'pattern': r'^[a-zA-Z0-9_]+$'},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'},
            'password': {'type': str, 'min_length': 8}
        }
        
        data = {
            'username': 'test_user',
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        # Validate input
        is_valid, errors = security.validate_input(data, schema)
        assert is_valid is True
        assert errors == ""
        
        # Sanitize input
        sanitized_data = security.sanitize_input(data)
        assert sanitized_data['username'] == 'test_user'
        assert sanitized_data['email'] == 'test@example.com'
        assert sanitized_data['password'] == 'password123'
        
        # Encrypt sensitive data
        encrypted_password = security.encrypt_key(data['password'])
        decrypted_password = security.decrypt_key(encrypted_password)
        
        assert decrypted_password == data['password']
    
    def test_cors_integration(self):
        """Test CORS integration"""
        cors = CORSProtection(allowed_origins=['https://example.com'])
        security = Security(encryption_key=None)
        
        # Test CORS with security
        request_origin = 'https://example.com'
        
        # Check if origin is allowed
        assert cors.is_origin_allowed(request_origin) is True
        
        # Get security headers
        headers = security.get_security_headers()
        assert 'X-Content-Type-Options' in headers
        
        # Combine CORS and security headers
        cors_headers = cors.get_cors_headers(request_origin)
        combined_headers = {**headers, **cors_headers}
        
        assert 'Access-Control-Allow-Origin' in combined_headers
        assert combined_headers['Access-Control-Allow-Origin'] == request_origin
    
    def test_rate_limiting_integration(self):
        """Test rate limiting integration"""
        security = Security(encryption_key=None)
        
        user_id = 'test_user'
        
        # Test rate limiting with security
        for i in range(10):
            # Simulate request
            security.increment_request_count(user_id)
            
            # Check if rate limited
            if i >= 9:
                assert security.is_rate_limited(user_id) is True
            else:
                assert security.is_rate_limited(user_id) is False
        
        # Reset rate limit
        security.reset_rate_limit(user_id)
        assert security.is_rate_limited(user_id) is False