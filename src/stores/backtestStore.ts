import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BacktestData {
  period: string;
  performance: { date: string; value: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  trades: Trade[];
}

interface Trade {
  date: string;
  symbol: string;
  type: 'long' | 'short';
  entry: number;
  exit: number;
  pnl: number;
}

interface BacktestStore {
  backtestData: BacktestData | null;
  setBacktestData: (data: BacktestData) => void;
  setPeriod: (period: string) => void;
  period: string;
}

export const useBacktestStore = create<BacktestStore>()(
  persist(
    (set) => ({
      backtestData: null,
      period: '1m',
      setBacktestData: (data: BacktestData) => set({ backtestData: data }),
      setPeriod: (period: string) => set({ period }),
    }),
    {
      name: 'backtest-storage',
    }
  )
);

export type { BacktestData, Trade };