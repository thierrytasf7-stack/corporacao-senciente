# AZ-OS v2.0 - User Guide

## Quick Start

### Basic Commands

```bash
# Run a task
az-os run "Create Python script to parse CSV"

# List all tasks
az-os list

# Get task status
az-os status task-123

# Pause running task
az-os pause task-123

# Resume paused task
az-os resume task-123

# Cancel task
az-os cancel task-123
```

### Interactive TUI Dashboard

```bash
az-os dashboard
```

## CLI Reference

### `az-os run`

Execute a new task with AI assistance.

```bash
az-os run TASK_DESCRIPTION [OPTIONS]
```

**Options:**
- `--model MODEL` - LLM model to use (default: config)
- `--max-turns INT` - Maximum reasoning turns (default: 5)
- `--timeout SECONDS` - Task timeout (default: 300)
- `--context FILE` - Load context from file
- `--output FILE` - Save result to file
- `--watch` - Watch execution in real-time

**Examples:**

```bash
# Simple task
az-os run "Calculate factorial of 10"

# With specific model
az-os run "Translate text to Spanish" --model claude-3-sonnet

# With context file
az-os run "Fix bug" --context error_log.txt

# Watch execution
az-os run "Build Docker image" --watch
```

### `az-os list`

List tasks with filtering and sorting.

```bash
az-os list [OPTIONS]
```

**Options:**
- `--status STATUS` - Filter by status (pending/running/completed/failed)
- `--limit INT` - Max results (default: 50)
- `--sort FIELD` - Sort by field (created/updated/cost)
- `--reverse` - Reverse sort order
- `--format FORMAT` - Output format (table/json/csv)

**Examples:**

```bash
# Recent tasks
az-os list --limit 10

# Failed tasks
az-os list --status failed

# JSON output
az-os list --format json
```

### `az-os status`

Get detailed status of a task.

```bash
az-os status TASK_ID
```

**Output:**
- Task metadata
- Current status
- Execution logs
- Cost breakdown
- Performance metrics

### `az-os pause`

Pause a running task.

```bash
az-os pause TASK_ID
```

Creates checkpoint for later resumption.

### `az-os resume`

Resume a paused task.

```bash
az-os resume TASK_ID [--from-checkpoint CHECKPOINT_ID]
```

**Options:**
- `--from-checkpoint ID` - Resume from specific checkpoint

### `az-os cancel`

Cancel a running or paused task.

```bash
az-os cancel TASK_ID [--force]
```

**Options:**
- `--force` - Force cancellation without cleanup

### `az-os config`

Manage configuration.

```bash
# Show current config
az-os config show

# Set value
az-os config set llm.default_model claude-3-sonnet

# Get value
az-os config get llm.api_key

# Reset to defaults
az-os config reset
```

### `az-os doctor`

Run system diagnostics.

```bash
az-os doctor [--fix]
```

**Options:**
- `--fix` - Attempt automatic fixes

**Checks:**
- Python version
- Dependencies
- Database connectivity
- API keys
- System resources
- Configuration validity

### `az-os logs`

View execution logs.

```bash
az-os logs [TASK_ID] [OPTIONS]
```

**Options:**
- `--level LEVEL` - Filter by level (debug/info/warning/error)
- `--tail INT` - Show last N lines (default: 100)
- `--follow` - Follow live logs

**Examples:**

```bash
# Task logs
az-os logs task-123

# Follow live
az-os logs task-123 --follow

# Errors only
az-os logs task-123 --level error
```

### `az-os metrics`

View cost and performance metrics.

```bash
az-os metrics [OPTIONS]
```

**Options:**
- `--period DAYS` - Time period (default: 7)
- `--by MODEL/DATE` - Group by model or date
- `--export FILE` - Export to CSV

**Example Output:**

```
Cost Summary (Last 7 days):
  Total: $2.45
  By Model:
    Claude Sonnet: $1.20 (49%)
    Gemini Pro: $0.95 (39%)
    Trinity: $0.30 (12%)

Performance:
  Tasks completed: 42
  Average duration: 45s
  Success rate: 95.2%
```

### `az-os init`

Initialize new configuration.

```bash
az-os init [--force]
```

**Options:**
- `--force` - Overwrite existing config

### `az-os upgrade`

Upgrade AZ-OS to latest version.

```bash
az-os upgrade [--check]
```

**Options:**
- `--check` - Check for updates without upgrading

## Configuration File

Location: `~/.az-os/config.yaml`

```yaml
llm:
  provider: openrouter
  api_key: ${OPENROUTER_API_KEY}
  default_model: arcee-ai/trinity-large-preview:free
  timeout: 30
  max_retries: 3

  cascade:
    - arcee-ai/trinity-large-preview:free
    - mistralai/mistral-small-3.1-24b-instruct:free
    - google/gemma-3-27b-it:free

database:
  path: ~/.az-os/database.db

logging:
  level: INFO
  file: ~/.az-os/logs/az-os.log
  max_size_mb: 10
  backup_count: 5

execution:
  max_turns: 5
  timeout_seconds: 300
  checkpoint_interval: 60

telemetry:
  enabled: true
  report_interval: 300

security:
  rate_limit_requests: 60
  rate_limit_window: 60
  encrypt_api_keys: true
  audit_logging: true
```

## Environment Variables

- `OPENROUTER_API_KEY` - OpenRouter API key
- `ANTHROPIC_API_KEY` - Anthropic API key (optional)
- `AZOS_CONFIG` - Custom config file path
- `AZOS_LOG_LEVEL` - Override log level (DEBUG/INFO/WARNING/ERROR)
- `AZOS_DATABASE` - Custom database path

## Examples

### Task with Multiple Steps

```bash
az-os run "Build full-stack app: 1) Create React frontend 2) Node.js backend 3) Docker compose"
```

### Code Review

```bash
az-os run "Review this code for bugs and improvements" --context src/main.py
```

### Data Processing

```bash
az-os run "Parse CSV, calculate statistics, generate report" --context data.csv --output report.txt
```

### Debugging

```bash
az-os run "Analyze error and suggest fixes" --context error.log --watch
```

## Best Practices

1. **Use Descriptive Task Names**: Clear descriptions improve AI understanding
2. **Provide Context Files**: Include relevant files with `--context`
3. **Monitor Costs**: Check `az-os metrics` regularly
4. **Use Free Models First**: Trinity and Gemma for cost-effective operations
5. **Enable Checkpoints**: For long-running tasks
6. **Review Logs**: Use `az-os logs` to debug issues

## Troubleshooting

See [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues and solutions.

## Next Steps

- [API Reference](API.md) - Programmatic usage
- [Architecture](ARCHITECTURE.md) - System design
- [Security](SECURITY.md) - Security considerations
