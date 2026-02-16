# AZ-OS v2.0 - Installation Guide

## Prerequisites

- **Operating System**: Linux, macOS, or Windows 10/11
- **Python**: 3.8 or higher
- **pip**: Latest version
- **Git**: For cloning repository
- **SQLite**: 3.35+ (usually included with Python)

## Quick Installation

### From PyPI (Recommended)

```bash
pip install az-os
```

### From Source

```bash
git clone https://github.com/diana-corporacao-senciente/az-os.git
cd az-os
pip install -e .
```

## Configuration

### 1. Initialize Configuration

```bash
az-os init
```

This creates `~/.az-os/` directory with:
- `config.yaml` - Main configuration
- `database.db` - SQLite database
- `logs/` - Log files

### 2. Set API Keys

Edit `~/.az-os/config.yaml`:

```yaml
llm:
  provider: openrouter
  api_key: your-api-key-here
  default_model: arcee-ai/trinity-large-preview:free

  cascade:
    - arcee-ai/trinity-large-preview:free
    - mistralai/mistral-small-3.1-24b-instruct:free
    - google/gemma-3-27b-it:free
```

Or set environment variable:

```bash
export OPENROUTER_API_KEY=your-api-key-here
```

### 3. Verify Installation

```bash
az-os doctor
```

Expected output:
```
✓ Python version: 3.11.0
✓ Database: Connected
✓ Configuration: Valid
✓ LLM API: Reachable
✓ All checks passed!
```

## Optional Dependencies

### ChromaDB (RAG)

```bash
pip install chromadb
```

### Development Tools

```bash
pip install az-os[dev]
```

Includes: pytest, black, mypy, bandit

## Platform-Specific Notes

### Linux

```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install python3-dev build-essential
```

### macOS

```bash
# Install with Homebrew
brew install python@3.11
```

### Windows

```powershell
# Use PowerShell as Administrator
# Install Python from python.org
# Ensure pip is in PATH
```

## Troubleshooting

### Permission Errors

```bash
pip install --user az-os
```

### SSL Certificate Errors

```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org az-os
```

### Database Lock Issues

```bash
rm ~/.az-os/database.db
az-os init
```

## Upgrading

```bash
pip install --upgrade az-os
```

## Uninstallation

```bash
pip uninstall az-os
rm -rf ~/.az-os
```

## Next Steps

- Read [Usage Guide](USAGE.md)
- See [Architecture](ARCHITECTURE.md)
- Check [API Reference](API.md)
