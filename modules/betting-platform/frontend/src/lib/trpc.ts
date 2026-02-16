import { createTRPCReact } from '@trpc/react-query';
import { initTRPC } from '@trpc/server';

export const trpc = createTRPCReact();

export const api = trpc.router({
  // Define your tRPC procedures here
  // Example: 
  // hello: trpc.procedure.query(() => 'Hello World!')
});

export const trpcClient = trpc.createClient({
  url: 'http://localhost:21360',
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 60 * 1000,
      },
    },
  },
  transformer: 'none',
  errorFormatter: (error) => ({
    message: error.message,
    data: error.data,
  }),
});