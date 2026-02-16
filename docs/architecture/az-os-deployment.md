# AZ-OS Deployment Architecture

## Package Distribution (PyPI)

### Package Structure
```
az-os/
├── src/
│   └── az_os/
│       ├── __init__.py
│       ├── core/
│       ├── cli/
│       ├── utils/
│       └── config/
├── tests/
├── pyproject.toml
├── README.md
├── LICENSE
└── setup.py
```

### pyproject.toml
```toml
[build-system]
requires = ["setuptools>=42", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "az-os"
version = "1.0.0"
description = "AI Operating System for Windows"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
keywords = ["ai", "os", "windows", "automation"]
authors = [
    {name = "Diana Corporacao Senciente", email = "diana@synkra.ai"}
]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Operating System :: Microsoft :: Windows",
]

dependencies = [
    "requests>=2.28.0",
    "pydantic>=2.0.0",
    "typer>=0.7.0",
    "rich>=13.0.0",
    "psutil>=5.9.0",
    "pywin32>=305",
    "watchdog>=2.1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "black>=22.0.0",
    "mypy>=0.991",
    "ruff>=0.1.0",
]

[project.scripts]
az-os = "az_os.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
include = ["az_os*"]

[tool.black]
line-length = 88
target-version = ['py38']

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.ruff]
target-version = "py38"
line-length = 88
select = ["E", "F", "I", "W", "UP", "B", "A", "C4", "DTZ", "T10", "N"]
ignore = ["E501"]
```

### setup.py (legacy compatibility)
```python
from setuptools import setup, find_packages

setup(
    name="az-os",
    version="1.0.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
        "pydantic>=2.0.0",
        "typer>=0.7.0",
        "rich>=13.0.0",
        "psutil>=5.9.0",
        "pywin32>=305",
        "watchdog>=2.1.0",
    ],
    entry_points={
        "console_scripts": [
            "az-os = az_os.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: Microsoft :: Windows",
    ],
)
```

### Build and Publish Commands
```bash
# Install build tools
pip install build twine

# Build package
python -m build

# Test upload to TestPyPI
python -m twine upload --repository-url https://test.pypi.org/legacy/ dist/*

# Upload to PyPI
python -m twine upload dist/*
```

## Installation Flow

### Prerequisites
- Python 3.8 or higher
- Windows 10/11 (64-bit)
- Administrator privileges for system integration

### Installation Methods

#### Method 1: pip install (Recommended)
```bash
pip install az-os
```

#### Method 2: pip install from Git
```bash
git clone https://github.com/synkra/az-os.git
cd az-os
pip install .
```

#### Method 3: pip install from local wheel
```bash
# Download wheel file
pip install az_os-1.0.0-py3-none-any.whl
```

### Installation Verification
```bash
# Verify installation
az-os --version

# Test core functionality
az-os health-check

# Verify system integration
az-os system-info
```

### Post-Installation Setup
```bash
# Initialize configuration
az-os init

# Set up Windows integration
az-os setup-windows

# Configure AI models
az-os configure-models
```

## Configuration Management

### Configuration File Structure
```
az-os-config/
├── config.yaml
├── models/
│   ├── openai.json
│   ├── anthropic.json
│   └── local.json
├── integrations/
│   ├── windows.json
│   ├── office.json
│   └── teams.json
└── secrets/
    ├── api-keys.json
    └── tokens.json
```

### config.yaml (Main Configuration)
```yaml
# AZ-OS Configuration
version: 1.0

# System Settings
windows:
  integration: true
  auto_start: true
  system_tray: true

# AI Models
models:
  default: openai-gpt-4
  providers:
    openai:
      api_key: ${OPENAI_API_KEY}
      model: gpt-4
      temperature: 0.7
    anthropic:
      api_key: ${ANTHROPIC_API_KEY}
      model: claude-3-sonnet
      temperature: 0.3
    local:
      model_path: "./models/local"
      quantization: "q4_K_M"

# Integrations
integrations:
  office:
    enabled: true
    outlook: true
    word: true
    excel: true
  teams:
    enabled: true
    auto_join: false
    notifications: true

# Security
security:
  encryption: true
  audit_log: true
  auto_update: true

# Performance
performance:
  max_workers: 4
  memory_limit: "4GB"
  cache_size: "1GB"
```

