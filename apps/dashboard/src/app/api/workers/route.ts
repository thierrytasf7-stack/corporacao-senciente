import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { WorkerId, WorkerStatus, WorkerInfo } from '@/types';

const HEARTBEAT_DIR = 'C:/AIOS/workers';
const PROJECT_ROOT = path.resolve(process.cwd(), '..', '..');

const WORKER_DEFS: Record<WorkerId, { name: string; description: string; lockFile: string }> = {
  genesis: {
    name: 'Genesis',
    description: 'Gera stories quando backlog vazio',
    lockFile: '.worker_genesis.lock',
  },
  aider: {
    name: 'Escrivao (Aider)',
    description: 'Processa stories @aider TODO',
    lockFile: '.worker_aider.lock',
  },
  zero: {
    name: 'Revisador (Zero)',
    description: 'Revisa output e processa @agente-zero',
    lockFile: '.worker_revisor.lock',
  },
};

function determineStatus(heartbeat: Record<string, unknown> | null, hasLock: boolean): WorkerStatus {
  if (!heartbeat) return 'offline';

  const lastBeat = heartbeat.last_heartbeat as string | undefined;
  if (!lastBeat) return 'offline';

  const hbStatus = heartbeat.status as string;
  if (hbStatus === 'stopped') return 'stopped';

  const elapsed = (Date.now() - new Date(lastBeat).getTime()) / 1000;
  if (elapsed > 120) return 'offline';
  if (hasLock) return 'processing';
  if (elapsed > 30) return 'stale';
  if (hbStatus === 'error') return 'stale';
  return 'online';
}

export async function GET() {
  try {
    const workers: WorkerInfo[] = [];

    for (const [id, def] of Object.entries(WORKER_DEFS) as [WorkerId, typeof WORKER_DEFS[WorkerId]][]) {
      let heartbeat: Record<string, unknown> | null = null;

      // Read heartbeat file
      try {
        const hbPath = path.join(HEARTBEAT_DIR, `${id}.json`);
        const raw = await fs.readFile(hbPath, 'utf-8');
        // Strip BOM that PowerShell may add
        const content = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
        heartbeat = JSON.parse(content);
      } catch {
        // File doesn't exist or can't be parsed
      }

      // Check lock file
      let hasLock = false;
      try {
        await fs.access(path.join(PROJECT_ROOT, def.lockFile));
        hasLock = true;
      } catch {
        // No lock
      }

      const status = determineStatus(heartbeat, hasLock);

      workers.push({
        id,
        name: def.name,
        description: def.description,
        status,
        pid: (heartbeat?.pid as number) || undefined,
        lastHeartbeat: (heartbeat?.last_heartbeat as string) || undefined,
        cycleCount: (heartbeat?.cycle_count as number) || 0,
        currentTask: hasLock ? 'Processing...' : undefined,
        stats: (heartbeat?.stats as Record<string, number>) || {},
      });
    }

    return NextResponse.json({ workers, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error in /api/workers:', error);
    return NextResponse.json(
      { workers: [], error: 'Failed to read worker status' },
      { status: 500 }
    );
  }
}
