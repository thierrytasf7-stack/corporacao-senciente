import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const betsRouter = router({
  getBets: publicProcedure
    .input(z.object({
      status: z.enum(['open', 'won', 'lost', 'void', 'cancelled']).optional(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(({ input }) => {
      // TODO: Implement get bets
      return {
        bets: [
          {
            id: 'mock-bet-id',
            userId: 'mock-user-id',
            bettingAccountId: 'mock-account-id',
            eventId: 'mock-event-id',
            marketId: 'mock-market-id',
            stake: 100.00,
            odds: 2.5,
            betType: 'back',
            selection: 'home',
            status: 'open',
            profitLoss: 0.0,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      };
    }),
  
  placeBet: publicProcedure
    .input(z.object({
      eventId: z.string(),
      marketId: z.string(),
      stake: z.number().min(1),
      odds: z.number().min(1),
      betType: z.enum(['back', 'lay', 'back_handicap', 'lay_handicap', 'over', 'under']),
      selection: z.string().optional(),
    }))
    .mutation(({ input }) => {
      // TODO: Implement place bet
      return {
        success: true,
        message: 'Bet placed successfully',
        betId: 'mock-bet-id',
      };
    }),
});