### Environment Variables
```bash
# Required API Keys
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"

# Optional Configuration
export AZ_OS_CONFIG_PATH="/path/to/config"
export AZ_OS_LOG_LEVEL="INFO"
export AZ_OS_CACHE_DIR="/path/to/cache"
export AZ_OS_TEMP_DIR="/path/to/temp"

# Development
export AZ_OS_DEBUG="true"
export AZ_OS_TEST_MODE="true"
```

### Configuration Management Commands
```bash
# Initialize configuration
az-os config init

# Edit configuration
az-os config edit

# Validate configuration
az-os config validate

# Backup configuration
az-os config backup

# Restore configuration
az-os config restore
```

## Upgrade Strategy

### Upgrade Methods

#### Method 1: pip upgrade (Recommended)
```bash
# Standard upgrade
pip install --upgrade az-os

# Force upgrade (ignore dependencies)
pip install --upgrade --force-reinstall az-os

# Upgrade with specific version
pip install --upgrade az-os==1.1.0
```

#### Method 2: pip upgrade from Git
```bash
# Pull latest changes
git pull origin main

# Upgrade in-place
pip install -e .
```

#### Method 3: Manual upgrade
```bash
# Download latest wheel
wget https://files.pythonhosted.org/packages/.../az_os-1.1.0-py3-none-any.whl

# Install new version
pip install az_os-1.1.0-py3-none-any.whl
```

### Migration Scripts

#### Version 1.0 → 1.1 Migration
```python
# migration_1_0_to_1_1.py
import os
import shutil
import yaml
from pathlib import Path

def migrate_config_v1_to_v1_1():
    """Migrate configuration from v1.0 to v1.1 format"""
    config_path = Path("az-os-config/config.yaml")
    
    if not config_path.exists():
        return
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Migration: Add new performance section
    if 'performance' not in config:
        config['performance'] = {
            'max_workers': 4,
            'memory_limit': '4GB',
            'cache_size': '1GB'
        }
    
    # Migration: Update model provider names
    if 'models' in config:
        for provider in config['models'].get('providers', {}):
            if provider == 'anthropic':
                config['models']['providers'][provider]['model'] = 'claude-3-sonnet'
    
    # Save migrated config
    with open(config_path, 'w') as f:
        yaml.safe_dump(config, f)
    
    print(f"Successfully migrated configuration to v1.1")

if __name__ == "__main__":
    migrate_config_v1_to_v1_1()
```

#### Version 1.1 → 1.2 Migration
```python
# migration_1_1_to_1_2.py
import os
import shutil
import yaml
from pathlib import Path

def migrate_config_v1_1_to_v1_2():
    """Migrate configuration from v1.1 to v1.2 format"""
    config_path = Path("az-os-config/config.yaml")
    
    if not config_path.exists():
        return
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Migration: Add new security features
    if 'security' not in config:
        config['security'] = {
            'encryption': True,
            'audit_log': True,
            'auto_update': True
        }
    
    # Migration: Add new integrations
    if 'integrations' not in config:
        config['integrations'] = {
            'office': {
                'enabled': True,
                'outlook': True,
                'word': True,
                'excel': True
            },
            'teams': {
                'enabled': True,
                'auto_join': False,
                'notifications': True
            }
        }
    
    # Save migrated config
    with open(config_path, 'w') as f:
        yaml.safe_dump(config, f)
    
    print(f"Successfully migrated configuration to v1.2")

if __name__ == "__main__":
    migrate_config_v1_1_to_v1_2()
```

### Upgrade Commands
```bash
# Check for updates
az-os update check

# Download and prepare update
az-os update download

# Apply update with migration
az-os update apply

# Rollback to previous version
az-os update rollback

# View update history
az-os update history
```

