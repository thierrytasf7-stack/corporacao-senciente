import { trpc } from '../lib/trpc-client'';

export const useExampleQuery = (id: string) =>
  trpc.example.query.useQuery({ id });

export const useExampleMutation = () =>
  trpc.example.mutation.useMutation();