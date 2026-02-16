# AZ-OS v2.0 - Installation Guide

## Prerequisites
- Python 3.8+
- pip 21.0+
- Node.js 18+ (for CLI)

## Installation Methods

### 1. Install from PyPI (Recommended)
```bash
pip install az-os
```

### 2. Install from Source
```bash
git clone https://github.com/your-org/az-os.git
cd az-os
pip install -e .
```

### 3. Development Setup
```bash
git clone https://github.com/your-org/az-os.git
cd az-os
pip install -r requirements-dev.txt
pip install -e .
```

## Configuration

### Environment Variables
```bash
# Database
export AZ_DB_HOST=localhost
export AZ_DB_PORT=5432
export AZ_DB_NAME=az_os
export AZ_DB_USER=az_os
export AZ_DB_PASSWORD=your_password

# API Keys
export AZ_LLM_API_KEY=your_openai_key
export AZ_ANALYTICS_API_KEY=your_analytics_key

# Security
export AZ_RATE_LIMIT=100
export AZ_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Configuration File
Create `az-os.yaml`:
```yaml
database:
  host: localhost
  port: 5432
  name: az_os
  user: az_os
  password: your_password

api:
  llm_key: your_openai_key
  analytics_key: your_analytics_key

security:
  rate_limit: 100
  cors_origins:
    - http://localhost:3000
    - http://localhost:8080
```

## Post-Installation

### Initialize Database
```bash
az-os db init
```

### Run Health Check
```bash
az-os health check
```

### Verify Installation
```bash
az-os --version
az-os --help
```

## Troubleshooting

### Common Issues
- **Permission Denied**: Run with `sudo` or adjust file permissions
- **Database Connection**: Check environment variables and database status
- **API Key Errors**: Verify keys are set and valid

### Getting Help
```bash
az-os help
az-os help <command>
```