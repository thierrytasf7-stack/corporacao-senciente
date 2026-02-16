# AZ-OS v2.0 - Security Considerations

## Overview

AZ-OS implements defense-in-depth security with multiple layers of protection for production deployments.

## Threat Model

### Threats Addressed

1. **Injection Attacks** - SQL, command injection
2. **Authentication Bypass** - Unauthorized access
3. **Data Exposure** - API keys, sensitive data
4. **Denial of Service** - Resource exhaustion
5. **Man-in-the-Middle** - Network interception
6. **Malicious Input** - Unsafe user data

### Out of Scope

- Physical security
- Social engineering
- Zero-day OS vulnerabilities

## Security Layers

### 1. Input Validation

**Module**: `az_os.core.security.InputValidator`

**Validated Fields**:
```python
PATTERNS = {
    'task_id': r'^[a-zA-Z0-9_-]{1,64}$',
    'model_name': r'^[a-zA-Z0-9_/-]{1,128}$',
    'file_path': r'^[a-zA-Z0-9_./\-]{1,512}$',
    'command': r'^[a-zA-Z0-9_\-\s.]{1,1024}$',
    'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
}
```

**Usage**:
```python
from az_os.core.security import validator

if not validator.validate(user_input, "task_id"):
    raise ValidationError("Invalid task ID")
```

### 2. SQL Injection Prevention

**Strategy**: Parameterized queries ALWAYS

```python
# ✅ SECURE: Parameterized query
cursor.execute(
    "SELECT * FROM tasks WHERE id = ?",
    (task_id,)
)

# ❌ INSECURE: String concatenation
cursor.execute(f"SELECT * FROM tasks WHERE id = '{task_id}'")
```

**Additional Protection**:
```python
# Sanitize as fallback (defense-in-depth)
sanitized = validator.sanitize_sql(user_input)
```

### 3. API Key Encryption

**Algorithm**: AES-256-CBC via Fernet

**Key Derivation**: PBKDF2 with 100,000 iterations

```python
from az_os.core.security import APIKeyEncryption

# Initialize with master password
encryptor = APIKeyEncryption(master_password="your-secret")

# Encrypt
encrypted = encryptor.encrypt("sk-1234567890")

# Decrypt
api_key = encryptor.decrypt(encrypted)
```

**Storage**:
- Master password: Environment variable `AZOS_MASTER_PASSWORD`
- Encrypted keys: `~/.az-os/keys.enc`
- Permissions: `chmod 600 ~/.az-os/keys.enc`

### 4. Rate Limiting

**Algorithm**: Token bucket

**Configuration**:
```yaml
security:
  rate_limit:
    requests_per_minute: 60
    burst_size: 10
```

**Implementation**:
```python
from az_os.core.security import rate_limiter

if not rate_limiter.is_allowed(user_id):
    retry_after = rate_limiter.get_retry_after(user_id)
    raise RateLimitError(f"Retry after {retry_after}s")
```

### 5. Audit Logging

**Log Format**:
```
2025-02-16 12:34:56 | INFO | task_execution | user-123 | create_task | task-456 | success
```

**Fields**:
- Timestamp (UTC)
- Event type (task_execution, config_change, etc)
- User ID
- Action (create_task, delete_task, update_config)
- Resource ID
- Status (success/failure)
- Details (optional JSON)

**Usage**:
```python
from az_os.core.security import audit_logger

audit_logger.log_event(
    event_type="task_execution",
    user="user-123",
    action="create_task",
    resource="task-456",
    status="success",
    details={"model": "claude-3-sonnet"}
)
```

## Authentication

### API Key Authentication

```bash
# Set API key
export OPENROUTER_API_KEY=sk-or-v1-...

# Or in config
az-os config set llm.api_key sk-or-v1-...
```

**Validation**:
- Format: `^sk-[a-z]+-v[0-9]+-[a-zA-Z0-9]+$`
- Length: 40-100 characters
- Storage: Encrypted at rest

### Multi-Factor Authentication (Future)

Planned for v3.0:
- TOTP (Time-based One-Time Password)
- WebAuthn (hardware keys)
- Biometric (Touch ID, Face ID)

## Authorization

### Role-Based Access Control (RBAC)

**Roles**:
```yaml
roles:
  admin:
    - create_task
    - delete_task
    - modify_config
    - view_audit_log

  user:
    - create_task
    - view_own_tasks

  viewer:
    - view_own_tasks
```

**Implementation** (Future):
```python
@require_role("admin")
def delete_task(task_id: str):
    pass
```

## Network Security

### TLS/SSL

**API Calls**:
```python
# Always use HTTPS
client = LLMClient(
    api_url="https://api.openrouter.ai",
    verify_ssl=True
)
```

