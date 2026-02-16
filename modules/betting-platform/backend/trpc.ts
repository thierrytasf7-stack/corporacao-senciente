import { z } from 'zod';
import { AppRouter } from './routers';

export const createContext = () => ({
  // Add context if needed
});

export const appRouter = AppRouter;

export type Context = ReturnType<typeof createContext>;

export const trpc = {
  router: AppRouter,
  middleware: () => ({}),
  createContext,
  transformer: z,
};