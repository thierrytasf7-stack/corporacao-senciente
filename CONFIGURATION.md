# Pipeline Configuration

## Database Configuration

### PostgreSQL Setup
```bash
# Create database
createdb betting_platform

# Run migrations
npm run migrate
npm run constraints

# Seed with sample data
psql -d betting_platform -f src/database/seed.sql
```

### Connection Pool Settings
- **Max Connections:** 20
- **Idle Timeout:** 30 seconds
- **Connection Timeout:** 2 seconds
- **Database:** betting_platform
- **Host:** localhost
- **Port:** 5432

## API Configuration

### Betfair API
- **Base URL:** https://api.betfair.com/exchange/betting/rest/v1.0
- **Authentication:** X-Authentication header
- **Rate Limits:** 5 requests/second
- **Data Format:** JSON

### Football Data API
- **Base URL:** https://api.football-data.org/v4
- **Authentication:** X-Auth-Token header
- **Rate Limits:** 10 requests/minute
- **Data Format:** JSON

## Performance Configuration

### Batch Processing
- **Batch Size:** 1000 records
- **Commit Interval:** Every batch
- **Retry Attempts:** 3 with exponential backoff

### Memory Management
- **Node.js Heap:** 2GB (default)
- **Stream Processing:** For large datasets
- **Garbage Collection:** Optimized for bulk operations

## Security Configuration

### Database Security
- **SSL:** Enabled for production
- **User Permissions:** Role-based access
- **Connection Pool:** Secure configuration

### API Security
- **API Keys:** Environment variable storage
- **Request Signing:** HMAC for sensitive operations
- **Rate Limiting:** Prevent abuse

## Monitoring Configuration

### Logging
- **Level:** INFO (production), DEBUG (development)
- **Format:** JSON for structured logging
- **Retention:** 30 days

### Metrics
- **Prometheus:** Metrics endpoint
- **Grafana:** Dashboard configuration
- **Alerting:** Threshold-based notifications

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/betting_platform
BETFAIR_API_KEY=your_betfair_api_key
FOOTBALL_DATA_API_KEY=your_football_data_api_key
```

### Optional
```bash
DB_USER=postgres
DB_HOST=localhost
DB_NAME=betting_platform
DB_PASSWORD=password
DB_PORT=5432
LOG_LEVEL=info
MAX_CONNECTIONS=20
BATCH_SIZE=1000
```

## Deployment Configuration

### Production
```bash
# Environment variables
export NODE_ENV=production
export LOG_LEVEL=warn

# Start with process manager
pm2 start src/index.ts --name historical-data-pipeline
```

### Development
```bash
# Environment variables
export NODE_ENV=development
export LOG_LEVEL=debug

# Start with hot reload
npm run dev
```

## Scaling Configuration

### Horizontal Scaling
- **Multiple Instances:** Load balancing
- **Database Replication:** Read replicas
- **API Rate Limiting:** Per-instance limits

### Vertical Scaling
- **Memory:** 4GB+ for large datasets
- **CPU:** Multi-core optimization
- **Storage:** SSD for better I/O performance

## Backup Configuration

### Database Backup
```bash
# Daily backup
pg_dump betting_platform > backup_$(date +%Y%m%d).sql

# Automated backup
0 2 * * * pg_dump betting_platform > /backups/betting_platform_$(date +%Y%m%d).sql
```

### Data Retention
- **Historical Odds:** 5 years
- **Match Results:** 10 years
- **Logs:** 30 days

## Error Handling Configuration

### Retry Strategy
- **Initial Delay:** 1 second
- **Max Delay:** 30 seconds
- **Backoff Factor:** 2x
- **Max Attempts:** 3

### Circuit Breaker
- **Failure Threshold:** 5 failures
- **Recovery Timeout:** 60 seconds
- **Half-Open Requests:** 3 requests

## Testing Configuration

### Test Database
```bash
# Create test database
createdb betting_platform_test

# Run tests
npm test
```

### Test Data
- **Sample Data:** Fixtures for testing
- **Mock APIs:** Simulated responses
- **Performance Tests:** Load testing configuration