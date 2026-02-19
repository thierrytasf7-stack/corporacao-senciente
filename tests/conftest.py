import pytest
import time
from unittest.mock import MagicMock
from src.az_os.core import TaskState, TaskResult
from src.az_os.core.model_router import ModelType, TaskComplexity, Task


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


@pytest.fixture
def sample_task_simple():
    """Create a simple task."""
    return Task(
        task_type="simple_query",
        complexity=TaskComplexity.SIMPLE,
        prompt_length=50,
        urgency=False
    )


@pytest.fixture
def sample_task_medium():
    """Create a medium task."""
    return Task(
        task_type="data_analysis",
        complexity=TaskComplexity.MEDIUM,
        prompt_length=200,
        urgency=True
    )


@pytest.fixture
def sample_task_complex():
    """Create a complex task."""
    return Task(
        task_type="code_generation",
        complexity=TaskComplexity.COMPLEX,
        prompt_length=500,
        urgency=False
    )