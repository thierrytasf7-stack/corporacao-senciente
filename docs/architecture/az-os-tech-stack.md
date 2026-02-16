# 🛠️ AZ-OS TECH STACK

**Project:** AZ-OS (Agent Zero Operating System)
**Version:** 1.0.0
**Date:** 2026-02-15
**Status:** Tech Stack Complete

---

## 🎯 TECHNICAL OVERVIEW

**Core Philosophy:** Native Windows CLI-first architecture with maximum performance, complete technical sovereignty, and 90% cost optimization.

**Key Innovation:** First CLI combining Level 10 autonomy + 60 FPS TUI + 90% cost optimization + native Agent Zero integration.

---

## 📦 DEPENDENCIES (EXACT VERSIONS)

### Core Dependencies
```toml
# CLI Framework
typer = "^0.12.0"
# TUI Framework
textual = "^0.82.0"
rich = "^13.9.0"
# AI Orchestration
litellm = "^1.0.0"
# MCP Protocol
mcp-client = "^2026.1.0"
# Data Validation
pydantic = "^2.9.0"
# Configuration Management
dynaconf = "^3.2.0"
# Git Integration
gitpython = "^3.1.0"
# SQLite Database
aiosqlite = "^0.19.0"
# ChromaDB
chromadb = "^0.5.0"
# Async HTTP
httpx = "^0.25.0"
# Async Utilities
asyncstdlib = "^3.10.0"
# Type Extensions
types-python-dateutil = "^2.8.6"
```

### Development Dependencies
```toml
# Testing
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
pytest-cov = "^4.1.0"
# Type Checking
mypy = "^1.5.0"
types-python-dateutil = "^2.8.6"
# Linting
flake8 = "^6.0.0"
black = "^23.0.0"
isort = "^5.12.0"
# Documentation
sphinx = "^7.0.0"
sphinx-rtd-theme = "^1.2.0"
# Build
build = "^1.0.0"
twine = "^4.0.0"
```

### Optional Dependencies
```toml
# Advanced AI Features
taipy = "^1.0.0"
openai = "^1.0.0"
anthropic = "^0.1.0"
google-generativeai = "^0.3.0"
# Advanced TUI Features
rich-click = "^1.7.0"
rich-panel = "^1.0.0"
# Database Extensions
aiosqlite-ext = "^0.1.0"
# Monitoring & Observability
prometheus-client = "^0.17.0"
structlog = "^23.0.0"
# Security
cryptography = "^41.0.0"
pyjwt = "^2.8.0"
```

---

## 🏗️ PACKAGE STRUCTURE

### Root Directory Structure
```
az_os/
├── az_os/
│   ├── __init__.py
│   ├── __main__.py              # CLI entry point
│   ├── core/                   # Core business logic
│   │   ├── __init__.py
│   │   ├── interfaces.py      # Core interfaces
│   │   ├── task_manager.py    # Task orchestration
│   │   ├── state_manager.py   # State management
│   │   ├── cost_tracker.py    # Cost tracking
│   │   └── execution_engine.py # Execution engine
│   ├── ai/                     # AI/ML components
│   │   ├── __init__.py
│   │   ├── interfaces.py      # AI interfaces
│   │   ├── litellm_client.py  # LiteLLM integration
│   │   ├── mcp_client.py      # MCP protocol client
│   │   ├── react_engine.py    # ReAct loop engine
│   │   └── routing_engine.py  # Smart routing
│   ├── data/                   # Data persistence
│   │   ├── __init__.py
│   │   ├── interfaces.py      # Data interfaces
│   │   ├── sqlite_repository.py # SQLite persistence
│   │   ├── chromadb_repository.py # ChromaDB persistence
│   │   ├── migration_manager.py # Database migrations
│   │   └── models/             # Data models
│   │       ├── task.py
│   │       ├── cost.py
│   │       └── state.py
│   ├── tools/                  # Tool management
│   │   ├── __init__.py
│   │   ├── interfaces.py      # Tool interfaces
│   │   ├── filesystem_tools.py # Filesystem tools
│   │   ├── shell_tools.py     # Shell command tools
│   │   ├── ai_tools.py        # AI tool definitions
│   │   └── mcp_tools.py       # MCP tool integration
│   ├── cli/                    # CLI components
│   │   ├── __init__.py
│   │   ├── commands/           # CLI commands
│   │   │   ├── __init__.py
│   │   │   ├── task.py
│   │   │   ├── db.py
│   │   │   ├── cost.py
│   │   │   ├── dashboard.py
│   │   │   ├── tools.py
│   │   │   ├── config.py
│   │   │   └── log.py
│   │   ├── ui/                 # TUI components
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py
│   │   │   ├── components.py
│   │   │   └── styles.py
│   │   └── utils/              # CLI utilities
│   │       ├── validation.py
│   │       ├── formatting.py
│   │       └── helpers.py
│   ├── config/                 # Configuration management
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── validators.py
│   │   └── loaders.py
│   ├── monitoring/             # Monitoring & metrics
│   │   ├── __init__.py
│   │   ├── metrics.py
│   │   ├── health_check.py
│   │   └── logging.py
│   ├── exceptions/             # Custom exceptions
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── task.py
│   │   ├── ai.py
│   │   └── data.py
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       ├── async_helpers.py
│       ├── file_helpers.py
│       ├── string_helpers.py
│       └── system_helpers.py
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/                   # Unit tests
│   │   ├── __init__.py
│   │   ├── test_core/
│   │   ├── test_ai/
│   │   ├── test_data/
│   │   ├── test_tools/
│   │   └── test_cli/
│   ├── integration/            # Integration tests
│   │   ├── __init__.py
│   │   ├── test_full_flow.py
│   │   └── test_performance.py
│   └── fixtures/               # Test fixtures
│       ├── __init__.py
│       ├── test_data.py
│       ├── mock_services.py
│       └── test_db.py
├── docs/                       # Documentation
│   ├── architecture/          # Architecture docs
│   ├── api/                   # API docs
│   └── guides/                # User guides
├── scripts/                    # Build and deployment scripts
│   ├── build.py
│   ├── test.py
│   ├── deploy.py
│   └── migrate.py
├── data/                       # Data files
│   ├── migrations/            # Database migrations
│   ├── initial_data/          # Initial data
│   └── models/                # ML models
├── examples/                   # Usage examples
├── .github/                    # GitHub workflows
├── pyproject.toml             # Project configuration
├── README.md                  # Project readme
├── LICENSE                    # License file
└── CHANGELOG.md               # Change log
```

