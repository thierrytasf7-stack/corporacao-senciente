import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StrategyConfig {
  name: string;
  riskLevel: number;
  maxPositions: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

interface StrategyStore {
  strategy: StrategyConfig | null;
  setStrategy: (config: StrategyConfig) => void;
  clearStrategy: () => void;
}

export const useStrategyStore = create<StrategyStore>()(
  persist(
    (set) => ({
      strategy: null,
      setStrategy: (config: StrategyConfig) => set({ strategy: config }),
      clearStrategy: () => set({ strategy: null }),
    }),
    {
      name: 'strategy-config',
      partialize: (state) => ({ strategy: state.strategy }),
    }
  )
);

export type { StrategyConfig };