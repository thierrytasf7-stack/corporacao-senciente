import { BacktestingService } from '../BacktestingService';
import { HistoricalDataLoader } from '../HistoricalDataLoader';
import { StrategyService } from '../StrategyService';
import { AnalyticsService } from '../AnalyticsService';
import { Strategy } from '../../types/strategy-types';

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
    it('should execute backtest successfully', async () => {
      const mockStrategy: Strategy = {
        id: 'test-strategy',
        type: 'VALUE_BETTING',
        name: 'Test Strategy',
        parameters: {}
      };

      const mockConfig: any = {
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          leagues: ['premier-league'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      // Mock dependencies
      jest.spyOn(historicalDataLoader, 'getHistoricalOdds').mockResolvedValue([]);
      jest.spyOn(strategyService, 'executeStrategy').mockReturnValue(null);

      const result = await backtestingService.runBacktest(mockStrategy, mockConfig);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.strategyId).toBe(mockStrategy.id);
      expect(result.config).toEqual(mockConfig);
      expect(result.metrics).toBeDefined();
      expect(result.bets).toBeDefined();
      expect(result.equityCurve).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should handle empty historical data', async () => {
      const mockStrategy: Strategy = {
        id: 'test-strategy',
        type: 'VALUE_BETTING',
        name: 'Test Strategy',
        parameters: {}
      };

      const mockConfig: any = {
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
        initialBankroll: 1000,
        stakingStrategy: 'fixed',
        filters: {
          sports: ['soccer'],
          leagues: ['premier-league'],
          minOdds: 1.5,
          maxOdds: 3.0
        }
      };

      jest.spyOn(historicalDataLoader, 'getHistoricalOdds').mockResolvedValue([]);

      await expect(backtestingService.runBacktest(mockStrategy, mockConfig))
        .rejects
        .toThrow('Nenhum dado histórico encontrado para os filtros especificados');
    });
  });

  describe('getResults', () => {
    it('should return backtest results', () => {
      const mockResult = {
        id: 'test-id',
        strategyId: 'test-strategy',
        config: {} as any,
        metrics: {} as any,
        bets: [],
        equityCurve: [],
        createdAt: new Date()
      };

      jest.spyOn(backtestingService, 'getResults').mockReturnValue(mockResult);

      const result = backtestingService.getResults('test-id');
      expect(result).toEqual(mockResult);
    });

    it('should return null for non-existent backtest', () => {
      jest.spyOn(backtestingService, 'getResults').mockReturnValue(null);

      const result = backtestingService.getResults('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('compareStrategies', () => {
    it('should compare multiple strategies', () => {
      const strategyIds = ['strategy-1', 'strategy-2'];
      
      const result = backtestingService.compareStrategies(strategyIds);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate correct metrics', () => {
      const mockBets = [
        {
          id: 'bet-1',
          strategyId: 'test-strategy',
          strategyType: 'VALUE_BETTING',
          event: {
            sport: 'soccer',
            market: 'MATCH_WINNER',
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            matchDate: new Date(),
            bookmaker: 'Betfair',
            odds: { '1': 2.0 }
          },
          stake: 10,
          odds: { '1': 2.0 },
          timestamp: new Date(),
          status: 'WON',
          profit: 10
        }
      ];

      const mockEquityCurve = [{ date: new Date().toISOString(), equity: 1010 }];
      const maxDrawdown = 0;
      const initialBankroll = 1000;

      const metrics = (backtestingService as any).calculateMetrics(
        mockBets,
        mockEquityCurve,
        maxDrawdown,
        initialBankroll
      );

      expect(metrics.winRate).toBe(1);
      expect(metrics.roi).toBe(1);
      expect(metrics.totalProfit).toBe(10);
      expect(metrics.betCount).toBe(1);
    });
  });

  describe('calculateStake', () => {
    it('should calculate fixed stake', () => {
      const stake = (backtestingService as any).calculateStake(
        'fixed',
        1000,
        10,
        { '1': 2.0 }
      );
      expect(stake).toBe(10);
    });

    it('should calculate percentage stake', () => {
      const stake = (backtestingService as any).calculateStake(
        'percentage',
        1000,
        2,
        { '1': 2.0 }
      );
      expect(stake).toBe(20);
    });

    it('should calculate Kelly stake', () => {
      const stake = (backtestingService as any).calculateStake(
        'kelly',
        1000,
        0,
        { '1': 2.0 }
      );
      expect(stake).toBeGreaterThan(0);
    });
  });

  describe('calculateProfit', () => {
    it('should calculate profit for winning bet', () => {
      const mockBet = {
        id: 'bet-1',
        strategyId: 'test-strategy',
        strategyType: 'VALUE_BETTING',
        event: {
          sport: 'soccer',
          market: 'MATCH_WINNER',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          matchDate: new Date(),
          bookmaker: 'Betfair',
          odds: { '1': 2.0 }
        },
        stake: 10,
        odds: { '1': 2.0 },
        timestamp: new Date(),
        status: 'OPEN'
      };

      const mockResult = {
        sport: 'soccer',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        matchDate: new Date(),
        homeScore: 2,
        awayScore: 1,
        winner: 'home'
      };

      const profit = (backtestingService as any).calculateProfit(mockBet, mockResult);
      expect(profit).toBe(10);
    });

    it('should calculate loss for losing bet', () => {
      const mockBet = {
        id: 'bet-1',
        strategyId: 'test-strategy',
        strategyType: 'VALUE_BETTING',
        event: {
          sport: 'soccer',
          market: 'MATCH_WINNER',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          matchDate: new Date(),
          bookmaker: 'Betfair',
          odds: { '1': 2.0 }
        },
        stake: 10,
        odds: { '1': 2.0 },
        timestamp: new Date(),
        status: 'OPEN'
      };

      const mockResult = {
        sport: 'soccer',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        matchDate: new Date(),
        homeScore: 1,
        awayScore: 2,
        winner: 'away'
      };

      const profit = (backtestingService as any).calculateProfit(mockBet, mockResult);
      expect(profit).toBe(-10);
    });
  });

  describe('calculateSharpeRatio', () => {
    it('should calculate Sharpe ratio', () => {
      const mockEquityCurve = [
        { date: '2024-01-01', equity: 1000 },
        { date: '2024-01-02', equity: 1010 },
        { date: '2024-01-03', equity: 1020 }
      ];
      const initialBankroll = 1000;

      const sharpeRatio = (backtestingService as any).calculateSharpeRatio(
        mockEquityCurve,
        initialBankroll
      );

      expect(sharpeRatio).toBeGreaterThanOrEqual(0);
    });
  });
});