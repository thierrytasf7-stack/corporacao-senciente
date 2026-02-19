import { BacktestingService } from '../services/BacktestingService';
import { HistoricalDataLoader } from '../services/HistoricalDataLoader';
import { StrategyService } from '../services/StrategyService';
import { AnalyticsService } from '../services/AnalyticsService';
import { Strategy, StrategyType } from '../types/strategy-types';
import { DateTime } from 'luxon';

describe('BacktestingService', () => {
  let backtestingService: BacktestingService;
  let historicalDataLoader: HistoricalDataLoader;
  let strategyService: StrategyService;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    historicalDataLoader = new HistoricalDataLoader(
      'test-key',
      'test-user',
      'test-pass',
      'test-db'
    );
    strategyService = new StrategyService();
    analyticsService = new AnalyticsService();
    backtestingService = new BacktestingService(
      historicalDataLoader,
      strategyService,
      analyticsService
    );
  });

  describe('runBacktest', () => {
    it('should execute backtest and return results', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.strategyId).toBe(strategy.id);
      expect(result.startDate).toEqual(config.dateRange.start);
      expect(result.endDate).toEqual(config.dateRange.end);
      expect(result.initialBankroll).toBe(config.initialBankroll);
      expect(result.finalBankroll).toBeGreaterThanOrEqual(0);
      expect(result.totalBets).toBeGreaterThanOrEqual(0);
      expect(result.winningBets).toBeGreaterThanOrEqual(0);
      expect(result.losingBets).toBeGreaterThanOrEqual(0);
      expect(result.totalProfit).toBeDefined();
      expect(result.roi).toBeDefined();
      expect(result.winRate).toBeDefined();
      expect(result.averageOdds).toBeDefined();
      expect(result.maxDrawdown).toBeDefined();
      expect(result.sharpeRatio).toBeDefined();
      expect(result.stakingStrategy).toBe(config.stakingStrategy);
      expect(result.trades).toBeDefined();
      expect(result.equityCurve).toBeDefined();
    });

    it('should handle empty historical data', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['nonexistent-sport'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result).toBeDefined();
      expect(result.totalBets).toBe(0);
      expect(result.finalBankroll).toBe(config.initialBankroll);
    });
  });

  describe('getResults', () => {
    it('should return backtest results by ID', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);
      const retrievedResult = backtestingService.getResults(result.id);

      expect(retrievedResult).toBeDefined();
      expect(retrievedResult?.id).toBe(result.id);
    });

    it('should return undefined for non-existent backtest ID', () => {
      const result = backtestingService.getResults('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('compareStrategies', () => {
    it('should compare multiple strategies', async () => {
      const strategy1: Strategy = {
        id: 'strategy-1',
        type: StrategyType.VALUE_BETTING,
        name: 'Strategy 1',
        parameters: {}
      };

      const strategy2: Strategy = {
        id: 'strategy-2',
        type: StrategyType.ARBITRAGE,
        name: 'Strategy 2',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      await backtestingService.runBacktest(strategy1, config);
      await backtestingService.runBacktest(strategy2, config);

      const comparison = await backtestingService.compareStrategies(['strategy-1', 'strategy-2']);

      expect(comparison).toBeDefined();
      expect(comparison.length).toBe(2);
      expect(comparison[0].strategyId).toBe('strategy-1');
      expect(comparison[1].strategyId).toBe('strategy-2');
      expect(comparison[0].totalBets).toBeGreaterThanOrEqual(0);
      expect(comparison[0].roi).toBeDefined();
      expect(comparison[0].winRate).toBeDefined();
    });

    it('should handle non-existent strategy IDs', async () => {
      const comparison = await backtestingService.compareStrategies(['non-existent']);
      expect(comparison).toBeDefined();
      expect(comparison.length).toBe(0);
    });
  });

  describe('metrics calculation', () => {
    it('should calculate ROI correctly', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result.roi).toBeGreaterThanOrEqual(-1);
      expect(result.roi).toBeLessThanOrEqual(10);
    });

    it('should calculate win rate correctly', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result.winRate).toBeGreaterThanOrEqual(0);
      expect(result.winRate).toBeLessThanOrEqual(1);
    });

    it('should calculate max drawdown correctly', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(result.maxDrawdown).toBeLessThanOrEqual(config.initialBankroll);
    });
  });

  describe('staking strategies', () => {
    it('should handle fixed staking strategy', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);
      expect(result.stakingStrategy).toBe('fixed');
    });

    it('should handle percentage staking strategy', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'percentage',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);
      expect(result.stakingStrategy).toBe('percentage');
    });

    it('should handle kelly staking strategy', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 1000,
        stakingStrategy: 'kelly',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);
      expect(result.stakingStrategy).toBe('kelly');
    });
  });

  describe('edge cases', () => {
    it('should handle zero initial bankroll', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        initialBankroll: 0,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result).toBeDefined();
      expect(result.finalBankroll).toBe(0);
      expect(result.totalBets).toBe(0);
    });

    it('should handle invalid date range', async () => {
      const strategy: Strategy = {
        id: 'test-strategy',
        type: StrategyType.VALUE_BETTING,
        name: 'Test Strategy',
        parameters: {}
      };

      const config = {
        dateRange: {
          start: new Date('2024-01-07'),
          end: new Date('2024-01-01')
        },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      const result = await backtestingService.runBacktest(strategy, config);

      expect(result).toBeDefined();
      expect(result.totalBets).toBe(0);
    });
  });
});
