import { NextResponse, type NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';

const PROJECT_ROOT = path.resolve(process.cwd(), '..', '..');

const WORKER_MAP: Record<string, {
  stopFile: string;
  triggerFile: string;
  startScript: string;
}> = {
  genesis: {
    stopFile: '.stop_genesis',
    triggerFile: '.trigger_worker',
    startScript: 'scripts/start-worker-genesis.ps1',
  },
  aider: {
    stopFile: '.stop_aider',
    triggerFile: '.trigger_aider',
    startScript: 'scripts/start-worker-aider.ps1',
  },
  zero: {
    stopFile: '.stop_zero',
    triggerFile: '.trigger_revisor',
    startScript: 'scripts/start-worker-zero.ps1',
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json() as { action: string };
    const { action } = body;

    const worker = WORKER_MAP[name];
    if (!worker) {
      return NextResponse.json({ error: `Unknown worker: ${name}` }, { status: 400 });
    }

    if (!['start', 'stop', 'trigger'].includes(action)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    if (action === 'stop') {
      await fs.writeFile(path.join(PROJECT_ROOT, worker.stopFile), 'stop', 'utf-8');
      return NextResponse.json({ success: true, message: `Stop signal sent to ${name}` });
    }

    if (action === 'trigger') {
      await fs.writeFile(path.join(PROJECT_ROOT, worker.triggerFile), 'trigger_from_dashboard', 'utf-8');
      return NextResponse.json({ success: true, message: `Trigger sent to ${name}` });
    }

    if (action === 'start') {
      const scriptPath = path.join(PROJECT_ROOT, worker.startScript);
      exec(
        `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`,
        { cwd: PROJECT_ROOT }
      );
      return NextResponse.json({ success: true, message: `Starting ${name} worker` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in worker control:', error);
    return NextResponse.json({ error: 'Failed to control worker' }, { status: 500 });
  }
}