---

## 🛠️ BUILD SYSTEM (PYPROJECT.TOML)

### Complete pyproject.toml
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "az-os"
version = "1.0.0"
description = "Agent Zero Operating System - CLI-first AI operating system"
readme = "README.md"
requires-python = ">=3.11"
license = {text = "MIT"}
authors = [
    {name = "Diana Corporação Senciente", email = "dev@diana.ai"},
]
keywords = ["cli", "ai", "automation", "mcp", "litellm"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Topic :: Software Development :: Build Tools",
    "Topic :: Software Development :: Libraries",
    "Topic :: System :: Shells",
    "Topic :: Text Processing :: Linguistic",
]

dependencies = [
    # CLI Framework
    "typer>=0.12.0,<0.13.0",
    
    # TUI Framework
    "textual>=0.82.0,<0.83.0",
    "rich>=13.9.0,<14.0.0",
    
    # AI Orchestration
    "litellm>=1.0.0,<2.0.0",
    
    # MCP Protocol
    "mcp-client>=2026.1.0,<2026.2.0",
    
    # Data Validation
    "pydantic>=2.9.0,<3.0.0",
    
    # Configuration Management
    "dynaconf>=3.2.0,<4.0.0",
    
    # Git Integration
    "gitpython>=3.1.0,<4.0.0",
    
    # SQLite Database
    "aiosqlite>=0.19.0,<0.20.0",
    
    # ChromaDB
    "chromadb>=0.5.0,<0.6.0",
    
    # Async HTTP
    "httpx>=0.25.0,<0.26.0",
    
    # Async Utilities
    "asyncstdlib>=3.10.0,<4.0.0",
    
    # Type Extensions
    "types-python-dateutil>=2.8.6",
]

[project.optional-dependencies]
# Advanced AI Features
aichat = [
    "taipy>=1.0.0,<2.0.0",
    "openai>=1.0.0,<2.0.0",
    "anthropic>=0.1.0,<0.2.0",
    "google-generativeai>=0.3.0,<0.4.0",
]

# Advanced TUI Features
tui-extras = [
    "rich-click>=1.7.0,<2.0.0",
    "rich-panel>=1.0.0,<2.0.0",
]

# Database Extensions
db-extras = [
    "aiosqlite-ext>=0.1.0,<0.2.0",
]

# Monitoring & Observability
monitoring = [
    "prometheus-client>=0.17.0,<0.18.0",
    "structlog>=23.0.0,<24.0.0",
]

# Security
security = [
    "cryptography>=41.0.0,<42.0.0",
    "pyjwt>=2.8.0,<3.0.0",
]

[project.scripts]
az = "az_os.__main__:main"
az-os = "az_os.__main__:main"

[tool.hatch.build.targets.wheel]
packages = ["az_os"]

