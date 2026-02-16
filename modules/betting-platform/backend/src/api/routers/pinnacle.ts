import { z } from 'zod';
import { t, PublicProcedureType } from '@trpc/server';
import { Context } from '../../context';
import { PinnacleAPIClient, Sport, League, Fixture, Odds, Line, Bet, PinnacleError } from '../client';

export const pinnacleRouter = t.router({
  sports: t.procedure
    .query(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const sports = await client.getSports();
          return { success: true, data: sports };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),

  leagues: t.procedure
    .input(
      t.object({
        sportId: t.string(),
      })
    )
    .query(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const leagues = await client.getLeagues(opts.input.sportId);
          return { success: true, data: leagues };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),

  fixtures: t.procedure
    .input(
      t.object({
        sportId: t.string(),
        leagueId: t.string().optional(),
      })
    )
    .query(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const fixtures = await client.getFixtures(
            opts.input.sportId,
            opts.input.leagueId
          );
          return { success: true, data: fixtures };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),

  odds: t.procedure
    .input(
      t.object({
        sportId: t.string(),
        leagueId: t.string().optional(),
        oddsFormat: t.union([
          t.literal('DECIMAL'),
          t.literal('AMERICAN')
        ]).default('DECIMAL'),
      })
    )
    .query(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const odds = await client.getOdds(
            opts.input.sportId,
            opts.input.leagueId,
            opts.input.oddsFormat
          );
          return { success: true, data: odds };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),

  line: t.procedure
    .input(
      t.object({
        sportId: t.string(),
        leagueId: t.string(),
        eventId: t.string(),
      })
    )
    .query(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const line = await client.getLine(
            opts.input.sportId,
            opts.input.leagueId,
            opts.input.eventId
          );
          return { success: true, data: line };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),

  bets: t.procedure
    .query(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const bets = await client.getBets();
          return { success: true, data: bets };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),

  placeBet: t.procedure
    .input(
      t.object({
        fixtureId: t.string(),
        betType: t.string(),
        selection: t.object({
          type: t.string(),
          teamId: t.string().optional(),
          points: t.number().optional(),
          odds: t.number(),
        }),
        stake: t.number(),
        metadata: t.record(t.string(), t.any()).optional(),
      })
    )
    .mutation(
      async (opts) => {
        const client = new PinnacleAPIClient({
          username: opts.ctx.config.PINNACLE_USERNAME,
          password: opts.ctx.config.PINNACLE_PASSWORD,
        });

        try {
          const bet = await client.placeBet({
            fixtureId: opts.input.fixtureId,
            betType: opts.input.betType,
            selection: opts.input.selection,
            stake: opts.input.stake,
            metadata: opts.input.metadata,
          });
          return { success: true, data: bet };
        } catch (error) {
          if (error instanceof PinnacleError) {
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error' };
        }
      }
    ),
});