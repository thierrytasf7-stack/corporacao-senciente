# AZ-OS v2.0 - Troubleshooting Guide

## Quick Diagnostics

```bash
# Run full diagnostics
az-os doctor

# Check specific component
az-os doctor --component database
az-os doctor --component llm
az-os doctor --component storage

# Auto-fix common issues
az-os doctor --fix
```

## Common Issues

### Installation Problems

#### Issue: `pip install az-os` fails

**Symptoms**:
```
ERROR: Could not find a version that satisfies the requirement az-os
```

**Causes**:
- Outdated pip
- Python version < 3.8
- Network issues

**Solutions**:

```bash
# Update pip
python -m pip install --upgrade pip

# Check Python version
python --version  # Should be >= 3.8

# Use specific index
pip install --index-url https://pypi.org/simple/ az-os

# Install from source
git clone https://github.com/diana-corporacao-senciente/az-os.git
cd az-os
pip install -e .
```

#### Issue: Permission denied during installation

**Solution**:
```bash
# Install for user only
pip install --user az-os

# Or use virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install az-os
```

### Configuration Issues

#### Issue: API key not found

**Symptoms**:
```
ERROR: OPENROUTER_API_KEY not set
```

**Solutions**:

```bash
# Set environment variable
export OPENROUTER_API_KEY=sk-or-v1-...

# Or set in config
az-os config set llm.api_key sk-or-v1-...

# Verify
az-os config get llm.api_key
```

#### Issue: Config file not found

**Symptoms**:
```
ERROR: Configuration file not found at ~/.az-os/config.yaml
```

**Solution**:
```bash
# Reinitialize
az-os init --force

# Or manually create
mkdir -p ~/.az-os
az-os config reset
```

### Database Issues

#### Issue: Database locked

**Symptoms**:
```
sqlite3.OperationalError: database is locked
```

**Causes**:
- Multiple processes accessing database
- Stale lock file
- Crashed process

**Solutions**:

```bash
# Check for running processes
ps aux | grep az-os

# Kill hung processes
killall az-os

# Remove lock file
rm ~/.az-os/database.db-wal
rm ~/.az-os/database.db-shm

# Restart
az-os init
```

#### Issue: Database corrupted

**Symptoms**:
```
sqlite3.DatabaseError: database disk image is malformed
```

**Solutions**:

```bash
# Backup current database
cp ~/.az-os/database.db ~/.az-os/database.db.backup

# Attempt recovery
sqlite3 ~/.az-os/database.db "PRAGMA integrity_check;"

# If recovery fails, restore from backup
az-os restore ~/.az-os/backups/database-20250216.db

# Or reinitialize (data loss!)
rm ~/.az-os/database.db
az-os init
```

### API Connection Issues

#### Issue: Connection timeout

**Symptoms**:
```
NetworkError: Connection timeout to api.openrouter.ai
```

**Solutions**:

```bash
# Test connectivity
curl -I https://api.openrouter.ai

# Check DNS
nslookup api.openrouter.ai

# Use proxy
export HTTPS_PROXY=http://proxy.example.com:8080
az-os run "Test task"

# Increase timeout
az-os config set llm.timeout 60
```

#### Issue: SSL certificate verification failed

**Symptoms**:
```
SSLError: certificate verify failed
```

**Solutions**:

```bash
# Update CA certificates
sudo apt-get update && sudo apt-get install ca-certificates  # Linux
brew install ca-certificates  # macOS

# Use system certificates
az-os config set network.ca_bundle /etc/ssl/certs/ca-certificates.crt

# Disable verification (not recommended)
az-os config set network.verify_ssl false
```

#### Issue: Rate limit exceeded (429)

**Symptoms**:
```
RateLimitError: Too many requests. Retry after 60s
```

**Solutions**:

