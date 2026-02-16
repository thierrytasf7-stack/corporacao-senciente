import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SidebarView } from '@/types';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  activeView: SidebarView;
  isMobileMenuOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveView: (view: SidebarView) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeView: 'kanban',
      isMobileMenuOpen: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setActiveView: (view) =>
        set({ activeView: view }),

      setMobileMenuOpen: (open) =>
        set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'aios-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
      }),
    }
  )
);
