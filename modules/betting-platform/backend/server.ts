import { createTRPCProxyClient } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AppRouter } from './routers';
import analyticsRouter from './routers/analytics';

const t = initTRPC.create();

const appRouter = t.router({
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

export default appRouter;