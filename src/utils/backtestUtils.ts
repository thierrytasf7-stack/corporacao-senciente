import { type BacktestData, Trade } from '@/stores/backtestStore';
import { type BacktestResponse } from '@/types/backtest';

export function mockBacktestData(): BacktestResponse {
  return {
    period: 'last-month',
    performance: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 102 },
      { date: '2024-01-03', value: 105 },
      { date: '2024-01-04', value: 103 },
      { date: '2024-01-05', value: 108 },
    ],
    metrics: {
      totalReturn: 8.5,
      sharpeRatio: 1.2,
      maxDrawdown: -3.2,
    },
    trades: [
      {
        date: '2024-01-01',
        symbol: 'AAPL',
        type: 'long',
        entry: 150,
        exit: 155,
        pnl: 5,
      },
      {
        date: '2024-01-03',
        symbol: 'GOOGL',
        type: 'short',
        entry: 2800,
        exit: 2750,
        pnl: 50,
      },
      {
        date: '2024-01-04',
        symbol: 'MSFT',
        type: 'long',
        entry: 300,
        exit: 310,
        pnl: 10,
      },
      {
        date: '2024-01-05',
        symbol: 'TSLA',
        type: 'short',
        entry: 800,
        exit: 780,
        pnl: 20,
      },
    ],
  };
}

export function transformToBacktestData(
  response: BacktestResponse
): BacktestData {
  return {
    period: response.period,
    performance: response.performance,
    metrics: response.metrics,
    trades: response.trades,
  };
}