# BacktestingService

## Overview

The BacktestingService provides comprehensive backtesting capabilities for sports betting strategies. It allows users to test betting strategies against historical data to evaluate performance metrics and optimize strategy parameters.

## Key Features

- **Strategy Testing**: Execute various betting strategies (Value Betting, Arbitrage, Kelly Criterion, Sure Betting)
- **Historical Data Integration**: Leverages HistoricalDataLoader to fetch historical odds and match results
- **Comprehensive Metrics**: Calculates win rate, ROI, Sharpe ratio, max drawdown, and other key performance indicators
- **Equity Curve Tracking**: Monitors bankroll evolution over time
- **Result Persistence**: Saves backtest results to JSON files for later analysis
- **Result Management**: List, retrieve, and delete backtest results

## Usage

### Basic Backtest

```typescript
import { BacktestingService } from './services/BacktestingService';
import { HistoricalDataLoader } from './services/HistoricalDataLoader';
import { StrategyService } from './services/StrategyService';

// Initialize services
const historicalDataLoader = new HistoricalDataLoader(apiKey, username, password, dbConnectionString);
const strategyService = new StrategyService();
const backtestingService = new BacktestingService(historicalDataLoader, strategyService);

// Create backtest request
const request = {
  strategyId: 'value-betting-strategy',
  config: {
    strategyType: 'VALUE_BETTING',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    initialBankroll: 1000,
    riskLevel: 'MEDIUM'
  },
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  initialBankroll: { available: 1000, total: 1000 }
};

// Run backtest
const result = await backtestingService.runBacktest(request);
console.log('Backtest completed:', result.metrics);
```

### Result Management

```typescript
// List all backtest results
const results = await backtestingService.listResults();
console.log('Available backtests:', results);

// Get specific result
const result = await backtestingService.getResult('backtest-id');
console.log('Backtest result:', result);

// Delete result
const deleted = await backtestingService.deleteResult('backtest-id');
console.log('Deleted:', deleted);
```

## Data Structure

### BacktestRequest

```typescript
interface BacktestRequest {
  strategyId: string;
  config: BacktestConfig;
  startDate: Date;
  endDate: Date;
  initialBankroll: Bankroll;
}
```

### BacktestConfig

```typescript
interface BacktestConfig {
  strategyType: 'VALUE_BETTING' | 'ARBITRAGE' | 'KELLY_CRITERION' | 'SURE_BETTING';
  startDate: Date;
  endDate: Date;
  initialBankroll: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  parameters?: Record<string, any>;
}
```

### BacktestResult

```typescript
interface BacktestResult {
  id: string;
  strategyId: string;
  config: BacktestConfig;
  metrics: {
    winRate: number;
    roi: number;
    totalProfit: number;
    sharpeRatio: number;
    maxDrawdown: number;
    avgOdds: number;
    betCount: number;
  };
  bets: BacktestBet[];
  equityCurve: { date: string; equity: number }[];
  createdAt: Date;
}
```

## Metrics Calculation

### Win Rate
- Percentage of winning bets
- Formula: (Winning Bets / Total Bets) × 100

### ROI (Return on Investment)
- Return relative to initial bankroll
- Formula: (Total Profit / Initial Bankroll) × 100

### Sharpe Ratio
- Risk-adjusted return metric
- Formula: Mean Return / Standard Deviation of Returns

### Max Drawdown
- Maximum peak-to-trough decline
- Formula: (Max Equity - Lowest Equity) / Max Equity

### Average Odds
- Mean of all odds used in bets

## Integration

The BacktestingService integrates with:

- **HistoricalDataLoader**: Fetches historical odds and match data
- **StrategyService**: Executes betting strategies
- **AnalyticsService**: Provides additional performance analytics
- **Logger**: Logs backtest progress and errors

## Error Handling

The service includes comprehensive error handling:

- Validates input parameters
- Handles missing historical data
- Catches and logs errors during backtest execution
- Provides meaningful error messages
- Ensures data consistency

## Performance Considerations

- Backtests can be resource-intensive for large date ranges
- Results are cached to JSON files for quick retrieval
- Memory usage scales with number of bets and historical data
- Consider running backtests during off-peak hours for large datasets