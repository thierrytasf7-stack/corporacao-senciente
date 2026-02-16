import { z } from 'zod';
import { AppRouter } from './routers';

export const strategyTypes = z.enum([
  'VALUE_BET', 
  'ARBITRAGE', 
  'MARTINGALE'
]);

export const riskLevels = z.enum([
  'LOW', 
  'MEDIUM', 
  'HIGH'
]);

export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
});