import { type BacktestData, Trade } from '@/stores/backtestStore';

export interface BacktestResponse {
  period: string;
  performance: { date: string; value: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  trades: Trade[];
}

export interface BacktestPeriod {
  value: string;
  label: string;
}

export const BACKTEST_PERIODS: BacktestPeriod[] = [
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'last-year', label: 'Last Year' },
];

export function calculatePerformanceMetrics(
  trades: Trade[]
): {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
} {
  if (trades.length === 0) {
    return {
      totalReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
    };
  }

  // Simplified calculation for demonstration
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalReturn = (totalPnL / trades[0].entry) * 100;
  
  const sharpeRatio = totalPnL / trades.length; // Simplified
  
  const maxDrawdown = Math.min(...trades.map(t => t.pnl)) * -1;

  return {
    totalReturn,
    sharpeRatio,
    maxDrawdown,
  };
}