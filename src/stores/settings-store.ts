import { writable } from 'svelte/store';
import { DashboardSettings } from '../types/settings';

const defaultSettings: DashboardSettings = {
  theme: 'light',
  useMockData: false,
  autoRefresh: true,
  refreshInterval: 30,
  storiesPath: './stories',
};

const settingsStore = writable<DashboardSettings>(defaultSettings);

export const useSettingsStore = () => {
  return {
    subscribe: settingsStore.subscribe,
    updateSettings: (newSettings: Partial<DashboardSettings>) => {
      settingsStore.update((current) => ({ ...current, ...newSettings }));
    },
    resetSettings: () => {
      settingsStore.set(defaultSettings);
    },
  };
};
