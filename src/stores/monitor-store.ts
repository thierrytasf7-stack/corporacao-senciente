import { writable } from 'svelte/store';
import { MonitorEvent } from '../types/monitor-events';

interface MonitorState {
  events: MonitorEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: MonitorState = {
  events: [],
  loading: false,
  error: null,
};

const monitorStore = writable<MonitorState>(initialState);

export const useMonitorStore = () => {
  return {
    subscribe: monitorStore.subscribe,
    getEvents: async () => {
      const state = monitorStore.get();
      if (state.events.length > 0) {
        return state.events;
      }

      try {
        monitorStore.update((current) => ({ ...current, loading: true, error: null }));
        // Simulação de busca de eventos
        const fetchedEvents = await fetchMockEvents();
        monitorStore.update((current) => ({ ...current, events: fetchedEvents, loading: false }));
        return fetchedEvents;
      } catch (err) {
        monitorStore.update((current) => ({ ...current, error: err instanceof Error ? err.message : 'Erro ao carregar eventos', loading: false }));
        throw err;
      }
    },
    clearEvents: () => {
      monitorStore.update((current) => ({ ...current, events: [] }));
    },
  };
};

async function fetchMockEvents(): Promise<MonitorEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          type: 'status:update',
          timestamp: new Date().toISOString(),
          data: { component: 'Agent 1', status: 'running' },
        },
        {
          id: '2',
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
          data: { component: 'Agent 2', lastHeartbeat: new Date().toISOString() },
        },
      ]);
    }, 1000);
  });
}