[tool.hatch.build.targets.wheel.shared-data]
data = { "data/" = "az_os/data/" }
docs = { "docs/" = "az_os/docs/" }

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
line_length = 88

[tool.pytest.ini_options]
minversion = "7.0"
addopts = [
    "-ra",
    "--strict-markers",
    "--strict-config",
    "--cov=az_os",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-report=xml",
]

testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
    "cli: marks tests as CLI tests",
    "ai: marks tests as AI-related tests",
    "data: marks tests as data-related tests",
]

[tool.coverage.run]
source = ["az_os"]
omit = [
    "*/tests/*",
    "*/test_*",
    "*/__init__.py",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "if self.debug:",
    "if settings.DEBUG",
    "raise AssertionError",
    "raise NotImplementedError",
    "if 0:",
    "if __name__ == .__main__.:",
    "class .*\\bProtocol\\):",
    "@(abc\\.)?abstractmethod",
]

[tool.sphinx]
project = "AZ-OS"
author = "Diana Corporação Senciente"
description = "Agent Zero Operating System Documentation"
version = "1.0.0"
release = "1.0.0"

[tool.sphinx.conf]
extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx.ext.viewcode",
    "sphinx.ext.intersphinx",
    "sphinx_rtd_theme",
]
source_suffix = ".rst"
master_doc = "index"
html_theme = "sphinx_rtd_theme"
html_static_path = ["_static"]
htmlhelp_basename = "AZ-OSdoc"

[tool.hatch.envs.default]
features = ["default"]

[tool.hatch.envs.dev]
features = ["dev", "test"]
dependencies = [
    "pre-commit>=3.0.0",
]

[tool.hatch.envs.test]
features = ["test"]
dependencies = [
    "coverage>=7.0.0",
]

[tool.hatch.envs.prod]
features = ["prod"]
dependencies = [
    "gunicorn>=20.0.0",
]

[tool.hatch.envs.ci]
features = ["test", "lint", "type-check"]
dependencies = [
    "codecov>=2.0.0",
]

[tool.hatch.envs.default.scripts]
format = "black . && isort ."
check-format = "black --check . && isort --check ."

[tool.hatch.envs.dev.scripts]
pre-commit = "pre-commit run --all-files"

[tool.hatch.envs.test.scripts]
pytest = "pytest"
coverage = "coverage run -m pytest"

[tool.hatch.envs.prod.scripts]
start = "gunicorn az_os.__main__:app --bind 0.0.0.0:8000"

[tool.hatch.envs.ci.scripts]
ci = [
    "black --check .",
    "isort --check .",
    "flake8 .",
    "mypy .",
    "pytest",
    "coverage run -m pytest",
]
```

---

## 🏗️ DEVELOPMENT ENVIRONMENT SETUP

### Prerequisites
```powershell
# Windows PowerShell (Administrator)
# Install Python 3.11+
winget install Python.Python.3.11

# Install Git
winget install Git.Git

# Install Node.js (for some dev tools)
winget install OpenJS.NodeJS

# Install Visual Studio Code
winget install Microsoft.VisualStudioCode
```

### Project Setup
```powershell
# Clone repository
git clone https://github.com/diana-corporacao-senciente/az-os.git
cd az-os

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -e .[dev]

# Install pre-commit hooks
pre-commit install

# Initialize database
az db init

# Run tests
pytest

# Check code quality
black . && isort . && flake8 . && mypy .
```

### Development Workflow
```powershell
# Start development server
az dashboard --dev

# Run tests on changes
git add . && git commit -m "feat: add new functionality"

# Build package
python -m build

# Run type checking
mypy az_os/

# Format code
black az_os/ && isort az_os/
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash azos
USER azos

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD az health check || exit 1

# Start application
CMD ["az", "dashboard"]
```

### Kubernetes Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: az-os
  labels:
    app: az-os
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
        image: diana/az-os:1.0.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: az-os-service
spec:
  selector:
    app: az-os
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
```

---

## 📊 MONITORING & OBSERVABILITY

### Metrics Collection
```python
from prometheus_client import start_http_server, Summary, Counter, Gauge
import time
import random

# Create metrics
REQUEST_TIME = Summary('request_processing_seconds', 'Time spent processing request')
TASK_COUNTER = Counter('tasks_total', 'Total number of tasks', ['status'])
COST_GAUGE = Gauge('current_cost', 'Current cost in USD')
FPS_GAUGE = Gauge('dashboard_fps', 'Dashboard frames per second')

@REQUEST_TIME.time()
def process_request(t):
    """A dummy function that takes some time."""
    time.sleep(t)

def collect_metrics():
    """Collect and update metrics"""
    # Simulate task processing
    task_status = random.choice(['completed', 'failed', 'running'])
    TASK_COUNTER.labels(status=task_status).inc()
    
    # Update cost
    COST_GAUGE.set(random.uniform(0.0, 10.0))
    
    # Update FPS
    FPS_GAUGE.set(random.uniform(30.0, 60.0))

if __name__ == '__main__':
    # Start Prometheus metrics server
    start_http_server(8000)
    
    # Collect metrics every 5 seconds
    while True:
        collect_metrics()
        time.sleep(5)
```

