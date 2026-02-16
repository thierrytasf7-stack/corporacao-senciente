import { z } from 'zod';
import { strategyTypes, riskLevels, dateRangeSchema } from '../types/strategy-types';

export const strategySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: strategyTypes,
  riskLevel: riskLevels,
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const bankrollSchema = z.object({
  id: z.string().uuid(),
  strategyId: z.string().uuid(),
  initialAmount: z.number().positive(),
  currentAmount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'BRL', 'GBP']),
  riskPerBet: z.number().min(0).max(1),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const strategyResultSchema = z.object({
  id: z.string().uuid(),
  strategyId: z.string().uuid(),
  bankrollId: z.string().uuid(),
  date: z.date(),
  betAmount: z.number().positive(),
  odds: z.number().positive(),
  result: z.enum(['WIN', 'LOSS', 'CANCELLED']),
  profit: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional()
});

export const strategyResultAnalysisSchema = z.object({
  strategyId: z.string().uuid(),
  dateRange: dateRangeSchema,
  totalBets: z.number().positive(),
  totalWins: z.number().positive(),
  totalLosses: z.number().positive(),
  winRate: z.number().min(0).max(100),
  roi: z.number().min(-100).max(100),
  avgOdds: z.number().positive(),
  avgProfit: z.number().optional()
});

export type Strategy = z.infer<typeof strategySchema>;
export type Bankroll = z.infer<typeof bankrollSchema>;
export type StrategyResult = z.infer<typeof strategyResultSchema>;
export type StrategyResultAnalysis = z.infer<typeof strategyResultAnalysisSchema>;

export const parseStrategy = (data: unknown): Strategy => {
  return strategySchema.parse(data);
};

export const parseBankroll = (data: unknown): Bankroll => {
  return bankrollSchema.parse(data);
};

export const parseStrategyResult = (data: unknown): StrategyResult => {
  return strategyResultSchema.parse(data);
};

export const parseStrategyResultAnalysis = (data: unknown): StrategyResultAnalysis => {
  return strategyResultAnalysisSchema.parse(data);
};