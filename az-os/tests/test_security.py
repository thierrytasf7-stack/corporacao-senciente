"""Tests for security module (az_os.core.security)."""

import pytest
import time
from az_os.core.security import (
    InputValidator,
    APIKeyEncryption,
    RateLimiter,
    AuditLogger,
    validator,
    rate_limiter,
    audit_logger,
    require_auth,
    rate_limit
)


class TestInputValidator:
    """Test input validation."""

    def test_validate_task_id_valid(self):
        assert validator.validate("task-123", "task_id")
        assert validator.validate("task_abc_456", "task_id")

    def test_validate_task_id_invalid(self):
        assert not validator.validate("task@123", "task_id")  # Special char
        assert not validator.validate("task 123", "task_id")  # Space
        assert not validator.validate("a" * 100, "task_id")   # Too long

    def test_validate_model_name(self):
        assert validator.validate("claude-3-sonnet", "model_name")
        assert validator.validate("arcee-ai/trinity:free", "model_name")
        assert not validator.validate("model with spaces", "model_name")

    def test_validate_file_path(self):
        assert validator.validate("src/main.py", "file_path")
        assert validator.validate("./test/file.txt", "file_path")
        assert not validator.validate("/etc/passwd/../../../root", "file_path")  # Path traversal

    def test_validate_email(self):
        assert validator.validate("user@example.com", "email")
        assert validator.validate("test.user+tag@domain.co.uk", "email")
        assert not validator.validate("invalid-email", "email")
        assert not validator.validate("@example.com", "email")

    def test_validate_unknown_type(self):
        assert not validator.validate("value", "unknown_type")

    def test_sanitize_sql(self):
        dangerous = "'; DROP TABLE users; --"
        sanitized = validator.sanitize_sql(dangerous)
        assert "DROP" not in sanitized
        assert "--" not in sanitized
        assert ";" not in sanitized

    def test_sanitize_path(self):
        assert validator.sanitize_path("../../etc/passwd") == "etc/passwd"
        assert validator.sanitize_path("~/secret") == "secret"
        assert validator.sanitize_path("/absolute/path") == "absolute/path"


class TestAPIKeyEncryption:
    """Test API key encryption."""

    def test_encrypt_decrypt(self):
        encryptor = APIKeyEncryption(master_password="test-secret-123")
        api_key = "sk-1234567890abcdef"

        # Encrypt
        encrypted = encryptor.encrypt(api_key)
        assert encrypted != api_key
        assert len(encrypted) > len(api_key)

        # Decrypt
        decrypted = encryptor.decrypt(encrypted)
        assert decrypted == api_key

    def test_decrypt_wrong_password(self):
        encryptor1 = APIKeyEncryption(master_password="password1")
        encryptor2 = APIKeyEncryption(master_password="password2")

        api_key = "sk-1234567890"
        encrypted = encryptor1.encrypt(api_key)

        with pytest.raises(Exception):  # Cryptography error
            encryptor2.decrypt(encrypted)

    def test_encrypt_empty_string(self):
        encryptor = APIKeyEncryption(master_password="test")
        encrypted = encryptor.encrypt("")
        decrypted = encryptor.decrypt(encrypted)
        assert decrypted == ""


class TestRateLimiter:
    """Test rate limiting."""

    def test_allows_requests_under_limit(self):
        limiter = RateLimiter(max_requests=5, window_seconds=1)
        user = "user-123"

        for _ in range(5):
            assert limiter.is_allowed(user)

    def test_blocks_requests_over_limit(self):
        limiter = RateLimiter(max_requests=3, window_seconds=1)
        user = "user-123"

        # First 3 allowed
        for _ in range(3):
            assert limiter.is_allowed(user)

        # 4th blocked
        assert not limiter.is_allowed(user)

    def test_retry_after(self):
        limiter = RateLimiter(max_requests=2, window_seconds=1)
        user = "user-123"

        # Fill bucket
        limiter.is_allowed(user)
        limiter.is_allowed(user)
        limiter.is_allowed(user)  # Blocked

        # Check retry_after
        retry = limiter.get_retry_after(user)
        assert 0 <= retry <= 1

    def test_window_resets(self):
        limiter = RateLimiter(max_requests=2, window_seconds=1)
        user = "user-123"

        # Fill bucket
        assert limiter.is_allowed(user)
        assert limiter.is_allowed(user)
        assert not limiter.is_allowed(user)

        # Wait for window reset
        time.sleep(1.1)

        # Should be allowed again
        assert limiter.is_allowed(user)

    def test_multiple_users(self):
        limiter = RateLimiter(max_requests=2, window_seconds=1)

        # User 1 fills quota
        assert limiter.is_allowed("user-1")
        assert limiter.is_allowed("user-1")
        assert not limiter.is_allowed("user-1")

        # User 2 still has quota
        assert limiter.is_allowed("user-2")
        assert limiter.is_allowed("user-2")


class TestAuditLogger:
    """Test audit logging."""

    def test_log_event(self, temp_dir):
        log_file = str(temp_dir / "audit.log")
        logger = AuditLogger(log_file=log_file)

        logger.log_event(
            event_type="test_event",
            user="test-user",
            action="test_action",
            resource="test-resource",
            status="success",
            details={"key": "value"}
        )

        # Check log file was created
        assert (temp_dir / "audit.log").exists()

        # Check log content
        with open(log_file) as f:
            content = f.read()
            assert "test_event" in content
            assert "test-user" in content
            assert "success" in content


class TestDecorators:
    """Test security decorators."""

    def test_require_auth_decorator(self):
        @require_auth
        def protected_function():
            return "success"

        # Should not raise (mock implementation)
        result = protected_function()
        assert result == "success"

    def test_rate_limit_decorator(self):
        call_count = 0

        @rate_limit(max_requests=3, window=1)
        def limited_function():
            nonlocal call_count
            call_count += 1
            return "success"

        # First 3 calls succeed
        for _ in range(3):
            assert limited_function() == "success"

        # 4th call raises PermissionError
        with pytest.raises(PermissionError):
            limited_function()

        assert call_count == 3


class TestSecurityIntegration:
    """Integration tests for security components."""

    def test_full_security_pipeline(self, mock_security, temp_dir):
        validator = mock_security["validator"]
        encryptor = mock_security["encryptor"]
        limiter = mock_security["limiter"]
        audit = mock_security["audit"]

        # 1. Validate input
        task_id = "task-secure-123"
        assert validator.validate(task_id, "task_id")

        # 2. Check rate limit
        user_id = "user-456"
        assert limiter.is_allowed(user_id)

        # 3. Encrypt API key
        api_key = "sk-real-api-key-123"
        encrypted_key = encryptor.encrypt(api_key)
        assert encrypted_key != api_key

        # 4. Log event
        audit.log_event(
            event_type="task_creation",
            user=user_id,
            action="create_task",
            resource=task_id,
            status="success"
        )

        # 5. Decrypt API key for use
        decrypted_key = encryptor.decrypt(encrypted_key)
        assert decrypted_key == api_key


@pytest.mark.parametrize("input_value,field_type,expected", [
    ("task-123", "task_id", True),
    ("task@invalid", "task_id", False),
    ("valid@email.com", "email", True),
    ("invalid-email", "email", False),
    ("claude-3-sonnet", "model_name", True),
    ("model with spaces", "model_name", False),
])
def test_validation_parametrized(input_value, field_type, expected):
    """Parametrized validation tests."""
    assert validator.validate(input_value, field_type) == expected


def test_global_instances():
    """Test global singleton instances."""
    assert validator is not None
    assert rate_limiter is not None
    assert audit_logger is not None
