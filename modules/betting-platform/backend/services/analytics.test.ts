import AnalyticsService from './AnalyticsService';
import { StrategyResult, StrategyType, DateRange, Metrics } from '../types/strategy-types';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockBets: StrategyResult[];

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    mockBets = [
      {
        strategyId: 'strategy-1',
        strategyType: StrategyType.MARTINGALE,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        profit: 50,
        recommendedStake: 100,
        riskLevel: 'LOW'
      },
      {
        strategyId: 'strategy-1',
        strategyType: StrategyType.MARTINGALE,
        timestamp: new Date('2024-01-02T12:00:00Z'),
        profit: -20,
        recommendedStake: 50,
        riskLevel: 'MEDIUM'
      },
      {
        strategyId: 'strategy-2',
        strategyType: StrategyType.FIBONACCI,
        timestamp: new Date('2024-01-03T14:00:00Z'),
        profit: 100,
        recommendedStake: 200,
        riskLevel: 'HIGH'
      }
    ];
  });

  describe('trackBet', () => {
    it('should add bet to history', () => {
      const bet: StrategyResult = {
        strategyId: 'test-strategy',
        strategyType: StrategyType.MARTINGALE,
        timestamp: new Date(),
        profit: 25,
        recommendedStake: 50,
        riskLevel: 'LOW'
      };

      analyticsService.trackBet(bet);
      expect(analyticsService['betHistory']).toHaveLength(1);
      expect(analyticsService['betHistory'][0]).toEqual(bet);
    });

    it('should add multiple bets to history', () => {
      const bet1: StrategyResult = {
        strategyId: 'test-strategy-1',
        strategyType: StrategyType.MARTINGALE,
        timestamp: new Date(),
        profit: 25,
        recommendedStake: 50,
        riskLevel: 'LOW'
      };

      const bet2: StrategyResult = {
        strategyId: 'test-strategy-2',
        strategyType: StrategyType.FIBONACCI,
        timestamp: new Date(),
        profit: 75,
        recommendedStake: 100,
        riskLevel: 'HIGH'
      };

      analyticsService.trackBet(bet1);
      analyticsService.trackBet(bet2);
      expect(analyticsService['betHistory']).toHaveLength(2);
      expect(analyticsService['betHistory'][0]).toEqual(bet1);
      expect(analyticsService['betHistory'][1]).toEqual(bet2);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return metrics for existing strategy', () => {
      mockBets.forEach(bet => analyticsService.trackBet(bet));

      const metrics = analyticsService.getPerformanceMetrics('strategy-1');

      expect(metrics.totalBets).toBe(2);
      expect(metrics.totalProfit).toBe(30);
      expect(metrics.averageProfit).toBe(15);
      expect(metrics.winRate).toBe(0.5);
      expect(metrics.roi).toBe(0.15);
      expect(metrics.riskMetrics.averageRisk).toBe('MEDIUM');
      expect(metrics.riskMetrics.maxRisk).toBe('MEDIUM');
    });

    it('should return zero metrics for non-existent strategy', () => {
      mockBets.forEach(bet => analyticsService.trackBet(bet));

      const metrics = analyticsService.getPerformanceMetrics('non-existent-strategy');

      expect(metrics.totalBets).toBe(0);
      expect(metrics.totalProfit).toBe(0);
      expect(metrics.averageProfit).toBe(0);
      expect(metrics.winRate).toBe(0);
      expect(metrics.roi).toBe(0);
      expect(metrics.riskMetrics.averageRisk).toBe('UNKNOWN');
      expect(metrics.riskMetrics.maxRisk).toBe('UNKNOWN');
    });

    it('should handle mixed risk levels correctly', () => {
      const mixedBets: StrategyResult[] = [
        { ...mockBets[0], riskLevel: 'LOW' },
        { ...mockBets[1], riskLevel: 'MEDIUM' },
        { ...mockBets[1], riskLevel: 'HIGH' }
      ];

      mixedBets.forEach(bet => analyticsService.trackBet(bet));

      const metrics = analyticsService.getPerformanceMetrics('strategy-1');
      const expectedAverageRisk = (1 + 2 + 3) / 3;
      
      expect(metrics.riskMetrics.averageRisk).toBe(analyticsService['getRiskLevel'](expectedAverageRisk));
      expect(metrics.riskMetrics.maxRisk).toBe('HIGH');
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI for date range', () => {
      mockBets.forEach(bet => analyticsService.trackBet(bet));

      const period: DateRange = {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-02T23:59:59Z')
      };

      const roi = analyticsService.calculateROI(period);
      expect(roi).toBe(0.15);
    });

    it('should return 0 for empty date range', () => {
      const period: DateRange = {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-01T23:59:59Z')
      };

      const roi = analyticsService.calculateROI(period);
      expect(roi).toBe(0);
    });
  });

  describe('getWinRate', () => {
    it('should calculate win rate for strategy type', () => {
      mockBets.forEach(bet => analyticsService.trackBet(bet));

      const winRate = analyticsService.getWinRate(StrategyType.MARTINGALE);
      expect(winRate).toBe(0.5);
    });

    it('should return 0 for non-existent strategy type', () => {
      mockBets.forEach(bet => analyticsService.trackBet(bet));

      const winRate = analyticsService.getWinRate(StrategyType.PROGRESSIVE);
      expect(winRate).toBe(0);
    });
  });

  describe('getRiskLevel', () => {
    it('should return LOW for score <= 1.5', () => {
      expect(analyticsService['getRiskLevel'](1.0)).toBe('LOW');
      expect(analyticsService['getRiskLevel'](1.5)).toBe('LOW');
    });

    it('should return MEDIUM for score <= 2.5', () => {
      expect(analyticsService['getRiskLevel'](1.6)).toBe('MEDIUM');
      expect(analyticsService['getRiskLevel'](2.5)).toBe('MEDIUM');
    });

    it('should return HIGH for score > 2.5', () => {
      expect(analyticsService['getRiskLevel'](2.6)).toBe('HIGH');
      expect(analyticsService['getRiskLevel'](3.0)).toBe('HIGH');
    });
  });

  describe('edge cases', () => {
    it('should handle zero stake in ROI calculation', () => {
      const zeroStakeBet: StrategyResult = {
        strategyId: 'test-strategy',
        strategyType: StrategyType.MARTINGALE,
        timestamp: new Date(),
        profit: 50,
        recommendedStake: 0,
        riskLevel: 'LOW'
      };

      analyticsService.trackBet(zeroStakeBet);

      const period: DateRange = {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-01T23:59:59Z')
      };

      const roi = analyticsService.calculateROI(period);
      expect(roi).toBe(0);
    });

    it('should handle null profit values', () => {
      const nullProfitBet: StrategyResult = {
        strategyId: 'test-strategy',
        strategyType: StrategyType.MARTINGALE,
        timestamp: new Date(),
        profit: null,
        recommendedStake: 100,
        riskLevel: 'LOW'
      };

      analyticsService.trackBet(nullProfitBet);

      const metrics = analyticsService.getPerformanceMetrics('test-strategy');
      expect(metrics.totalProfit).toBe(0);
      expect(metrics.averageProfit).toBe(0);
    });
  });
});