# AZ-OS v2.0 - User Guide

## Quick Start

### Basic Commands
```bash
# Check version
az-os --version

# Get help
az-os --help
az-os help <command>

# Run health check
az-os health check

# Start the service
az-os start

# Stop the service
az-os stop
```

## Core Features

### 1. AI Operations
```bash
# Run AI task
az-os ai run --task "analyze data" --input data.csv

# Get AI status
az-os ai status

# List available models
az-os ai models
```

### 2. Data Processing
```bash
# Process data file
az-os data process --file data.json --output processed.json

# Validate data
az-os data validate --file data.csv

# Export data
az-os data export --format csv --output results.csv
```

### 3. Monitoring
```bash
# View system metrics
az-os monitor metrics

# Check service health
az-os monitor health

# Set up alerts
az-os monitor alerts --threshold 80
```

## Configuration

### Environment Setup
```bash
# Set API keys
export AZ_LLM_API_KEY=your_key
export AZ_ANALYTICS_API_KEY=your_key

# Configure rate limits
export AZ_RATE_LIMIT=100
```

### Configuration File
Create `az-os.yaml`:
```yaml
ai:
  model: "gpt-4"
  temperature: 0.7

data:
  input_dir: "./data/input"
  output_dir: "./data/output"
  max_files: 100

monitoring:
  enabled: true
  interval: 60
  alerts:
    - cpu > 80%
    - memory > 90%
    - errors > 10/min
```

## Advanced Usage

### Custom Scripts
```bash
# Create custom script
az-os script create --name my_script.py

# Run custom script
az-os script run --name my_script.py --args "--input data.json"

# List scripts
az-os script list
```

### API Integration
```bash
# Start API server
az-os api start --port 8080

# Test API endpoint
curl http://localhost:8080/health

# Generate API docs
az-os api docs --output api_docs.json
```

## Troubleshooting

### Common Issues
- **Service Not Starting**: Check logs with `az-os logs`
- **API Errors**: Verify API keys and endpoints
- **Performance Issues**: Monitor with `az-os monitor metrics`

### Debug Mode
```bash
# Enable debug logging
az-os --debug start

# View detailed logs
az-os logs --level debug
```

## Support

### Getting Help
```bash
# Show help
az-os help

# Show command help
az-os help <command>

# View documentation
az-os docs
```

### Community
- GitHub Issues: https://github.com/your-org/az-os/issues
- Discord: https://discord.gg/az-os
- Documentation: https://docs.az-os.com