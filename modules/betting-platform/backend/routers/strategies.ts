import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import StrategyService from '../services/StrategyService';
import { Strategy, StrategyResult, Bankroll } from '../types/strategy-types';

const t = initTRPC.create();

export const strategiesRouter = t.router({
  execute: t.procedure
    .input(
      z.object({
        strategy: z.object({
          id: z.string(),
          type: z.enum(['VALUE_BETTING', 'ARBITRAGE', 'KELLY_CRITERION', 'SURE_BETTING']),
          parameters: z.record(z.any())
        }),
        bankroll: z.object({
          available: z.number(),
          total: z.number()
        }),
        marketData: z.record(z.any())
      })
    )
    .query(async ({ input }) => {
      const service = new StrategyService();
      return service.executeStrategy(input.strategy, input.bankroll, input.marketData);
    }),

  listStrategies: t.procedure
    .query(async () => {
      return [
        {
          id: 'value-betting',
          type: 'VALUE_BETTING' as const,
          name: 'Value Betting',
          description: 'Identifies bets where the odds are higher than the true probability',
          parameters: {
            edgeThreshold: 0.05,
            confidence: 0.75
          }
        },
        {
          id: 'arbitrage',
          type: 'ARBITRAGE' as const,
          name: 'Arbitrage',
          description: 'Exploits price differences across bookmakers',
          parameters: {
            minimumProfit: 0.01,
            maxBooks: 3
          }
        },
        {
          id: 'kelly-criterion',
          type: 'KELLY_CRITERION' as const,
          name: 'Kelly Criterion',
          description: 'Calculates optimal bet size based on edge and odds',
          parameters: {
            fractionalKelly: 0.25,
            maxRisk: 0.05
          }
        },
        {
          id: 'sure-betting',
          type: 'SURE_BETTING' as const,
          name: 'Sure Betting',
          description: 'Guarantees profit by covering all outcomes',
          parameters: {
            minimumGuaranteedProfit: 0.02,
            maxBooks: 4
          }
        }
      ];
    }),

  getPerformance: t.procedure
    .input(
      z.object({
        strategyId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      })
    )
    .query(async ({ input }) => {
      // Mock performance data - in production this would query a database
      const mockPerformance = {
        strategyId: input.strategyId,
        totalBets: 150,
        totalProfit: 2450.75,
        winRate: 0.42,
        roi: 0.0327,
        averageStake: 50,
        maxDrawdown: -800,
        startDate: input.startDate || '2024-01-01',
        endDate: input.endDate || '2024-03-15'
      };

      return mockPerformance;
    })
});