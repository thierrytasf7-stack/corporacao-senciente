import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const marketsRouter = router({
  getMarkets: publicProcedure
    .input(z.object({
      sport: z.string().optional(),
      league: z.string().optional(),
      eventId: z.string().optional(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(({ input }) => {
      // TODO: Implement get markets
      return {
        markets: [
          {
            id: 'mock-market-id',
            name: '1X2',
            description: 'Match Result (Home/Draw/Away)',
            marketType: 'moneyline',
            isActive: true,
            selections: [
              { name: 'home', price: 2.5 },
              { name: 'draw', price: 3.2 },
              { name: 'away', price: 2.8 },
            ],
          },
        ],
        total: 1,
      };
    }),
  
  getMarket: publicProcedure
    .input(z.object({
      marketId: z.string(),
    }))
    .query(({ input }) => {
      // TODO: Implement get single market
      return {
        id: input.marketId,
        name: '1X2',
        description: 'Match Result (Home/Draw/Away)',
        marketType: 'moneyline',
        isActive: true,
        selections: [
          { name: 'home', price: 2.5 },
          { name: 'draw', price: 3.2 },
          { name: 'away', price: 2.8 },
        ],
      };
    }),
});