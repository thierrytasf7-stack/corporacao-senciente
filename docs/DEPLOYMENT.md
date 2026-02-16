# AZ-OS v2.0 - Deployment Guide

## Overview

This guide covers deployment of AZ-OS v2.0 in various environments: local development, staging, and production.

## Prerequisites

### System Requirements
- **CPU**: 4+ cores (8+ recommended for production)
- **Memory**: 8GB+ RAM (16GB+ recommended)
- **Storage**: 50GB+ SSD
- **Network**: 1Gbps+ connection
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows 10+

### Software Requirements
- **Python**: 3.8+
- **Node.js**: 18+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **kubectl**: 1.24+

## Local Development Setup

### Option 1: Docker Compose

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/az-os.git
cd az-os
```

#### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
# Database
POSTGRES_DB=az_os
POSTGRES_USER=az_os
POSTGRES_PASSWORD=your_password

# API Keys
AZ_LLM_API_KEY=your_openai_key
AZ_ANALYTICS_API_KEY=your_analytics_key

# Security
AZ_RATE_LIMIT=100
AZ_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

#### 3. Start Services
```bash
docker-compose up -d
```

#### 4. Initialize Database
```bash
docker-compose exec api az-os db init
```

#### 5. Verify Installation
```bash
docker-compose exec api az-os --version
docker-compose exec api az-os health check
```

### Option 2: Manual Installation

#### 1. Install Dependencies
```bash
# Python dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Node.js dependencies
npm install
```

#### 2. Set Up Database
```bash
# Create database
createdb az_os

# Run migrations
alembic upgrade head
```

#### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### 4. Start Services
```bash
# Start API
python -m az_os.api

# Start CLI
npm run dev
```

## Staging Environment

### Kubernetes Deployment

#### 1. Prerequisites
- Kubernetes cluster (minikube, GKE, EKS, etc.)
- Helm 3.8+
- kubectl 1.24+

#### 2. Install Helm Chart
```bash
# Add repository
helm repo add az-os https://charts.az-os.com
helm repo update

# Install chart
helm install az-os az-os/az-os \
  --namespace az-os \
  --create-namespace \
  --values values-staging.yaml
```

#### 3. Configure Ingress
```yaml
# values-staging.yaml
ingress:
  enabled: true
  hosts:
    - host: staging.az-os.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: staging-tls
      hosts:
        - staging.az-os.com
```

#### 4. Set Up Database
```bash
# Create database
kubectl exec -it postgresql-0 -- createdb -U az_os az_os

# Run migrations
kubectl exec -it api-0 -- alembic upgrade head
```

#### 5. Verify Deployment
```bash
# Check pods
kubectl get pods -n az-os

# Check services
kubectl get services -n az-os

# Test health check
kubectl exec -it api-0 -- az-os health check
```

## Production Deployment

### High Availability Setup

#### 1. Kubernetes Cluster
- **Nodes**: Minimum 3 nodes (1 master, 2 workers)
- **Storage**: Persistent volumes with SSD
- **Networking**: Load balancer with SSL termination
- **Monitoring**: Prometheus + Grafana

#### 2. Helm Configuration
```yaml
# values-production.yaml
replicaCount: 3
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi

database:
  persistence:
    enabled: true
    size: 50Gi

redis:
  master:
    persistence:
      enabled: true
      size: 10Gi
```

#### 3. Security Configuration
```yaml
# values-production.yaml
security:
  apiKeys:
    enabled: true
    rotation: 30d
  rateLimiting:
    enabled: true
    requests: 100
    window: 1m
  cors:
    origins:
      - https://app.az-os.com
      - https://api.az-os.com
```

#### 4. Monitoring Setup
```yaml
# values-production.yaml
monitoring:
  prometheus:
    enabled: true
    scrapeInterval: 15s
  grafana:
    enabled: true
    dashboards:
      - az-os-overview
      - az-os-performance
      - az-os-security
```

#### 5. Backup Strategy
```yaml
# values-production.yaml
backup:
  enabled: true
  schedule: "0 2 * * *"
  retention: 30d
  storage: s3
  s3:
    bucket: az-os-backups
    region: us-east-1
