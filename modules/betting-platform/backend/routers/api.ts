import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { Context } from './context';
import { appRouter } from './index';

const server = initTRPC.create();

export const apiRouter = server.router({
  app: server.router(appRouter),
});

export type ApiRouter = typeof apiRouter;

export type inferProcedureInput = inferAsyncReturnType<typeof apiRouter>;