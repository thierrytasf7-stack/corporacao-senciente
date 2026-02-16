# AZ-OS API Reference

## Core Modules

### Security Module

#### Class: `Security`

**Constructor**:
```python
Security(db_path: str, encryption_key: str)
```

**Methods**:

- `validate_input(data: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]`
  - Validates and sanitizes user input
  - Raises `ValueError` for missing required fields
  - Raises `TypeError` for type mismatches

- `encrypt_key(key: str) -> str`
  - Encrypts API keys using Fernet encryption
  - Returns base64-encoded encrypted string

- `decrypt_key(encrypted_key: str) -> str`
  - Decrypts previously encrypted keys
  - Returns original plaintext key

- `check_rate_limit(user_id: str, endpoint: str, max_requests: int = 100, window: int = 60) -> bool`
  - Checks if user has exceeded rate limit
  - Returns `True` if request is allowed, `False` otherwise

- `log_security_event(event_type: str, user_id: Optional[int] = None, details: Optional[Dict[str, Any]] = None)`
  - Logs security events to audit log
  - Stores in both memory and database

- `get_audit_logs(limit: int = 100) -> List[Dict[str, Any]]`
  - Retrieves recent audit logs
  - Returns list of log entries with timestamp, event_type, user_id, and details

- `execute_query(query: str, params: tuple = ()) -> list`
  - Executes parameterized SQL query
  - Returns list of result rows

- `execute_update(query: str, params: tuple = ()) -> int`
  - Executes parameterized SQL update
  - Returns number of affected rows

### Error Handler Module

#### Class: `ErrorHandler`

**Constructor**:
```python
ErrorHandler(max_retries: int = 3, backoff_factor: float = 2.0)
```

**Methods**:

- `handle_error(error: Exception, context: Dict[str, Any] = None) -> Dict[str, Any]`
  - Handles errors with retry logic
  - Returns error information including category, retry status, and message

- `categorize(error: Exception) -> ErrorCategory`
  - Categorizes errors as RETRYABLE, FATAL, or TRANSIENT
  - Based on error type and message content

- `should_retry(error: Exception, category: ErrorCategory, context: Dict[str, Any]) -> bool`
  - Determines if error should be retried
  - Considers retry count and backoff time

- `format_message(error: Exception, category: ErrorCategory, should_retry: bool) -> str`
  - Formats user-friendly error message
  - Different messages for retryable vs fatal errors

- `get_error_stats(time_window: int = 3600) -> Dict[str, Any]`
  - Returns error statistics for monitoring
  - Includes total errors, retryable errors, and error types

- `calculate_backoff_time(retry_count: int) -> float`
  - Calculates exponential backoff time
  - Uses backoff_factor to determine wait time

### Telemetry Module

#### Class: `Telemetry`

**Constructor**:
```python
Telemetry(db_path: str, api_key: str, endpoints: List[str] = None)
```

**Methods**:

- `check_health() -> Dict[str, Any]`
  - Performs comprehensive system health check
  - Returns system, services, performance, and latency information

- `get_metrics() -> Dict[str, Any]`
  - Retrieves current system metrics
  - Includes CPU, memory, disk usage, and timestamps

- `should_alert(metrics: Dict[str, Any]) -> bool`
  - Checks if any alert thresholds are breached
  - Returns `True` if alerts are active

- `suggest_actions(metrics: Dict[str, Any]) -> List[str]`
  - Suggests actions based on current metrics
  - Returns list of recommended actions

- `get_status() -> Dict[str, Any]`
  - Gets current telemetry status
  - Includes overall status, error rate, and alert information

- `async_check_health() -> Dict[str, Any]`
  - Async version of health check
  - Uses asyncio for concurrent operations

- `get_historical_metrics(metric_name: str, hours: int = 24) -> List[Dict[str, Any]]`
  - Retrieves historical metrics for specific metric
  - Returns list of timestamped metric values

- `get_alert_history(hours: int = 24) -> List[Dict[str, Any]]`
  - Gets recent alert history
  - Returns list of alert entries with timestamps and messages

- `resolve_alert(alert_id: int)`
  - Marks alert as resolved in database

- `get_health_trends(hours: int = 24) -> Dict[str, Any]`
  - Calculates health trends over time
  - Returns percentage of healthy/degraded checks and trend direction

## CLI Interface

### Command Structure

```bash
az-os [command] [options]
```

### Available Commands

#### System Commands

- `az-os run`
  - Starts AZ-OS services
  - Options: `--config`, `--verbose`, `--timeout`

- `az-os status`
  - Shows system status
  - Options: `--format` (text/json)

