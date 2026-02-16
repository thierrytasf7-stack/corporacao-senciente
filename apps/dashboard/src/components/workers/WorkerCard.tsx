'use client';

import { cn } from '@/lib/utils';
import { Play, Pause, Zap, Loader2 } from '@/lib/icons';
import type { WorkerInfo, WorkerId, WorkerStatus } from '@/types';
import { WORKER_CONFIG } from '@/types';
import { iconMap } from '@/lib/icons';
import { useState } from 'react';

interface WorkerCardProps {
  worker: WorkerInfo;
  onControl: (name: WorkerId, action: 'start' | 'stop' | 'trigger') => Promise<boolean>;
}

const STATUS_LABEL: Record<WorkerStatus, string> = {
  online: 'Online',
  processing: 'Processing',
  stale: 'Stale',
  offline: 'Offline',
  stopped: 'Stopped',
};

const STATUS_DOT_COLOR: Record<WorkerStatus, string> = {
  online: '#22c55e',
  processing: '#3b82f6',
  stale: '#eab308',
  offline: '#737373',
  stopped: '#ef4444',
};

function formatTimeAgo(isoStr?: string): string {
  if (!isoStr) return 'Never';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

export function WorkerCard({ worker, onControl }: WorkerCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const config = WORKER_CONFIG[worker.id];
  const IconComponent = iconMap[config.icon];
  const isRunning = worker.status === 'online' || worker.status === 'processing';

  const handleAction = async (action: 'start' | 'stop' | 'trigger') => {
    setLoading(action);
    await onControl(worker.id, action);
    setTimeout(() => setLoading(null), 2000);
  };

  return (
    <div
      className="flex flex-col border transition-luxury"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: isRunning ? 'var(--border-medium)' : 'var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {IconComponent && (
          <IconComponent
            className="h-5 w-5 flex-shrink-0"
            style={{ color: isRunning ? 'var(--accent-gold)' : 'var(--text-muted)' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {worker.name}
            </span>
            <span
              className={cn('relative flex h-2 w-2 flex-shrink-0', isRunning && 'animate-pulse')}
            >
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: STATUS_DOT_COLOR[worker.status] }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: STATUS_DOT_COLOR[worker.status] }}
              />
            </span>
          </div>
          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
            {worker.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Status</span>
          <span className="text-xs font-medium" style={{ color: STATUS_DOT_COLOR[worker.status] }}>
            {STATUS_LABEL[worker.status]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Last Heartbeat</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }} suppressHydrationWarning>
            {formatTimeAgo(worker.lastHeartbeat)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Cycles</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {worker.cycleCount || 0}
          </span>
        </div>
        {worker.pid && (
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>PID</span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {worker.pid}
            </span>
          </div>
        )}

        {/* Worker-specific stats */}
        {Object.entries(worker.stats).length > 0 && (
          <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
            {Object.entries(worker.stats).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--accent-gold)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {worker.currentTask && (
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px] block" style={{ color: 'var(--text-tertiary)' }}>Current Task</span>
            <span className="text-xs font-mono truncate block" style={{ color: 'var(--status-info)' }}>
              {worker.currentTask}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className="flex items-center gap-1 px-3 py-2 border-t mt-auto"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.15)' }}
      >
        {!isRunning ? (
          <button
            onClick={() => handleAction('start')}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-luxury hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
          >
            {loading === 'start' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Start
          </button>
        ) : (
          <button
            onClick={() => handleAction('stop')}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-luxury hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
          >
            {loading === 'stop' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pause className="h-3 w-3" />}
            Stop
          </button>
        )}
        <button
          onClick={() => handleAction('trigger')}
          disabled={loading !== null || !isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-luxury hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308' }}
        >
          {loading === 'trigger' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
          Trigger
        </button>
      </div>
    </div>
  );
}
