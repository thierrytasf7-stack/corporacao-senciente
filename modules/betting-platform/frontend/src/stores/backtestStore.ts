import { create } from 'zustand';

interface BacktestStore {
  period: '7d' | '30d' | '90d' | 'all';
  setPeriod: (period: '7d' | '30d' | '90d' | 'all') => void;
}

export const useBacktestStore = create<BacktestStore>((set) => ({
  period: '30d',
  setPeriod: (period) => set({ period }),
}));