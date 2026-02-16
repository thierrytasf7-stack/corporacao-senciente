import { Pool } from 'pg';
import { HistoricalDataLoader } from './services/HistoricalDataLoader';
import { DateTime } from 'luxon';

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'betting_platform',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// Create database pool
const dbPool = new Pool(dbConfig);

// Create HistoricalDataLoader instance
const historicalDataLoader = new HistoricalDataLoader(
  dbPool,
  process.env.BETFAIR_API_KEY || '',
  process.env.BETFAIR_API_URL || 'https://api.betfair.com/exchange/betting/rest/v1.0',
  parseInt(process.env.BATCH_SIZE || '1000')
};

// Date range for historical data (2+ years)
const startDate = DateTime.utc().minus({ years: 2 }).toISODate();
const endDate = DateTime.utc().toISODate();

// Main execution
async function main() {
  try {
    console.log('Starting historical data pipeline...');
    
    // Health check
    console.log('Performing health check...');
    const health = await historicalDataLoader.healthCheck();
    console.log('Health check results:', health);
    
    if (!health.database || !health.betfairApi) {
      console.error('Health check failed. Exiting...');
      process.exit(1);
    }
    
    // Load historical data
    console.log('Starting data load...');
    await historicalDataLoader.loadHistoricalDataInBatches(startDate, endDate);
    
    console.log('Historical data pipeline completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  dbPool.end().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  dbPool.end().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start the pipeline
main();