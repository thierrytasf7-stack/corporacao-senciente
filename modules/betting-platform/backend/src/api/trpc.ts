import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { authRouter } from './routers/auth';
import { betfairRouter } from './routers/betfair';

const t = initTRPC.create();

export const appRouter = t.router({
  auth: authRouter,
  betfair: betfairRouter,
});

export type AppRouter = typeof appRouter;