```

### CI/CD Pipeline

#### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      - name: Run tests
        run: |
          pytest tests/ --cov=az_os --cov-report=xml
      - name: Security scan
        run: |
          bandit -r src/az_os/
      - name: Type check
        run: |
          mypy src/az_os/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v3
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
            k8s/ingress.yaml
          images: |
            your-registry/az-os:${{ github.sha }}
          kubectl-version: 'latest'
```

## Environment-Specific Configurations

### Development
```yaml
# values-dev.yaml
development: true
logging:
  level: DEBUG
monitoring:
  enabled: false
```

### Staging
```yaml
# values-staging.yaml
logging:
  level: INFO
monitoring:
  enabled: true
  prometheus:
    scrapeInterval: 30s
```

### Production
```yaml
# values-production.yaml
logging:
  level: WARNING
monitoring:
  enabled: true
  prometheus:
    scrapeInterval: 15s
  alerting:
    enabled: true
    thresholds:
      cpu: 80
      memory: 90
      errors: 100
```

## Post-Deployment Tasks

### 1. Database Migration
```bash
# Run migrations
kubectl exec -it api-0 -- alembic upgrade head

# Verify migration
kubectl exec -it api-0 -- az-os db status
```

### 2. Health Check
```bash
# Check service health
kubectl exec -it api-0 -- az-os health check

# Check metrics
kubectl exec -it api-0 -- az-os monitor metrics
```

### 3. Load Testing
```bash
# Run load test
kubectl exec -it load-test-0 -- ab -n 1000 -c 10 http://api:8000/health

# Analyze results
kubectl logs load-test-0
```

### 4. Security Audit
```bash
# Run security scan
kubectl exec -it security-scan-0 -- bandit -r /app/src/

# Check for vulnerabilities
kubectl exec -it security-scan-0 -- safety check
```

## Monitoring and Maintenance

### 1. Log Aggregation
```bash
# View logs
kubectl logs -f -n az-os api-0

# Search logs
kubectl logs -n az-os api-0 | grep ERROR
```

### 2. Performance Monitoring
```bash
# Check resource usage
kubectl top pods -n az-os

# View metrics
kubectl port-forward svc/prometheus 9090:9090
# Open http://localhost:9090
```

### 3. Alert Management
```bash
# Check alerts
kubectl exec -it alertmanager-0 -- amtool alert

# Silence alert
kubectl exec -it alertmanager-0 -- amtool silence add --duration=1h 'alertname=HighMemory'
```

### 4. Backup and Recovery
```bash
# Create backup
kubectl exec -it postgresql-0 -- pg_dump -U az_os az_os > backup.sql

# Restore backup
kubectl exec -it postgresql-0 -- psql -U az_os az_os < backup.sql
```

## Troubleshooting

### Common Issues

#### 1. Pod Not Starting
```bash
# Check pod status
kubectl get pods -n az-os

# Describe pod
kubectl describe pod -n az-os api-0

# Check events
kubectl get events -n az-os --sort-by=.metadata.creationTimestamp
```

#### 2. Database Connection Issues
```bash
# Check database connection
kubectl exec -it api-0 -- nc -zv postgresql 5432

# Check database logs
kubectl logs -f -n az-os postgresql-0
```

#### 3. API Errors
```bash
# Check API logs
kubectl logs -f -n az-os api-0

# Test API endpoint
kubectl exec -it api-0 -- curl http://localhost:8000/health
```

#### 4. Performance Issues
```bash
# Check resource usage
kubectl top pods -n az-os

# Check metrics
kubectl exec -it api-0 -- az-os monitor metrics
```

### Getting Help

#### 1. Documentation
- [AZ-OS Documentation](https://docs.az-os.com)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

#### 2. Community Support
- [GitHub Issues](https://github.com/your-org/az-os/issues)
- [Discord Community](https://discord.gg/az-os)

#### 3. Professional Support
- [Contact Sales](https://az-os.com/contact)
- [Support Tickets](https://support.az-os.com)