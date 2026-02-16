import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpcClient } from './trpc'';

export const TRPCProvider: React.FC = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 60 * 1000,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <trpcClient.Provider value={trpcClient}>
        {children}
      </trpcClient.Provider>
    </QueryClientProvider>
  );
};

export default TRPCProvider;