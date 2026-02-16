import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import type { AgentId, TerminalStatus } from '@/types';

interface PM2Process {
  name: string;
  pm_id: number;
  pm2_env: {
    status: string;
    pm_uptime: number;
    exec_mode: string;
    restart_time: number;
    pm_cwd: string;
    script_path?: string;
    pm_exec_path?: string;
  };
  monit: {
    memory: number;
    cpu: number;
  };
}

function mapPm2NameToAgent(name: string): AgentId {
  const lower = name.toLowerCase();
  if (lower.includes('guardian') || lower.includes('hive')) return 'devops';
  if (lower.includes('dashboard') || lower.includes('ui')) return 'architect';
  if (lower.includes('monitor')) return 'qa';
  if (lower.includes('agent-zero') || lower.includes('zero')) return 'analyst';
  if (lower.includes('aider')) return 'dev';
  if (lower.includes('maestro') || lower.includes('corporacao')) return 'pm';
  if (lower.includes('binance') || lower.includes('bot')) return 'dev';
  if (lower.includes('genesis')) return 'po';
  return 'dev';
}

function mapPm2Status(status: string): TerminalStatus {
  switch (status) {
    case 'online':
      return 'running';
    case 'stopping':
    case 'stopped':
    case 'launching':
      return 'idle';
    case 'errored':
      return 'error';
    default:
      return 'idle';
  }
}

function formatMemory(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUptime(uptimeMs: number): string {
  const now = Date.now();
  const diff = now - uptimeMs;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export async function GET() {
  try {
    let pm2Output: string;
    try {
      pm2Output = execSync('pm2 jlist', { encoding: 'utf-8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch {
      return NextResponse.json({
        terminals: [],
        source: 'pm2_unavailable',
        message: 'PM2 nao esta rodando ou nao esta instalado. Execute `pm2 start ecosystem.config.js` para iniciar.',
      });
    }

    let processes: PM2Process[];
    try {
      // PM2 may output extra text before JSON - extract the JSON array
      const jsonStart = pm2Output.indexOf('[');
      const jsonStr = jsonStart >= 0 ? pm2Output.slice(jsonStart) : pm2Output;
      processes = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({
        terminals: [],
        source: 'pm2_parse_error',
        message: 'Erro ao parsear saida do PM2.',
      });
    }

    if (!Array.isArray(processes) || processes.length === 0) {
      return NextResponse.json({
        terminals: [],
        source: 'pm2_empty',
        message: 'Nenhum processo PM2 ativo.',
      });
    }

    const terminals = processes.map((proc) => {
      const env = proc.pm2_env || {};
      const monit = proc.monit || { memory: 0, cpu: 0 };
      const memory = formatMemory(monit.memory);
      const uptime = env.pm_uptime ? formatUptime(env.pm_uptime) : 'N/A';
      const scriptPath = env.pm_exec_path || env.script_path || '';

      return {
        id: `pm2-${proc.pm_id}`,
        agentId: mapPm2NameToAgent(proc.name),
        name: `${proc.name} [${memory} | ${uptime}]`,
        model: 'PM2 Process',
        apiType: env.exec_mode || 'fork_mode',
        workingDirectory: env.pm_cwd || '',
        status: mapPm2Status(env.status),
        currentCommand: scriptPath,
        storyId: undefined,
        _extra: {
          pm2Id: proc.pm_id,
          pm2Status: env.status,
          memory: monit.memory,
          memoryFormatted: memory,
          cpu: monit.cpu,
          uptime,
          restarts: env.restart_time || 0,
        },
      };
    });

    return NextResponse.json({
      terminals,
      source: 'pm2',
      count: terminals.length,
    });
  } catch (error) {
    console.error('Error in /api/terminals:', error);
    return NextResponse.json(
      {
        terminals: [],
        source: 'error',
        error: 'Falha ao buscar processos PM2',
      },
      { status: 500 }
    );
  }
}
