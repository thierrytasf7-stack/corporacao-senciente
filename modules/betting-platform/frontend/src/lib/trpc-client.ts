import { createTRPCReact } from '@trpc/react-query';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const trpc = createTRPCReact();

export const trpcClient = trpc.createClient({
  url: 'http://localhost:21360/trpc',
  headers() {
    return {
      'Content-Type': 'application/json',
    };
  },
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: shape.data ?? {
        message: shape.error.message,
      },
    };
  },
});