```bash
# Wait for cooldown period
sleep 60

# Use different model (different rate limit)
az-os run "Task" --model mistralai/mistral-small-3.1-24b-instruct:free

# Implement backoff in scripts
for i in {1..3}; do
  az-os run "Task" && break || sleep 60
done
```

### Task Execution Issues

#### Issue: Task hangs/never completes

**Symptoms**:
- Task status stuck at "running"
- No log updates for >5 minutes

**Solutions**:

```bash
# Check task status
az-os status task-123

# View live logs
az-os logs task-123 --follow

# Cancel task
az-os cancel task-123

# Force kill if needed
az-os cancel task-123 --force

# Check system resources
az-os metrics --system
```

#### Issue: Task fails with "timeout"

**Symptoms**:
```
TimeoutError: Task exceeded 300s timeout
```

**Solutions**:

```bash
# Increase timeout for specific task
az-os run "Long task" --timeout 600

# Increase global timeout
az-os config set execution.timeout_seconds 600

# Break task into smaller parts
az-os run "Part 1"
az-os run "Part 2"
az-os run "Part 3"
```

#### Issue: Out of memory

**Symptoms**:
```
MemoryError: Out of memory
```

**Solutions**:

```bash
# Check memory usage
az-os metrics --system

# Increase system memory
# (or reduce concurrent tasks)

# Limit memory per task
az-os config set resources.max_memory_per_task_mb 512

# Use checkpoint/resume for large tasks
az-os run "Large task" --checkpoint-interval 60
```

### Performance Issues

#### Issue: Slow startup (>1s)

**Solutions**:

```bash
# Profile startup
time az-os --version

# Disable unnecessary features
az-os config set telemetry.enabled false
az-os config set rag.auto_index false

# Use lightweight models
az-os config set llm.default_model arcee-ai/trinity-large-preview:free
```

#### Issue: High CPU usage

**Solutions**:

```bash
# Check resource usage
az-os metrics --system

# Limit concurrent tasks
az-os config set resources.max_concurrent_tasks 5

# Reduce log level
az-os config set logging.level WARNING
```

### Model/LLM Issues

#### Issue: Model returns empty response

**Symptoms**:
```
Empty response from model
```

**Solutions**:

```bash
# Try different model
az-os run "Task" --model claude-3-sonnet

# Check model availability
az-os models --status

# Increase max_tokens
az-os config set llm.max_tokens 1000

# Check API credits
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://api.openrouter.ai/api/v1/auth/key
```

#### Issue: Model cascade not working

**Symptoms**:
- Always uses first model
- Never falls back to alternatives

**Solutions**:

```bash
# Verify cascade config
az-os config get llm.cascade

# Test each model individually
az-os run "Test" --model arcee-ai/trinity-large-preview:free
az-os run "Test" --model mistralai/mistral-small-3.1-24b-instruct:free

# Enable cascade logging
az-os config set logging.level DEBUG
az-os run "Test" 2>&1 | grep "cascade"
```

### Logging Issues

#### Issue: Logs not appearing

**Solutions**:

```bash
# Check log level
az-os config get logging.level

# Set to DEBUG
az-os config set logging.level DEBUG

# Check log file location
az-os config get logging.file

# View directly
tail -f ~/.az-os/logs/az-os.log
```

#### Issue: Log file too large

**Solutions**:

```bash
# Check log size
du -h ~/.az-os/logs/az-os.log

# Rotate logs manually
az-os logs --rotate

# Configure rotation
az-os config set logging.max_size_mb 10
az-os config set logging.backup_count 5

# Clear old logs
rm ~/.az-os/logs/az-os.log.*
```

## Error Messages Reference

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid API key | Check `llm.api_key` |
| `403 Forbidden` | Insufficient permissions | Verify API key scope |
| `ApiKeyError` | Missing API key | Set `OPENROUTER_API_KEY` |

### Network Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ConnectionError` | Network unavailable | Check internet connection |
| `TimeoutError` | Request timeout | Increase `llm.timeout` |
| `SSLError` | Certificate issue | Update CA certificates |
| `429 Too Many Requests` | Rate limited | Wait or use different model |