**Certificate Verification**:
```yaml
network:
  verify_ssl: true
  ca_bundle: /etc/ssl/certs/ca-certificates.crt
```

### Proxy Support

```bash
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1
```

## Data Protection

### Encryption at Rest

**Database Encryption**:
```bash
# SQLite with SQLCipher
az-os config set database.encryption.enabled true
az-os config set database.encryption.key_file ~/.az-os/db.key
```

**File Encryption**:
```python
from cryptography.fernet import Fernet

# Generate key
key = Fernet.generate_key()

# Encrypt file
cipher = Fernet(key)
encrypted = cipher.encrypt(file_contents)
```

### Encryption in Transit

- All API calls use HTTPS
- Database connections use TLS (PostgreSQL)
- Internal communication encrypted (future)

## Vulnerability Management

### Dependency Scanning

```bash
# Check for vulnerabilities
pip install safety
safety check --json

# Update dependencies
pip install --upgrade az-os
```

### Security Auditing

```bash
# Bandit (SAST)
pip install bandit
bandit -r src/az_os/ -f json -o security-report.json

# MyPy (type safety)
mypy --strict src/az_os/
```

### Penetration Testing

Recommended tools:
- **OWASP ZAP** - Web security scanner
- **SQLMap** - SQL injection tester
- **Nikto** - Web server scanner

## Incident Response

### Detection

**Indicators of Compromise**:
- Unusual API usage patterns
- Failed authentication attempts (>5 in 1 min)
- Large data exports
- Config changes outside maintenance window

**Monitoring**:
```python
from az_os.core.telemetry import alert_manager

alert_manager.trigger_alert(
    alert_id="suspicious-activity",
    level=AlertLevel.WARNING,
    message="10 failed logins from 192.168.1.100",
    details={"ip": "192.168.1.100", "count": 10}
)
```

### Response Procedure

1. **Detect** - Alert triggered
2. **Contain** - Block attacker (firewall/rate limit)
3. **Eradicate** - Fix vulnerability
4. **Recover** - Restore from backup
5. **Learn** - Update security controls

### Forensics

```bash
# Extract audit logs
az-os audit --export forensics-$(date +%Y%m%d).json

# Analyze logs
grep "failed_login" ~/.az-os/audit.log | wc -l
```

## Compliance

### GDPR

**Right to be Forgotten**:
```bash
az-os delete-user-data --user user-123 --confirm
```

**Data Export**:
```bash
az-os export-user-data --user user-123 --format json
```

### HIPAA

**Required Controls**:
- ✅ Encryption (at rest & in transit)
- ✅ Access controls (RBAC)
- ✅ Audit logging (180 days retention)
- ✅ Data integrity checks
- ⚠️ Business Associate Agreement (manual)

### PCI DSS

**Not Applicable** - AZ-OS does not process payment data

## Security Best Practices

### Deployment

1. **Use environment variables** for secrets
2. **Rotate API keys** every 90 days
3. **Enable audit logging** always
4. **Run as non-root** user
5. **Restrict file permissions** (600 for configs)
6. **Use TLS** for all network traffic
7. **Update dependencies** regularly
8. **Monitor security advisories**

### Development

1. **Never commit secrets** to git
2. **Use `.gitignore`** for sensitive files
3. **Run security scanners** in CI/CD
4. **Code review** all changes
5. **Follow least privilege** principle
6. **Validate all inputs**
7. **Use parameterized queries** always
8. **Handle errors securely** (no stack traces to user)

### Operations

1. **Monitor audit logs** daily
2. **Review access** quarterly
3. **Test backups** monthly
4. **Update security patches** within 7 days
5. **Incident response plan** documented
6. **Security training** for team

## Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

**Contact**: security@diana-corporacao-senciente.com

**PGP Key**: Available at keybase.io/diana-corp

**Response Time**: 24 hours for critical, 72 hours for others

## Security Checklist

### Initial Setup
- [ ] Set strong master password
- [ ] Encrypt API keys
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set file permissions (600)
- [ ] Enable TLS verification

### Ongoing
- [ ] Review audit logs weekly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Run security scans (bandit, safety)
- [ ] Test disaster recovery
- [ ] Review access controls

### Incident Response
- [ ] Alert monitoring configured
- [ ] Response plan documented
- [ ] Team trained on procedures
- [ ] Forensics tools available
- [ ] Contact list up-to-date

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)
- [SANS Security Checklist](https://www.sans.org/security-resources/)

## Next Steps

- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Troubleshooting](TROUBLESHOOTING.md) - Debug security issues
- [Architecture](ARCHITECTURE.md) - Security architecture
