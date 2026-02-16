# AZ-OS v2.0 - Deployment Guide

## Overview

This guide covers production deployment of AZ-OS for enterprise environments.

## Deployment Options

### 1. Local Installation

**Use Case**: Development, testing, personal use

```bash
pip install az-os
az-os init
```

### 2. System-Wide Installation

**Use Case**: Shared servers, CI/CD pipelines

```bash
sudo pip install az-os
az-os init --system
```

### 3. Docker Container

**Use Case**: Isolated environments, microservices

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install AZ-OS
RUN pip install az-os

# Create config directory
RUN mkdir -p /root/.az-os

# Copy config (mount at runtime)
VOLUME /root/.az-os

ENTRYPOINT ["az-os"]
CMD ["--help"]
```

**Build and Run**:
```bash
docker build -t az-os:v2.0 .
docker run -v ~/.az-os:/root/.az-os az-os:v2.0 run "Parse CSV"
```

### 4. Kubernetes

**Use Case**: Cloud-native, high availability

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: az-os
  namespace: ai-ops
spec:
  replicas: 3
  selector:
    matchLabels:
      app: az-os
  template:
    metadata:
      labels:
        app: az-os
    spec:
      containers:
      - name: az-os
        image: az-os:v2.0
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: OPENROUTER_API_KEY
          valueFrom:
            secretKeyRef:
              name: az-os-secrets
              key: api-key
        volumeMounts:
        - name: config
          mountPath: /root/.az-os
      volumes:
      - name: config
        persistentVolumeClaim:
          claimName: az-os-config
```

## Configuration Management

### Environment-Specific Configs

```bash
# Development
cp config/dev.yaml ~/.az-os/config.yaml

# Staging
cp config/staging.yaml ~/.az-os/config.yaml

# Production
cp config/prod.yaml ~/.az-os/config.yaml
```

### Secrets Management

#### 1. Environment Variables

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
export ANTHROPIC_API_KEY=sk-ant-...
```

#### 2. HashiCorp Vault

```python
# config_loader.py
import hvac

client = hvac.Client(url='https://vault.example.com')
client.token = os.getenv('VAULT_TOKEN')

api_key = client.secrets.kv.v2.read_secret_version(
    path='az-os/api-keys',
    mount_point='secret'
)['data']['data']['openrouter']
```

#### 3. AWS Secrets Manager

```python
import boto3

client = boto3.client('secretsmanager')
response = client.get_secret_value(SecretId='az-os/api-keys')
api_key = json.loads(response['SecretString'])['openrouter']
```

## Database Setup

### SQLite (Default)

```yaml
database:
  path: ~/.az-os/database.db
  timeout: 5
  check_same_thread: false
```

### PostgreSQL (Production)

```yaml
database:
  type: postgresql
  host: postgres.example.com
  port: 5432
  database: azos
  user: azos_user
  password: ${DB_PASSWORD}
  pool_size: 10
  max_overflow: 20
```

**Schema Migration**:
```bash
az-os migrate --to postgresql --host postgres.example.com
```

## Monitoring

### Health Checks

```bash
# Liveness probe
az-os doctor --json

# Readiness probe
az-os status --health
```

**Kubernetes Health**:
```yaml
livenessProbe:
  exec:
    command:
    - az-os
    - doctor
    - --json
  initialDelaySeconds: 30
  periodSeconds: 60

readinessProbe:
  exec:
    command:
    - az-os
    - status
    - --health
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Metrics Export

#### Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'az-os'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/.az-os/metrics/prometheus'
```

```bash
# Enable Prometheus export
az-os config set telemetry.prometheus.enabled true
az-os config set telemetry.prometheus.port 9090
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "AZ-OS Monitoring",
    "panels": [
      {
        "title": "Task Throughput",
        "targets": [{"expr": "rate(azos_tasks_completed[5m])"}]
      },
      {
        "title": "Cost per Hour",
        "targets": [{"expr": "rate(azos_cost_usd[1h])"}]
      },
      {
        "title": "Success Rate",
        "targets": [{"expr": "azos_tasks_completed / azos_tasks_total"}]
      }
    ]
  }
}
```

## Logging

### Centralized Logging

#### Fluentd

```conf
<source>
  @type tail
  path /var/log/az-os/*.log
  pos_file /var/log/td-agent/az-os.pos
  tag az-os.*
  format json
</source>

<match az-os.**>
  @type elasticsearch
  host elasticsearch.example.com
  port 9200
  index_name az-os
  type_name logs
</match>
```

#### ELK Stack

```yaml
# logstash.conf
input {
  file {
    path => "/var/log/az-os/*.log"
    codec => json
  }
}

filter {
  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "az-os-%{+YYYY.MM.dd}"
  }
}
```

## Scaling

### Horizontal Scaling

```bash
# Launch multiple instances
for i in {1..5}; do
  az-os daemon --id worker-$i &
done
```

### Load Balancing

```nginx
# nginx.conf
upstream az-os {
    server az-os-1:8000;
    server az-os-2:8000;
    server az-os-3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://az-os;
    }
}
```

## Backup and Recovery

### Database Backup

```bash
# Automated backup (cron)
0 2 * * * /usr/local/bin/az-os backup --compress --encrypt

# Manual backup
az-os backup ~/.az-os/database.db --output backup-$(date +%Y%m%d).db.gz
```

### Recovery

```bash
# Restore from backup
az-os restore backup-20250216.db.gz

# Verify integrity
az-os verify --database
```

## Security Hardening

See [SECURITY.md](SECURITY.md) for detailed security configuration.

**Quick Checklist**:
- [ ] Enable API key encryption
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Use HTTPS for API calls
- [ ] Restrict file permissions (chmod 600)
- [ ] Regular security updates
- [ ] Monitor suspicious activity

## Performance Tuning

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created ON tasks(created_at);
CREATE INDEX idx_logs_task ON task_logs(task_id);

-- Vacuum regularly
VACUUM;
ANALYZE;
```

### Cache Configuration

```yaml
cache:
  enabled: true
  ttl_seconds: 3600
  max_size_mb: 100
  backend: redis  # or memory
  redis_url: redis://localhost:6379/0
```

### Connection Pooling

```yaml
llm:
  connection_pool:
    size: 10
    max_overflow: 5
    timeout: 30
    recycle: 3600
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/az-os.yml
name: AZ-OS Tasks

on: [push]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install az-os
      - run: az-os run "Analyze code quality" --context src/
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                sh 'pip install az-os'
            }
        }
        stage('Execute Task') {
            steps {
                sh 'az-os run "Generate report"'
            }
        }
    }
}
```

## Disaster Recovery

### RTO/RPO Targets

| Component | RTO | RPO |
|-----------|-----|-----|
| Database | 5 min | 1 hour |
| Config | 1 min | 24 hours |
| Logs | 10 min | 6 hours |

### Failover Procedure

1. Detect failure (health check)
2. Switch to standby database
3. Redirect traffic to backup instance
4. Restore from latest checkpoint
5. Resume operations

## Cost Optimization

### Model Selection

```yaml
cost_optimization:
  prefer_free_models: true
  max_cost_per_task: 0.10
  budget_daily: 5.00
  alerts:
    - threshold: 80%
      action: warn
    - threshold: 100%
      action: stop
```

### Resource Limits

```yaml
resources:
  max_concurrent_tasks: 10
  max_memory_per_task_mb: 512
  max_duration_per_task_s: 600
  cleanup_completed_after_days: 30
```

## Compliance

### GDPR

- User data encryption
- Right to be forgotten (data deletion)
- Data export functionality
- Audit logging

### HIPAA

- Encrypted storage
- Access controls
- Audit trails
- Data retention policies

## Next Steps

- [Security Hardening](SECURITY.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [API Reference](API.md)
