import { create } from 'zustand';
import type { WorkerId, WorkerInfo } from '@/types';

interface WorkerState {
  workers: Record<WorkerId, WorkerInfo>;
  isLoading: boolean;
  error: string | null;

  setWorkers: (workers: WorkerInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultWorker = (id: WorkerId, name: string, description: string): WorkerInfo => ({
  id,
  name,
  description,
  status: 'offline',
  stats: {},
});

export const useWorkerStore = create<WorkerState>()((set) => ({
  workers: {
    genesis: defaultWorker('genesis', 'Genesis', 'Gera stories quando backlog vazio'),
    aider: defaultWorker('aider', 'Escrivao (Aider)', 'Processa stories @aider TODO'),
    zero: defaultWorker('zero', 'Revisador (Zero)', 'Revisa output e processa @agente-zero'),
  },
  isLoading: false,
  error: null,

  setWorkers: (workersList) =>
    set((state) => {
      const updated = { ...state.workers };
      for (const w of workersList) {
        updated[w.id] = w;
      }
      return { workers: updated };
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