### Database Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `database is locked` | Concurrent access | Kill other processes |
| `database disk image is malformed` | Corruption | Restore from backup |
| `no such table` | Missing schema | Run `az-os init` |
| `IntegrityError` | Constraint violation | Check data validity |

### Execution Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `CommandNotFound` | Missing binary | Install required tool |
| `PermissionDenied` | Insufficient perms | Check file permissions |
| `FileNotFound` | Missing file | Verify file path |
| `SyntaxError` | Invalid Python | Check code syntax |

## Debug Mode

Enable debug mode for verbose output:

```bash
# Environment variable
export AZOS_LOG_LEVEL=DEBUG

# Or config
az-os config set logging.level DEBUG

# Run with debug
az-os run "Task" --debug

# View debug logs
az-os logs --level debug --tail 100
```

## Collecting Diagnostics

When reporting issues, collect:

```bash
# System info
az-os doctor --json > diagnostics.json

# Recent logs
az-os logs --tail 500 > logs.txt

# Config (redact secrets!)
az-os config show > config.yaml

# Task history
az-os list --limit 20 --format json > tasks.json

# System metrics
az-os metrics --system > metrics.txt
```

## Getting Help

### Documentation

- [Installation](INSTALLATION.md)
- [Usage Guide](USAGE.md)
- [API Reference](API.md)
- [Architecture](ARCHITECTURE.md)

### Community

- GitHub Issues: https://github.com/diana-corporacao-senciente/az-os/issues
- Discord: https://discord.gg/diana-corp
- Stack Overflow: Tag `az-os`

### Support Tiers

**Community** (Free):
- GitHub issues
- Discord support
- Best-effort response

**Professional** ($99/month):
- Email support
- 24-hour response
- Bug fixes priority

**Enterprise** (Custom):
- Dedicated support
- 1-hour response (24/7)
- Custom development

### Reporting Bugs

**Template**:
```markdown
## Environment
- AZ-OS version: 2.0.0
- Python version: 3.11.0
- OS: Ubuntu 22.04

## Expected Behavior
Task should complete in <1 minute

## Actual Behavior
Task hangs after 30 seconds

## Steps to Reproduce
1. az-os run "Parse CSV"
2. Wait 30 seconds
3. Task hangs

## Logs
[Attach logs here]

## Config
[Attach config (redact secrets)]
```

## FAQ

**Q: Why is my first task slow?**
A: First run downloads model info. Subsequent runs are cached.

**Q: Can I use Claude Opus?**
A: Yes, but costs apply. Set `llm.default_model: claude-opus-4-6`.

**Q: How do I reset everything?**
A: `rm -rf ~/.az-os && az-os init`

**Q: Does AZ-OS work offline?**
A: No, requires internet for LLM API calls.

**Q: How do I update AZ-OS?**
A: `pip install --upgrade az-os`

**Q: Where are logs stored?**
A: `~/.az-os/logs/`

**Q: How do I change database location?**
A: `az-os config set database.path /path/to/db.sqlite`

**Q: Can I run multiple tasks in parallel?**
A: Yes, launch multiple `az-os run` instances.

## Performance Benchmarks

Expected performance on modern hardware:

| Operation | Time |
|-----------|------|
| Startup | <100ms |
| Create task | <50ms |
| Simple query (Trinity) | 2-5s |
| Medium query (Gemini) | 5-10s |
| Complex query (Mistral) | 10-20s |
| Database query | <10ms |
| Health check (all) | <500ms |

If slower, check:
- Internet speed
- CPU usage
- Memory availability
- Model availability (status.openrouter.ai)

## Next Steps

If issue persists:
1. Check [GitHub Issues](https://github.com/diana-corporacao-senciente/az-os/issues)
2. Join [Discord](https://discord.gg/diana-corp)
3. Email support@diana-corporacao-senciente.com
