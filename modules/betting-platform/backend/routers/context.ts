import { inferAsyncReturnType, initTRPC } from '@trpc/server';

export type Context = {};

export const createContext = async (): Promise<Context> => {
  return {};
};

export type CreateContext = typeof createContext;