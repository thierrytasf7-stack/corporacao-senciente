import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useReportsStore } from '@/stores/reportsStore';
import {
  ReportSummary,
  StrategyPerformance,
  MonthlyPnL,
} from '@/stores/reportsStore';

export interface ReportsData {
  summary: ReportSummary;
  strategies: StrategyPerformance[];
  monthlyPnL: MonthlyPnL[];
}

export const useReports = () => {
  const { startDate, endDate } = useReportsStore();
  const queryClient = useQueryClient();

  const { data: reportsData, isLoading, error } = useQuery([
    'reports',
    startDate,
    endDate,
  ], async () => {
    if (!startDate || !endDate) {
      throw new Error('Please select a date range');
    }

    const response = await trpc.reports.getReports.query({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return response;
  });

  const refreshReports = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };

  return {
    reportsData,
    isLoading,
    error,
    refreshReports,
  };
};

export const useExportReports = () => {
  const { startDate, endDate } = useReportsStore();

  const exportToCSV = async () => {
    if (!startDate || !endDate) {
      throw new Error('Please select a date range');
    }

    const response = await trpc.reports.exportCSV.query({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const blob = new Blob([response], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    if (!startDate || !endDate) {
      throw new Error('Please select a date range');
    }

    const response = await trpc.reports.exportPDF.query({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const blob = new Blob([response], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    exportToCSV,
    exportToPDF,
  };
};