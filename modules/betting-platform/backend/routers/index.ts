import { initTRPC } from '@trpc/server';
import { strategiesRouter } from './strategies';
import analyticsRouter from './analytics';

const t = initTRPC.create();

export const appRouter = t.router({
  strategies: strategiesRouter,
  analytics: analyticsRouter
});

export type AppRouter = typeof appRouter;