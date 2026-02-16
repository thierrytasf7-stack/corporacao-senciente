'use client';

import { WorkerPanel } from '@/components/workers';
import { useWorkers } from '@/hooks/use-workers';

export default function WorkersPage() {
  const { isLoading, refresh, controlWorker } = useWorkers({ refreshInterval: 3000 });

  return (
    <WorkerPanel
      onRefresh={refresh}
      onControl={controlWorker}
      isLoading={isLoading}
      className="h-full"
    />
  );
}
