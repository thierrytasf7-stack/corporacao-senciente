import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { useReportsStore } from '@/stores/reportsStore';

export interface ReportData {
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  bestDay: {
    date: string;
    profit: number;
  };
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

export function useReports() {
  const { startDate, endDate } = useReportsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!startDate || !endDate) {
      setIsLoading(false);
      return;
    }

    const fetchReports = async () =u003e {
      try {
        const result = await trpc.reports.getReports.mutateAsync({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [startDate, endDate, queryClient]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setData(null);
      setError(null);
    },
  };
}

export function useExportReports() {
  const exportToCSV = async () =u003e {
    const { data } = useReports();
    if (!data) return;

    const csv = [
      'Total Trades,Win Rate %,Average Profit,Best Day,Best Day Profit\n',
      `${data.totalTrades},${data.winRate},${data.averageProfit},${data.bestDay.date},${data.bestDay.profit}`,
    ].join('');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () =u003e {
    // PDF export implementation would go here
    console.log('PDF export not implemented');
  };

  return { exportToCSV, exportToPDF };
}