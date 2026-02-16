# AZ-OS v2.0 - API Reference

## Overview

AZ-OS provides a Python API for programmatic task execution and monitoring.

## Core Modules

### ExecutionEngine

Execute commands and manage task lifecycle.

```python
from az_os.core.execution_engine import ExecutionEngine

engine = ExecutionEngine()

# Execute Python code
result = await engine.execute_python(
    code="print('Hello, World!')",
    timeout=30
)

# Execute shell command
result = await engine.execute_command(
    command="ls -la",
    timeout=10
)

# Result format
# ExecutionResult(
#     exit_code=0,
#     stdout="...",
#     stderr="",
#     elapsed_ms=123.45
# )
```

### LLMClient

Interact with language models.

```python
from az_os.core.llm_client import LLMClient

client = LLMClient(
    model="arcee-ai/trinity-large-preview:free",
    api_key="your-key"
)

# Generate completion
response = await client.generate(
    prompt="Explain quantum computing",
    max_tokens=500,
    temperature=0.7
)

# Stream completion
async for chunk in client.stream(prompt="Write a story"):
    print(chunk, end="", flush=True)

# Chat format
messages = [
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi! How can I help?"},
    {"role": "user", "content": "Explain AI"}
]
response = await client.chat(messages)
```

### Storage

Persist and query task data.

```python
from az_os.core.storage import TaskStorage

storage = TaskStorage(db_path="~/.az-os/database.db")

# Create task
task_id = storage.create_task(
    description="Parse CSV file",
    model="claude-3-sonnet",
    status="pending"
)

# Get task
task = storage.get_task(task_id)

# Update status
storage.update_task_status(task_id, "completed")

# List tasks
tasks = storage.list_tasks(
    status="completed",
    limit=10,
    offset=0
)

# Add log
storage.add_log(
    task_id=task_id,
    level="info",
    message="Task started"
)

# Track cost
storage.track_cost(
    task_id=task_id,
    model="claude-3-sonnet",
    input_tokens=100,
    output_tokens=50,
    cost_usd=0.005
)
```

### Security

Input validation and encryption.

```python
from az_os.core.security import (
    InputValidator,
    APIKeyEncryption,
    RateLimiter,
    AuditLogger,
    require_auth,
    rate_limit
)

# Validate input
validator = InputValidator()
is_valid = validator.validate("task-123", "task_id")

# Encrypt API key
encryptor = APIKeyEncryption(master_password="secret")
encrypted = encryptor.encrypt("sk-1234567890")
decrypted = encryptor.decrypt(encrypted)

# Rate limiting
limiter = RateLimiter(max_requests=60, window_seconds=60)
if limiter.is_allowed("user-123"):
    # Process request
    pass
else:
    retry_after = limiter.get_retry_after("user-123")
    print(f"Rate limited. Retry after {retry_after}s")

# Audit logging
audit = AuditLogger()
audit.log_event(
    event_type="task_execution",
    user="user-123",
    action="create_task",
    resource="task-456",
    status="success",
    details={"model": "claude-3-sonnet"}
)

# Decorators
@require_auth
@rate_limit(max_requests=10, window=60)
def sensitive_operation():
    pass
```

### ErrorHandler

Automatic retry and error recovery.

```python
from az_os.core.error_handler import (
    retry_with_backoff,
    ErrorHandler,
    AZOSError,
    NetworkError,
    RateLimitError
)

# Retry decorator
@retry_with_backoff(
    max_retries=3,
    base_delay=1.0,
    exponential_base=2.0
)
async def unstable_operation():
    # May fail temporarily
    pass

# Error handler
handler = ErrorHandler()
try:
    risky_operation()
except Exception as e:
    user_message = handler.handle(
        e,
        context="risky_operation",
        raise_on_error=False
    )
    print(user_message)

# Custom errors
raise NetworkError("Connection timeout")
raise RateLimitError("Too many requests", retry_after=60)
```

### Telemetry

Health checks and metrics.

```python
from az_os.core.telemetry import (
    HealthChecker,
    MetricsCollector,
    AlertManager,
    HealthStatus,
    AlertLevel
)

# Health checks
checker = HealthChecker()
cpu_health = checker.run_check("cpu")
all_health = checker.run_all_checks()
overall_status = checker.get_overall_status()

# Custom health check
def check_api():
    # Check API connectivity
    return {
        "status": HealthStatus.HEALTHY,
        "message": "API responsive",
        "details": {"latency_ms": 45}
    }

checker.register_check("api", check_api)

# Metrics
collector = MetricsCollector()
system_metrics = collector.collect_system_metrics()
service_metrics = collector.collect_service_metrics()

# Alerts
alerts = AlertManager()
alerts.trigger_alert(
    alert_id="high-cpu",
    level=AlertLevel.WARNING,
    message="CPU usage >70%",
    details={"cpu_percent": 75}
)

recent = alerts.get_recent_alerts(minutes=60)
```

