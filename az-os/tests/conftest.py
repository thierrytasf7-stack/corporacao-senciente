"""Pytest configuration and fixtures for AZ-OS tests."""

import pytest
import tempfile
import os
import asyncio
from pathlib import Path
from unittest.mock import Mock, AsyncMock, patch

# Configure asyncio for tests
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_dir():
    """Create temporary directory for tests."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_config(temp_dir):
    """Mock configuration."""
    config = {
        "llm": {
            "provider": "openrouter",
            "api_key": "test-key-123",
            "default_model": "arcee-ai/trinity-large-preview:free",
            "timeout": 30,
            "max_retries": 3,
            "cascade": [
                "arcee-ai/trinity-large-preview:free",
                "mistralai/mistral-small-3.1-24b-instruct:free",
            ]
        },
        "database": {
            "path": str(temp_dir / "test.db")
        },
        "logging": {
            "level": "DEBUG",
            "file": str(temp_dir / "test.log")
        },
        "execution": {
            "max_turns": 5,
            "timeout_seconds": 300
        }
    }
    return config


@pytest.fixture
def mock_storage(temp_dir):
    """Mock storage with temporary database."""
    from az_os.core.storage import TaskStorage

    db_path = str(temp_dir / "test.db")
    storage = TaskStorage(db_path=db_path)
    yield storage


@pytest.fixture
def mock_llm_client():
    """Mock LLM client."""
    from az_os.core.llm_client import LLMClient

    client = LLMClient(
        model="test-model",
        api_key="test-key"
    )

    # Mock generate method
    async def mock_generate(prompt, **kwargs):
        return f"Mock response to: {prompt[:50]}"

    client.generate = AsyncMock(side_effect=mock_generate)
    client.stream = AsyncMock()
    client.chat = AsyncMock(return_value="Mock chat response")

    return client


@pytest.fixture
def sample_task():
    """Sample task data."""
    return {
        "id": "task-test-123",
        "description": "Test task description",
        "model": "arcee-ai/trinity-large-preview:free",
        "status": "pending",
        "created_at": 1706123456.789,
        "completed_at": None,
        "result": None,
        "cost_usd": 0.0
    }


@pytest.fixture
def sample_task_logs():
    """Sample task logs."""
    return [
        {
            "task_id": "task-test-123",
            "timestamp": 1706123456.789,
            "level": "info",
            "message": "Task started"
        },
        {
            "task_id": "task-test-123",
            "timestamp": 1706123457.789,
            "level": "debug",
            "message": "Processing step 1"
        },
        {
            "task_id": "task-test-123",
            "timestamp": 1706123458.789,
            "level": "info",
            "message": "Task completed"
        }
    ]


@pytest.fixture(autouse=True)
def mock_environment(monkeypatch, temp_dir):
    """Mock environment variables for all tests."""
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key-123")
    monkeypatch.setenv("AZOS_CONFIG", str(temp_dir / "config.yaml"))
    monkeypatch.setenv("AZOS_LOG_LEVEL", "DEBUG")


@pytest.fixture
def mock_security():
    """Mock security components."""
    from az_os.core.security import (
        InputValidator,
        APIKeyEncryption,
        RateLimiter,
        AuditLogger
    )

    validator = InputValidator()
    encryptor = APIKeyEncryption(master_password="test-password")
    limiter = RateLimiter(max_requests=10, window_seconds=60)
    audit = AuditLogger(log_file=str(Path(tempfile.gettempdir()) / "audit.log"))

    return {
        "validator": validator,
        "encryptor": encryptor,
        "limiter": limiter,
        "audit": audit
    }


@pytest.fixture
def mock_telemetry():
    """Mock telemetry components."""
    from az_os.core.telemetry import (
        HealthChecker,
        MetricsCollector,
        AlertManager
    )

    checker = HealthChecker()
    collector = MetricsCollector()
    alerts = AlertManager()

    return {
        "checker": checker,
        "collector": collector,
        "alerts": alerts
    }


@pytest.fixture
def mock_http_response():
    """Mock HTTP response."""
    mock = Mock()
    mock.status_code = 200
    mock.json.return_value = {"data": "test"}
    mock.text = "Test response"
    return mock


@pytest.fixture
def mock_react_context():
    """Mock ReAct loop context."""
    return {
        "task_description": "Test task",
        "max_turns": 5,
        "initial_context": {"file": "test.py"},
        "tools": ["file_read", "file_write", "shell_exec"]
    }


# Helper functions

def assert_task_valid(task):
    """Assert task has valid structure."""
    assert "id" in task
    assert "description" in task
    assert "status" in task
    assert task["status"] in ["pending", "running", "completed", "failed", "cancelled"]


def assert_health_check_valid(check):
    """Assert health check has valid structure."""
    assert "name" in check
    assert "status" in check
    assert "message" in check
    assert "timestamp" in check
    assert "duration_ms" in check


def assert_metrics_valid(metrics):
    """Assert metrics have valid structure."""
    assert "timestamp" in metrics
    # Add more assertions as needed
