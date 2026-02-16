import { create } from 'zustand'';

interface UIStore {
  isDarkMode: boolean;
  isLoading: boolean;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDarkMode: false,
  isLoading: false,
  toggleDarkMode: () => set((state) => ({
    isDarkMode: !state.isDarkMode,
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));