### ReActLoop

Autonomous reasoning and action.

```python
from az_os.core.react_loop import ReActLoop

loop = ReActLoop(
    llm_client=client,
    max_turns=5
)

# Run autonomous task
result = await loop.run(
    task_description="Find bug in code",
    initial_context={"file": "src/main.py"}
)

# Get execution summary
summary = result.get_summary()
print(f"Completed in {summary['turns']} turns")
print(f"Actions: {summary['action_types']}")
```

### ModelRouter

Intelligent model selection.

```python
from az_os.core.model_router import ModelRouter, TaskComplexity

router = ModelRouter()

# Select best model for task
model = router.select_model(
    task_description="Translate paragraph to Spanish",
    context_length=500
)

# Learn from results
router.learn_from_result(
    model_name="claude-3-sonnet",
    complexity=TaskComplexity.MEDIUM,
    success=True,
    cost=0.01,
    latency=1.5
)

# Get model statistics
stats = router.get_model_stats("claude-3-sonnet")
```

### MemoryManager

Persistent task memory.

```python
from az_os.core.memory_manager import MemoryManager

memory = MemoryManager()

# Add memory
memory.add_memory(
    task_id="task-123",
    lesson="Use pandas for CSV parsing",
    category="best_practice",
    success=True,
    score=9.0
)

# Search memories
memories = memory.search_memories(
    query="CSV parsing",
    top_k=5
)

# Consolidate old memories
memory.consolidate()

# Cleanup
memory.cleanup_old_memories(days=90)
```

### CheckpointManager

Task state persistence.

```python
from az_os.core.checkpoint_manager import CheckpointManager

manager = CheckpointManager()

# Create checkpoint
checkpoint_id = manager.create_checkpoint(
    task_id="task-123",
    state={"step": 5, "data": {...}}
)

# List checkpoints
checkpoints = manager.list_checkpoints("task-123")

# Restore checkpoint
state = manager.restore_checkpoint(checkpoint_id)

# Rollback (git revert)
manager.rollback("task-123", checkpoint_id)

# Delete checkpoint
manager.delete_checkpoint(checkpoint_id)
```

### RAGEngine

Semantic search and context retrieval.

```python
from az_os.core.rag_engine import RAGEngine

rag = RAGEngine()

# Initialize (loads docs)
await rag.initialize()

# Index document
rag.index_document(
    doc_id="readme",
    content="AZ-OS is a cognitive operating system...",
    metadata={"type": "documentation"}
)

# Search
results = rag.search(query="how to run tasks", top_k=3)

# Get context for task
context = rag.get_context(task_id="task-123")
```

## CLI Integration

Use the API from command line:

```python
# cli_example.py
import asyncio
from az_os.core.llm_client import LLMClient

async def main():
    client = LLMClient()
    response = await client.generate("Explain AI")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())
```

```bash
python cli_example.py
```

## Error Handling

All exceptions inherit from `AZOSError`:

```python
from az_os.core.error_handler import (
    AZOSError,
    NetworkError,
    RateLimitError,
    ValidationError
)

try:
    result = await client.generate(prompt)
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except NetworkError as e:
    print(f"Network issue: {e.user_message()}")
except AZOSError as e:
    print(f"Error: {e.message}")
```

## Type Hints

All modules fully typed for IDE support:

```python
from typing import Optional, List, Dict, Any
from az_os.core.storage import TaskStorage

storage: TaskStorage = TaskStorage()
task: Optional[Dict[str, Any]] = storage.get_task("task-123")
tasks: List[Dict[str, Any]] = storage.list_tasks(limit=10)
```

## Testing

Mock components for testing:

```python
from unittest.mock import AsyncMock
from az_os.core.llm_client import LLMClient

# Mock LLM client
client = LLMClient()
client.generate = AsyncMock(return_value="Mocked response")

# Test
result = await client.generate("Test prompt")
assert result == "Mocked response"
```

## Next Steps

- [Architecture](ARCHITECTURE.md) - System design
- [Security](SECURITY.md) - Security best practices
- [Troubleshooting](TROUBLESHOOTING.md) - Debug guide
