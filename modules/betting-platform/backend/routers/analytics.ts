import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import AnalyticsService from '../services/AnalyticsService';

const analyticsService = new AnalyticsService();

const t = initTRPC.create();

const analyticsRouter = t.router({
  getMetrics: t.procedure
    .input(
      z.object({
        strategyId: z.string(),
        dateRange: z.object({
          startDate: z.date(),
          endDate: z.date()
        }).optional()
      })
    )
    .query(({ input }) => {
      const { strategyId, dateRange } = input;
      const metrics = analyticsService.getPerformanceMetrics(strategyId);
      
      if (dateRange) {
        const filteredBets = analyticsService.betHistory.filter(bet => {
          const betDate = bet.timestamp;
          return betDate >= dateRange.startDate && betDate <= dateRange.endDate;
        });
        
        const totalProfit = filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
        const totalStake = filteredBets.reduce((sum, bet) => sum + (bet.recommendedStake || 0), 0);
        const roi = totalStake > 0 ? totalProfit / totalStake : 0;
        
        return { ...metrics, roi };
      }
      
      return metrics;
    }),
  
  trackBet: t.procedure
    .input(
      z.object({
        strategyId: z.string(),
        strategyType: z.enum(['VALUE_BET', 'ARBITRAGE', 'MARTINGALE']),
        timestamp: z.date(),
        profit: z.number().optional(),
        recommendedStake: z.number(),
        riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH'])
      })
    )
    .mutation(({ input }) => {
      analyticsService.trackBet(input);
      return { success: true };
    }),
  
  getROI: t.procedure
    .input(
      z.object({
        period: z.object({
          startDate: z.date(),
          endDate: z.date()
        })
      })
    )
    .query(({ input }) => {
      const { period } = input;
      const roi = analyticsService.calculateROI(period);
      return { roi };
    })
});

export default analyticsRouter;