import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { useBacktestStore } from '@/stores/backtestStore';
import { BacktestData } from '@/stores/backtestStore';

export function useBacktestResults() {
  const [period, setPeriod] = useState('all');
  const { data: storeData, setBacktestData, setLoading } = useBacktestStore();

  const { data, isLoading, error } = useQuery([
    'backtestResults',
    period,
  ], () => {
    setLoading(true);
    return trpc.backtest.getResults.query(period);
  }, {
    enabled: !!period,
    onSuccess: (data) => {
      setBacktestData(data);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  return {
    period,
    setPeriod,
    backtestData: data || storeData,
    isLoading,
    error,
  };
}

export function mockBacktestData(): BacktestData {
  return {
    period: 'all',
    performance: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 102 },
      { date: '2024-01-03', value: 101 },
      { date: '2024-01-04', value: 105 },
      { date: '2024-01-05', value: 108 },
      { date: '2024-01-06', value: 110 },
      { date: '2024-01-07', value: 115 },
      { date: '2024-01-08', value: 118 },
      { date: '2024-01-09', value: 120 },
      { date: '2024-01-10', value: 125 },
    ],
    metrics: {
      totalReturn: 25.0,
      sharpeRatio: 1.85,
      maxDrawdown: -5.2,
    },
    trades: [
      {
        date: '2024-01-01',
        symbol: 'AAPL',
        type: 'BUY',
        entry: 150.0,
        exit: 155.0,
        pnl: 5.0,
      },
      {
        date: '2024-01-03',
        symbol: 'GOOGL',
        type: 'SELL',
        entry: 2800.0,
        exit: 2750.0,
        pnl: -50.0,
      },
      {
        date: '2024-01-05',
        symbol: 'MSFT',
        type: 'BUY',
        entry: 300.0,
        exit: 310.0,
        pnl: 10.0,
      },
      {
        date: '2024-01-07',
        symbol: 'TSLA',
        type: 'SELL',
        entry: 800.0,
        exit: 780.0,
        pnl: -20.0,
      },
      {
        date: '2024-01-09',
        symbol: 'AMZN',
        type: 'BUY',
        entry: 3400.0,
        exit: 3450.0,
        pnl: 50.0,
      },
    ],
  };
}

export function useMockBacktestResults() {
  const [period, setPeriod] = useState('all');
  const { data: storeData } = useBacktestStore();

  const backtestData = storeData || mockBacktestData();

  return {
    period,
    setPeriod,
    backtestData,
    isLoading: false,
    error: null,
  };
}