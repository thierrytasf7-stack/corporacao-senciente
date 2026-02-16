import { useQuery } from '@tanstack/react-query';

export const useBacktestQuery = () => {
  return useQuery({
    queryKey: ['backtest'],
    queryFn: async () => {
      // Mock data - in real implementation this would fetch from backend
      return {
        success: true,
        data: {
          performance: [],
          metrics: {
            totalReturn: 15.2,
            sharpeRatio: 1.85,
            maxDrawdown: -8.5,
          },
          trades: [],
        },
      };
    },
    enabled: false, // Disable by default, enable when needed
  });
};