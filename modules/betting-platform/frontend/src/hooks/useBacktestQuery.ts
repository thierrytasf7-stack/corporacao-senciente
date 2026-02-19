import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:21370';

export const useBacktestQuery = () => {
  return useQuery({
    queryKey: ['backtest'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/backtest?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch backtests');
      }
      return response.json();
    },
    enabled: true,
  });
};

export const useBacktestById = (id: string | null) => {
  return useQuery({
    queryKey: ['backtest', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${API_BASE_URL}/api/backtest/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch backtest');
      }
      return response.json();
    },
    enabled: !!id,
  });
};

export const useRunBacktest = () => {
  const runBacktest = async (payload: {
    strategyId: string;
    config: {
      dateRange: { start: string; end: string };
      initialBankroll: number;
      stakingStrategy: 'fixed' | 'percentage' | 'kelly';
      filters: Record<string, any>;
    };
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/backtest/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to run backtest');
    }

    return response.json();
  };

  return { runBacktest };
};