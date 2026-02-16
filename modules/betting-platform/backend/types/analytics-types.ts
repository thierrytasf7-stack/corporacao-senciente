import { z } from 'zod';
import { strategyTypes, riskLevels, dateRangeSchema } from './strategy-types';

export const StrategyResult = z.object({
  strategyId: z.string(),
  strategyType: strategyTypes,
  timestamp: z.date(),
  profit: z.number().optional(),
  recommendedStake: z.number(),
  riskLevel: riskLevels
});

export const Metrics = z.object({
  totalBets: z.number(),
  totalProfit: z.number(),
  averageProfit: z.number(),
  winRate: z.number(),
  roi: z.number(),
  riskMetrics: z.object({
    averageRisk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']),
    maxRisk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'])
  })
});

export const DateRange = dateRangeSchema;