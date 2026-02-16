import { type QueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useBacktestStore } from '@/stores/backtestStore';

export function setupBacktestQueries(queryClient: QueryClient) {
  queryClient.setDefaultOptions({
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  });

  // Example of how to integrate with tRPC
  // trpc.backtest.getResults.useQuery({ period: 'last-month' });
}

// Custom hook for backtest data
export function useBacktestResults(period: string) {
  const { data, isLoading, error } = trpc.backtest.getResults.useQuery({ period });
  
  return {
    data,
    isLoading,
    error,
  };
}