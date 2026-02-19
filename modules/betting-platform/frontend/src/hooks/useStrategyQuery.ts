import { useQuery } from '@tanstack/react-query';

export const useStrategyQuery = () => {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const response = await fetch('/api/strategies');
      if (!response.ok) {
        throw new Error('Failed to fetch strategies');
      }
      return response.json();
    },
    enabled: true,
  });
};