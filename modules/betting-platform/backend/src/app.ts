import { BacktestingService } from './services/BacktestingService';
import { HistoricalDataLoader } from './services/HistoricalDataLoader';
import { StrategyService } from './services/StrategyService';
import { AnalyticsService } from './services/AnalyticsService';

// Initialize services
const historicalDataLoader = new HistoricalDataLoader(
  process.env.BETFAIR_API_KEY || '',
  process.env.BETFAIR_USERNAME || '',
  process.env.BETFAIR_PASSWORD || '',
  process.env.DB_CONNECTION_STRING || ''
);

const strategyService = new StrategyService();
const analyticsService = new AnalyticsService();
const backtestingService = new BacktestingService(
  historicalDataLoader,
  strategyService
);

// Initialize data loader
historicalDataLoader.initialize().then(() => {
  console.log('Historical data loader initialized');
}).catch(error => {
  console.error('Failed to initialize historical data loader:', error);
});

export {
  backtestingService,
  historicalDataLoader,
  strategyService,
  analyticsService
};