import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useReportsStore } from '@/stores/reportsStore';
import {
  ReportSummary,
  PerformanceByStrategy,
  MonthlyPnL,
  DateRange,
} from '@/types/reports';

export const useReportsData = () => {
  const { selectedDateRange } = useReportsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceByStrategy[]>([]);
  const [monthlyPnL, setMonthlyPnL] = useState<MonthlyPnL[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const dateRange: DateRange = {
          start: selectedDateRange.start.toISOString(),
          end: selectedDateRange.end.toISOString(),
        };

        const summaryQuery = trpc.reports.getSummary.useQuery(
          { dateRange },
          { enabled: false }
        );
        const performanceQuery = trpc.reports.getPerformance.useQuery(
          { dateRange },
          { enabled: false }
        );
        const monthlyPnLQuery = trpc.reports.getMonthlyPnL.useQuery(
          { dateRange },
          { enabled: false }
        );

        await Promise.all([
          summaryQuery.refetch(),
          performanceQuery.refetch(),
          monthlyPnLQuery.refetch(),
        ]);

        if (summaryQuery.isSuccess) {
          setSummary(summaryQuery.data);
        }
        if (performanceQuery.isSuccess) {
          setPerformance(performanceQuery.data);
        }
        if (monthlyPnLQuery.isSuccess) {
          setMonthlyPnL(monthlyPnLQuery.data);
        }

        if (summaryQuery.isError || performanceQuery.isError || monthlyPnLQuery.isError) {
          setError('Failed to fetch reports data');
        }
      } catch (err) {
        setError('Unexpected error fetching reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [selectedDateRange]);

  return {
    isLoading,
    error,
    summary,
    performance,
    monthlyPnL,
  };
};