### Logging Configuration
```python
import logging
import structlog
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Configure structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="%Y-%m-%dT%H:%M:%S.%f"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Usage
log = structlog.get_logger()
log.info("Application started", version="1.0.0", environment="production")
log.debug("Processing task", task_id="12345", command="create function")
log.error("Task failed", task_id="12345", error="Invalid syntax")
```

---

## 🔒 SECURITY CONFIGURATION

### Environment Variables
```powershell
# Security configuration
$env:AZOS_SECRET_KEY = "your-secret-key-here"
$env:AZOS_ENCRYPTION_KEY = "your-encryption-key-here"
$env:AZOS_JWT_SECRET = "your-jwt-secret-here"
$env:AZOS_DATABASE_URL = "sqlite:///data/az_os.db"
$env:AZOS_CHROMA_DB_PATH = "data/chroma_db"
$env:AZOS_LOG_LEVEL = "INFO"
$env:AZOS_DEBUG = "False"
```

### Security Middleware
```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.proxy_headers import ProxyHeadersMiddleware
import jwt
from datetime import datetime, timedelta

app = FastAPI(title="AZ-OS API", version="1.0.0")

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["az-os.example.com", "localhost"]
)

app.add_middleware(
    HTTPSRedirectMiddleware
)

app.add_middleware(
    ProxyHeadersMiddleware,
    trusted_hosts={"localhost", "az-os.example.com"}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://az-os.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT authentication
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 🔄 CONTINUOUS INTEGRATION

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -e .[dev]
    
    - name: Run linters
      run: |
        black --check .
        isort --check .
        flake8 .
        mypy .
    
    - name: Run tests
      run: |
        pytest --cov=az_os --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: "3.11"
    
    - name: Install build dependencies
      run: |
        pip install build twine
    
    - name: Build package
      run: python -m build
    
    - name: Publish to PyPI
      env:
        TWINE_USERNAME: __token__
        TWINE_PASSWORD: ${{ secrets.PYPI_TOKEN }}
      run: |
        twine upload dist/*
```

---

## 📊 PERFORMANCE BENCHMARKS

### Expected Performance Metrics
```
CLI Response Time: <100ms
TUI Load Time: <500ms
FPS: 60 FPS sustained
Task Execution: <2s (simple tasks)
Semantic Search: <500ms
Cost per Task: $0.002 target
Concurrent Tasks: 100+ active
Memory Usage: <500MB baseline
```

### Benchmarking Tools
```python
import time
import asyncio
import random
from typing import List, Dict, Any

class PerformanceBenchmark:
    def __init__(self):
        self.results = []
    
    async def measure_task_execution(self, task_count: int = 100) -> Dict[str, Any]:
        """Measure task execution performance"""
        start_time = time.time()
        
        # Simulate task execution
        tasks = []
        for i in range(task_count):
            task_start = time.time()
            await asyncio.sleep(random.uniform(0.01, 0.1))  # Simulate work
            task_end = time.time()
            tasks.append({
                "task_id": i,
                "execution_time": task_end - task_start,
                "status": random.choice(["success", "failed"])
            })
        
        end_time = time.time()
        total_time = end_time - start_time
        
        return {
            "total_tasks": task_count,
            "total_time": total_time,
            "avg_time_per_task": total_time / task_count,
            "tasks": tasks
        }
    
    async def measure_tui_performance(self, duration: int = 10) -> Dict[str, Any]:
        """Measure TUI performance"""
        start_time = time.time()
        frames = 0
        
        while time.time() - start_time < duration:
            # Simulate frame rendering
            await asyncio.sleep(1/60)  # 60 FPS
            frames += 1
        
        end_time = time.time()
        actual_duration = end_time - start_time
        fps = frames / actual_duration
        
        return {
            "duration": actual_duration,
            "frames": frames,
            "fps": fps,
            "target_fps": 60,
            "fps_ratio": fps / 60
        }
```

---

## 🔄 VERSION HISTORY

**1.0.0 (2026-02-15)**: Initial tech stack design
- Complete dependency specifications with exact versions
- Package structure with clear separation of concerns
- Build system configuration (pyproject.toml)
- Development environment setup for Windows
- Production deployment configurations
- Monitoring, security, and CI/CD configurations

---