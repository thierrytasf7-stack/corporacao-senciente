# Historical Data Pipeline

ETL pipeline for loading 2+ years of historical betting data from Betfair API into PostgreSQL.

## Features

- **Data Extraction:** Fetches historical odds from Betfair API and match results from public APIs
- **Data Transformation:** Validates and transforms data to internal schema format
- **Data Loading:** Bulk loads data into PostgreSQL with upsert logic and error handling
- **Performance:** Optimized for >10k records/minute with batch processing
- **Reliability:** Transaction-based loading with rollback on failure

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Betfair API   │───▶│  HistoricalDataLoader │───▶│    PostgreSQL     │
│  (Historical Odds) │    │     (ETL Pipeline)      │    │   (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Schema

### Tables

1. **sports** - Master data for sports and configurations
2. **markets** - Master data for betting markets
3. **match_results** - Historical match results with scores
4. **historical_odds** - Historical odds data from Betfair

### Key Features
- **Performance Indexes:** Optimized for query performance
- **Data Integrity:** Foreign keys and check constraints
- **Audit Trail:** Created/updated timestamps on all tables
- **Soft Deletes:** Active/inactive flags for records

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Betfair API key
- Football Data API key (optional)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your API keys in `.env`

5. Create PostgreSQL database:
   ```bash
   createdb betting_platform
   ```

6. Run database migrations:
   ```bash
   npm run migrate
   npm run constraints
   ```

## Usage

### Basic Usage

```bash
npm start
```

### Development

```bash
npm run dev
```

### Manual Migration

```bash
npm run migrate
npm run constraints
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETFAIR_API_KEY` | Betfair API authentication | Yes |
| `FOOTBALL_DATA_API_KEY` | Football data API key | No |
| `DB_USER` | Database username | No (defaults to postgres) |
| `DB_HOST` | Database host | No (defaults to localhost) |
| `DB_NAME` | Database name | No (defaults to betting_platform) |
| `DB_PASSWORD` | Database password | No (defaults to password) |
| `DB_PORT` | Database port | No (defaults to 5432) |

## API Integration

### Betfair API
- **Endpoint:** `https://api.betfair.com/exchange/betting/rest/v1.0`
- **Authentication:** X-Authentication header with API key
- **Data:** Historical odds via listMarketBook endpoint

### Football Data API
- **Endpoint:** `https://api.football-data.org/v4`
- **Authentication:** X-Auth-Token header
- **Data:** Match results and scores

## Performance

### Expected Throughput
- **Historical Odds:** 5,000-10,000 records/minute
- **Match Results:** 1,000-2,000 records/minute
- **Total:** >10,000 records/minute

### Optimization Strategies
- **Batch Processing:** 1000 records per batch
- **Connection Pooling:** 20 maximum connections
- **Upsert Logic:** ON CONFLICT for existing records
- **Indexing:** Composite indexes for query performance

## Error Handling

### Retry Logic
- **API Calls:** Exponential backoff (1s, 2s, 4s, 8s)
- **Database Operations:** Transaction rollback on failure
- **Graceful Shutdown:** Clean database connection termination

### Error Categories
- **Network Errors:** API connectivity issues
- **Data Errors:** Invalid or malformed data
- **Database Errors:** Connection or constraint violations

## Monitoring

### Health Checks
- Database connection status
- API response times
- Data load progress

### Metrics
- Records processed per minute
- Error rates and types
- Memory and CPU usage

## Testing

### Unit Tests
```bash
npm test
```

### Type Checking
```bash
npm run typecheck
```

## Deployment

### Production
1. Build the application
2. Configure environment variables
3. Run database migrations
4. Start the pipeline

### Environment Setup
- **Node.js:** Use process manager (PM2, systemd)
- **Database:** Configure connection pooling
- **Monitoring:** Set up logging and alerting

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection parameters
   - Check network connectivity

2. **API Authentication Failed**
   - Verify API keys are correct
   - Check API rate limits
   - Ensure proper headers are set

3. **Data Validation Errors**
   - Check data format matches schema
   - Verify required fields are present
   - Handle null values appropriately

### Logs
- **Application Logs:** Console output and file logs
- **Database Logs:** PostgreSQL log files
- **API Logs:** External service response logs

## Future Enhancements

### Near-term
- [ ] Add data compression for storage optimization
- [ ] Implement data archiving strategy
- [ ] Add real-time data streaming

### Long-term
- [ ] Multi-source data integration
- [ ] Advanced data analytics and reporting
- [ ] Machine learning for data quality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create a GitHub issue
- Check the troubleshooting section
- Review the logs for error details