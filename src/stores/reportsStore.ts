import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReportsApi } from '@/lib/trpc';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ReportData {
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  bestDay: string;
  performanceByStrategy: Array<{
    strategy: string;
    profit: number;
  }>;
  monthlyPnL: Array<{
    month: string;
    profit: number;
    trades: number;
  }>;
}

interface ReportsState {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  loading: boolean;
  error: string | null;
  data: ReportData | null;
  fetchReports: () => Promise<void>;
  clear: () => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      setStartDate: (date: string) => set({ startDate: date }),
      setEndDate: (date: string) => set({ endDate: date }),
      loading: false,
      error: null,
      data: null,
      fetchReports: async () => {
        const { startDate, endDate } = get();
        set({ loading: true, error: null });
        try {
          const data = await ReportsApi.getReports.query({ startDate, endDate });
          set({ data, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch reports', loading: false });
        }
      },
      clear: () => set({ data: null, error: null, loading: false }),
    }),
    {
      name: 'reports-storage',
    }
  )
);

export const useReportsQuery = () => {
  const queryClient = useQueryClient();
  const { startDate, endDate } = useReportsStore.getState();
  
  return useQuery({
    queryKey: ['reports', startDate, endDate],
    queryFn: () => ReportsApi.getReports.query({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
    onSuccess: (data) => {
      queryClient.setQueryData(['reports', startDate, endDate], data);
    },
  });
};

export type { ReportData };