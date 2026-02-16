import { create } from 'zustand';

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface StrategyStore {
  strategies: Strategy[];
  selectedStrategy: Strategy | null;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (id: string, updates: Partial<Strategy>) => void;
  selectStrategy: (strategy: Strategy | null) => void;
}

export const useStrategyStore = create<StrategyStore>((set) => ({
  strategies: [],
  selectedStrategy: null,
  addStrategy: (strategy) => set((state) => ({
    strategies: [...state.strategies, strategy],
  })),
  updateStrategy: (id, updates) => set((state) => ({
    strategies: state.strategies.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    ),
  })),
  selectStrategy: (strategy) => set({ selectedStrategy: strategy }),
}));