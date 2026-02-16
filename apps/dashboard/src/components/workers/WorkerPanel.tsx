'use client';

import { useWorkerStore } from '@/stores/worker-store';
import { useWorkers } from '@/hooks/use-workers';
import { WorkerCard } from '@/components/workers/WorkerCard';
import { RefreshCw, Loader2 } from '@/lib/icons';
import type { WorkerId } from '@/types';

interface WorkerPanelProps {
  onRefresh?: () => Promise<void>;
  onControl?: (name: WorkerId, action: 'start' | 'stop' | 'trigger') => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

export function WorkerPanel({ onRefresh: onRefreshProp, onControl: onControlProp, isLoading: isLoadingProp, className }: WorkerPanelProps) {
  const { workers } = useWorkerStore();
  const { refresh, controlWorker, isLoading: hookLoading } = useWorkers();

  const onRefresh = onRefreshProp ?? refresh;
  const onControl = onControlProp ?? controlWorker;
  const isLoading = isLoadingProp ?? hookLoading;
  const workerList = Object.values(workers);
  const onlineCount = workerList.filter((w) => w.status === 'online' || w.status === 'processing').length;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h1 className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>
            Workers
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {onlineCount}/{workerList.length} online — Diana Native Pipeline
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-luxury"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-tertiary)',
            backgroundColor: 'transparent',
          }}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Refresh
        </button>
      </div>

      {/* Worker Cards Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {workerList.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            onControl={onControl}
          />
        ))}
      </div>

      {/* Pipeline Flow Diagram */}
      <div className="px-6 pb-6">
        <div
          className="border px-4 py-3"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          <span className="text-[11px] font-medium block mb-2" style={{ color: 'var(--text-tertiary)' }}>
            PIPELINE FLOW
          </span>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span
              className="px-2 py-1 border"
              style={{
                borderColor: workers.genesis.status === 'online' ? 'var(--accent-gold)' : 'var(--border-subtle)',
                color: workers.genesis.status === 'online' ? 'var(--accent-gold)' : 'var(--text-muted)',
              }}
            >
              Genesis
            </span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span className="px-1.5 py-0.5" style={{ color: 'var(--text-muted)' }}>stories/</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span
              className="px-2 py-1 border"
              style={{
                borderColor: workers.aider.status === 'online' ? '#3b82f6' : 'var(--border-subtle)',
                color: workers.aider.status === 'online' ? '#3b82f6' : 'var(--text-muted)',
              }}
            >
              Aider
            </span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span
              className="px-2 py-1 border"
              style={{
                borderColor: workers.zero.status === 'online' ? '#22c55e' : 'var(--border-subtle)',
                color: workers.zero.status === 'online' ? '#22c55e' : 'var(--text-muted)',
              }}
            >
              Revisador
            </span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span className="px-1.5 py-0.5" style={{ color: 'var(--text-muted)' }}>HUMAN_REVIEW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
