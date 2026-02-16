import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { BetfairClient, BetfairCredentials, MarketFilter, PlaceBetRequest, CancelBetRequest } from '../services/BetfairClient';
import { BetfairError } from '../types/betfair';

const t = initTRPC.create();

const betfairRouter = t.router({
  // Initialize Betfair client with credentials
  initialize: t.procedure
    .input(z.object({
      appKey: z.string().min(1),
      username: z.string().min(1),
      password: z.string().min(1),
      certFile: z.string().min(1),
      keyFile: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient(input);
        const account = await client.getAccountDetails();
        
        return {
          success: true,
          data: account,
          message: 'Betfair client initialized successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get odds for specific markets
  getOdds: t.procedure
    .input(z.object({
      marketIds: z.array(z.string()).min(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const odds = await client.getOdds(input.marketIds);
        
        return {
          success: true,
          data: odds,
          message: 'Odds retrieved successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get markets for specific event types
  getMarkets: t.procedure
    .input(z.object({
      eventTypeIds: z.array(z.string()).min(1),
      competitionIds: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const markets = await client.getMarkets(input.eventTypeIds, input.competitionIds);
        
        return {
          success: true,
          data: markets,
          message: 'Markets retrieved successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // List events
  listEvents: t.procedure
    .input(z.object({
      eventTypeIds: z.array(z.string()).min(1),
      competitionIds: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const events = await client.listEvents(input.eventTypeIds, input.competitionIds);
        
        return {
          success: true,
          data: events,
          message: 'Events retrieved successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Place a bet
  placeBet: t.procedure
    .input(z.object({
      marketId: z.string().min(1),
      selectionId: z.number(),
      side: z.enum(['BACK', 'LAY']),
      price: z.number().min(1.01).max(1000),
      size: z.number().min(0.01),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const result = await client.placeBet(
          input.marketId,
          input.selectionId,
          input.side,
          input.price,
          input.size
        );
        
        return {
          success: true,
          data: result,
          message: 'Bet placed successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Cancel all orders for a market
  cancelAllOrders: t.procedure
    .input(z.object({
      marketId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const result = await client.cancelAllOrders(input.marketId);
        
        return {
          success: true,
          data: result,
          message: 'All orders cancelled successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get account details
  getAccountDetails: t.procedure
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const account = await client.getAccountDetails();
        
        return {
          success: true,
          data: account,
          message: 'Account details retrieved successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get account funds
  getAccountFunds: t.procedure
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const funds = await client.getAccountFunds();
        
        return {
          success: true,
          data: funds,
          message: 'Account funds retrieved successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get market book
  getMarketBook: t.procedure
    .input(z.object({
      marketId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new BetfairClient({
          appKey: process.env.BETFAIR_APP_KEY!,
          username: process.env.BETFAIR_USERNAME!,
          password: process.env.BETFAIR_PASSWORD!,
          certFile: process.env.BETFAIR_CERT_FILE!,
          keyFile: process.env.BETFAIR_KEY_FILE!,
        });

        const marketBook = await client.getMarketBook(input.marketId);
        
        return {
          success: true,
          data: marketBook,
          message: 'Market book retrieved successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});

export { betfairRouter };