import pytest
import time
from unittest.mock import MagicMock
from src.az_os.core import TaskState, TaskResult


@pytest.fixture
def sample_task():
    """Create a sample task."""
    return TaskState(
        task_id="sample_task",
        task_type="test",
        description="Sample task for testing",
        created_at=time.time(),
        priority="medium"
    )


@pytest.fixture
def sample_result():
    """Create a sample task result."""
    return TaskResult(
        task_id="sample_task",
        status="completed",
        output="Sample output",
        error=None,
        metrics={}
    )


@pytest.fixture
def mock_llm_client():
    """Create a mock LLM client."""
    return MagicMock()


@pytest.fixture
def mock_mcp_client():
    """Create a mock MCP client."""
    return MagicMock()


@pytest.fixture
def mock_scheduler():
    """Create a mock scheduler."""
    return MagicMock()


@pytest.fixture
def mock_telemetry():
    """Create a mock telemetry."""
    return MagicMock()


@pytest.fixture
def mock_self_healer():
    """Create a mock self-healer."""
    return MagicMock()


@pytest.fixture
def mock_react_loop():
    """Create a mock react loop."""
    return MagicMock()


@pytest.fixture
def sample_error_detection():
    """Create a sample error detection."""
    return {
        "error_type": "transient",
        "error_message": "Connection timeout",
        "timestamp": time.time(),
        "context": {
            "task_id": "test_task",
            "task_type": "test"
        }
    }


@pytest.fixture
def sample_recovery_attempt():
    """Create a sample recovery attempt."""
    return {
        "strategy": "exponential_backoff",
        "timestamp": time.time(),
        "success": True,
        "error_message": None,
        "duration": 1.5
    }


@pytest.fixture
def sample_metric():
    """Create a sample metric."""
    return {
        "name": "test.metric",
        "value": 42.0,
        "type": "gauge",
        "timestamp": time.time(),
        "labels": {"env": "test"},
        "unit": "units"
    }