- `az-os health`
  - Checks system health
  - Options: `--detailed`

#### Security Commands

- `az-os security audit`
  - Views audit logs

- `az-os security rate-limit`
  - Checks rate limiting
  - Options: `--user`

- `az-os security validate`
  - Validates input

#### Telemetry Commands

- `az-os telemetry metrics`
  - Gets system metrics

- `az-os telemetry alerts`
  - Checks for alerts

- `az-os telemetry status`
  - Views telemetry status

- `az-os telemetry history`
  - Gets historical data
  - Options: `--hours`

#### Error Commands

- `az-os error stats`
  - Views error statistics

- `az-os error retry`
  - Tests retry logic

- `az-os error simulate`
  - Simulates error handling

### Configuration Commands

- `az-os config show`
  - Displays current configuration

- `az-os config set <key> <value>`
  - Sets configuration value

- `az-os config check`
  - Validates configuration

### Database Commands

- `az-os database setup`
  - Sets up database
  - Options: `--path`

- `az-os database backup`
  - Creates database backup

- `az-os database status`
  - Shows database status

- `az-os database repair`
  - Repairs database

- `az-os database optimize`
  - Optimizes database performance

## Error Codes

### System Errors

| Code | Description | Action |
|------|-------------|--------|
| 1000 | Configuration error | Check config file |
| 1001 | Database connection failed | Verify database path |
| 1002 | Encryption key missing | Set encryption key |
| 1003 | Rate limit exceeded | Wait and retry |

### Security Errors

| Code | Description | Action |
|------|-------------|--------|
| 2000 | Input validation failed | Check input data |
| 2001 | SQL injection attempt | Review security logs |
| 2002 | Authentication failed | Verify credentials |
| 2003 | Authorization denied | Check permissions |

### Telemetry Errors

| Code | Description | Action |
|------|-------------|--------|
| 3000 | Health check failed | Check system resources |
| 3001 | Metrics collection failed | Verify monitoring tools |
| 3002 | Alert threshold breached | Review alert settings |
| 3003 | Network connectivity issue | Check network connection |

## Integration Examples

### Python Integration

```python
from az_os.core.security import Security
from az_os.core.telemetry import Telemetry

# Initialize components
security = Security(db_path=":memory:", encryption_key="test-key")
telemetry = Telemetry(db_path=":memory:", api_key="test-key")

# Validate input
try:
    validated = security.validate_input(user_data, schema)
except ValueError as e:
    print(f"Validation error: {e}")

# Check health
health = telemetry.check_health()
if health['system']['status'] != 'healthy':
    print("System health issue detected")
```

### Async Integration

```python
import asyncio
from az_os.core.telemetry import Telemetry

async def monitor_system():
    telemetry = Telemetry(db_path=":memory:", api_key="test-key")
    
    while True:
        health = await telemetry.async_check_health()
        if health['system']['status'] != 'healthy':
            print("Health issue detected!")
        await asyncio.sleep(60)  # Check every minute

asyncio.run(monitor_system())
```

### Error Handling Integration

```python
from az_os.core.error_handler import ErrorHandler

error_handler = ErrorHandler(max_retries=5, backoff_factor=3.0)

def risky_operation():
    # Your operation that might fail
    pass

try:
    risky_operation()
except Exception as e:
    result = error_handler.handle_error(e)
    if result['should_retry']:
        print(f"Retrying ({result['retry_count']}/{result['max_retries']})...")
    else:
        print(f"Error: {result['message']}")
```

## Configuration Reference

### Security Configuration

```yaml
security:
  encryption_key: "your-secret-key"  # Required
  rate_limit: 100  # Requests per minute
  audit_enabled: true  # Log all security events
  input_validation: true  # Enable input sanitization
  sql_injection_protection: true  # Enable SQL injection prevention
```

### Telemetry Configuration

```yaml
telemetry:
  enabled: true  # Enable monitoring
  endpoints:
    - "/api/health"
    - "/api/status"
    - "/api/metrics"
  alert_thresholds:
    cpu_usage: 80.0
    memory_usage: 85.0
    disk_usage: 90.0
    error_rate: 5.0
    latency_p95: 500.0
  sampling_rate: 60  # Seconds between metric collections
```

### Error Handler Configuration

```yaml
error_handler:
  max_retries: 3  # Maximum retry attempts
  backoff_factor: 2.0  # Exponential backoff multiplier
  retryable_errors:
    - ConnectionError
    - TimeoutError
    - sqlite3.OperationalError
  fatal_errors:
    - ValueError
    - TypeError
    - AssertionError
```