import { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { useWorkerStore } from '@/stores/worker-store';
import type { WorkerInfo, WorkerId } from '@/types';

interface WorkersResponse {
  workers: WorkerInfo[];
  timestamp: string;
  error?: string;
}

const fetcher = async (url: string): Promise<WorkersResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
};

interface UseWorkersOptions {
  refreshInterval?: number;
}

interface UseWorkersReturn {
  isLoading: boolean;
  isError: boolean;
  error: string | undefined;
  refresh: () => Promise<void>;
  controlWorker: (name: WorkerId, action: 'start' | 'stop' | 'trigger') => Promise<boolean>;
}

export function useWorkers(options: UseWorkersOptions = {}): UseWorkersReturn {
  const { refreshInterval = 3000 } = options;
  const { setWorkers, setLoading, setError } = useWorkerStore();

  const { data, error, isLoading, mutate } = useSWR<WorkersResponse>(
    '/api/workers',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError(error.message);
    } else if (data?.workers) {
      setWorkers(data.workers);
      setError(null);
    }
  }, [data, error, isLoading, setWorkers, setLoading, setError]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await mutate();
    } finally {
      setLoading(false);
    }
  }, [mutate, setLoading]);

  const controlWorker = useCallback(async (name: WorkerId, action: 'start' | 'stop' | 'trigger'): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workers/${name}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return false;
      // Refresh status after control action
      setTimeout(() => mutate(), 1000);
      return true;
    } catch {
      return false;
    }
  }, [mutate]);

  return {
    isLoading,
    isError: !!error,
    error: error?.message,
    refresh,
    controlWorker,
  };
}