### Automated Update Process
```python
# update_manager.py
import subprocess
import sys
import os
from pathlib import Path

def check_for_updates():
    """Check for available updates"""
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'install', 'az-os', '--upgrade', '--dry-run'],
            capture_output=True,
            text=True
        )
        if "Requirement already up-to-date" in result.stdout:
            return None
        else:
            return result.stdout
    except Exception as e:
        print(f"Error checking for updates: {e}")
        return None

def perform_update():
    """Perform automated update"""
    print("Checking for updates...")
    update_info = check_for_updates()
    
    if not update_info:
        print("AZ-OS is already up-to-date")
        return
    
    print(f"Updates available: {update_info}")
    
    # Backup current configuration
    backup_config()
    
    # Perform update
    try:
        subprocess.run(
            [sys.executable, '-m', 'pip', 'install', 'az-os', '--upgrade'],
            check=True
        )
        print("Update completed successfully")
        
        # Run migration scripts if needed
        run_migrations()
        
    except subprocess.CalledProcessError as e:
        print(f"Update failed: {e}")
        restore_backup()

def backup_config():
    """Backup configuration files"""
    config_dir = Path("az-os-config")
    backup_dir = Path("az-os-config-backup")
    
    if config_dir.exists():
        if backup_dir.exists():
            shutil.rmtree(backup_dir)
        shutil.copytree(config_dir, backup_dir)
        print("Configuration backed up successfully")

def restore_backup():
    """Restore configuration from backup"""
    backup_dir = Path("az-os-config-backup")
    config_dir = Path("az-os-config")
    
    if backup_dir.exists():
        if config_dir.exists():
            shutil.rmtree(config_dir)
        shutil.copytree(backup_dir, config_dir)
        print("Configuration restored from backup")

def run_migrations():
    """Run migration scripts for version updates"""
    current_version = get_current_version()
    
    if current_version == "1.0.0":
        from migration_1_0_to_1_1 import migrate_config_v1_to_v1_1
        migrate_config_v1_to_v1_1()
    
    if current_version in ["1.0.0", "1.1.0"]:
        from migration_1_1_to_1_2 import migrate_config_v1_1_to_v1_2
        migrate_config_v1_1_to_v1_2()

def get_current_version():
    """Get current AZ-OS version"""
    try:
        import az_os
        return az_os.__version__
    except ImportError:
        return "unknown"

if __name__ == "__main__":
    perform_update()
```

### Version Compatibility Matrix

| AZ-OS Version | Python Version | Windows Version | Breaking Changes |
|---------------|----------------|-----------------|------------------|
| 1.0.0         | 3.8+           | 10/11           | Initial release  |
| 1.1.0         | 3.8+           | 10/11           | Model provider updates |
| 1.2.0         | 3.8+           | 10/11           | Security enhancements |
| 1.3.0         | 3.9+           | 11              | Windows 10 deprecated |

### Rollback Strategy
```bash
# Rollback to previous version
pip install az-os==1.0.0

# Rollback with configuration restore
az-os update rollback --restore-config

# Complete rollback procedure
az-os update rollback --complete
```

### Update Notifications
```python
# update_notifier.py
import requests
import json
import time
from datetime import datetime, timedelta

def check_updates_background():
    """Background update checker"""
    while True:
        try:
            # Check for updates every 24 hours
            time.sleep(86400)
            
            # Check PyPI for latest version
            response = requests.get("https://pypi.org/pypi/az-os/json")
            if response.status_code == 200:
                data = response.json()
                latest_version = data['info']['version']
                current_version = get_current_version()
                
                if latest_version != current_version:
                    notify_user(latest_version)
        except Exception as e:
            print(f"Background update check failed: {e}")

def notify_user(new_version):
    """Notify user about available update"""
    print(f"Update available: AZ-OS {new_version} is now available!")
    print("Run 'az-os update apply' to upgrade")
    
    # Additional notification methods can be added here
    # - Windows toast notifications
    # - Email notifications
    # - System tray notifications

if __name__ == "__main__":
    check_updates_background()
```