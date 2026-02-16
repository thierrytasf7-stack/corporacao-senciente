import { z } from 'zod';
import { trpc } from '@/trpc-server';
import { OddsPollingService } from './odds-polling.service';

export const oddsRouter = trpc.router('odds')
  .query('live', {
    input: z.object({
      eventId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const oddsService = ctx.oddsService as OddsPollingService;
      return await oddsService.getLiveOdds(input.eventId);
    }
  })
  .query('history', {
    input: z.object({
      marketId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const oddsService = ctx.oddsService as OddsPollingService;
      return await oddsService.getOddsHistory(input.marketId);
    }
  })
  .query('movements', {
    input: z.object({
      marketId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const oddsService = ctx.oddsService as OddsPollingService;
      return await oddsService.getMarketMovements(input.marketId);
    }
  })
  .query('arbitrage', {
    async resolve({ ctx }) {
      const oddsService = ctx.oddsService as OddsPollingService;
      return await oddsService.getActiveArbitrageOpportunities();
    }
  });