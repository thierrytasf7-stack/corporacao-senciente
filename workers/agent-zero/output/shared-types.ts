import { z } from 'zod'';

export const AuthRouter = {
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  
  register: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
};

export const UserRouter = {
  me: z.object({}),
  list: z.object({}),
};

export const EventRouter = {
  list: z.object({
    sportId: z.string().optional(),
    leagueId: z.string().optional(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }),
  
  get: z.object({ eventId: z.string() }),
};

export const MarketRouter = {
  list: z.object({
    sportId: z.string().optional(),
    marketType: z.enum(['moneyline', 'spread', 'totals', 'handicap', 'outright', 'props']).optional(),
  }),
  
  get: z.object({ marketId: z.string() }),
};

export const BetRouter = {
  list: z.object({
    status: z.enum(['open', 'won', 'lost', 'void', 'cancelled']).optional(),
    eventId: z.string().optional(),
    marketId: z.string().optional(),
  }),
  
  place: z.object({
    eventId: z.string(),
    marketId: z.string(),
    stake: z.number().positive(),
    odds: z.number().positive(),
    betType: z.enum(['back', 'lay', 'back_handicap', 'lay_handicap', 'over', 'under']),
    selection: z.string().optional(),
  }),
};

export const StrategyRouter = {
  list: z.object({
    strategyType: z.enum(['arbitrage', 'value_betting', 'middles', 'scalping', 'hedging']).optional(),
    isActive: z.boolean().optional(),
  }),
  
  create: z.object({
    name: z.string(),
    description: z.string().optional(),
    strategyType: z.enum(['arbitrage', 'value_betting', 'middles', 'scalping', 'hedging']),
    parameters: z.any(),
  }),
  
  backtest: z.object({
    strategyId: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    initialBankroll: z.number().positive(),
  }),
};