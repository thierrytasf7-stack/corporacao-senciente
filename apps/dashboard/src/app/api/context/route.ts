import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Project root is 2 levels up from apps/dashboard
const PROJECT_ROOT = path.resolve(process.cwd(), '..', '..');

interface FileEntry {
  relativePath: string;
  type: 'rules' | 'agent' | 'config' | 'docs';
  description: string;
}

const RULE_FILES: FileEntry[] = [
  {
    relativePath: '.claude/rules/mcp-usage.md',
    type: 'rules',
    description: 'MCP server usage guidelines',
  },
];

const AGENT_FILES: FileEntry[] = [
  {
    relativePath: '.aios-core/development/agents/dev.md',
    type: 'agent',
    description: 'Developer agent persona and workflows',
  },
  {
    relativePath: '.aios-core/development/agents/qa.md',
    type: 'agent',
    description: 'QA agent testing protocols',
  },
  {
    relativePath: '.aios-core/development/agents/aios-master.md',
    type: 'agent',
    description: 'AIOS master orchestrator',
  },
  {
    relativePath: '.aios-core/development/agents/architect.md',
    type: 'agent',
    description: 'Architect agent design patterns',
  },
];

const CONFIG_FILES: FileEntry[] = [
  {
    relativePath: 'CLAUDE.md',
    type: 'config',
    description: 'Main project rules and instructions',
  },
  {
    relativePath: '.claude/CLAUDE.md',
    type: 'config',
    description: 'Claude Code configuration',
  },
  {
    relativePath: '.aios-core/core-config.yaml',
    type: 'config',
    description: 'AIOS framework configuration',
  },
  {
    relativePath: '.env.ports',
    type: 'config',
    description: 'Port registry for Diana services',
  },
];

// MCP descriptions (safe metadata only, no tokens/secrets)
const MCP_DESCRIPTIONS: Record<string, { tools: number; description: string }> = {
  context7: { tools: 2, description: 'Library documentation lookup' },
  'sequential-thinking': { tools: 1, description: 'Complex task decomposition' },
  memory: { tools: 4, description: 'Persistent memory across sessions' },
  filesystem: { tools: 11, description: 'Local filesystem access' },
  postgres: { tools: 5, description: 'PostgreSQL database access' },
  github: { tools: 15, description: 'GitHub API integration' },
  sentry: { tools: 3, description: 'Error tracking and monitoring' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

async function readFileInfo(entry: FileEntry, idPrefix: string, index: number) {
  const fullPath = path.join(PROJECT_ROOT, entry.relativePath);
  try {
    const fileStat = await stat(fullPath);
    return {
      id: `${idPrefix}-${String(index + 1).padStart(3, '0')}`,
      name: path.basename(entry.relativePath),
      path: entry.relativePath,
      type: entry.type,
      description: entry.description,
      lastModified: fileStat.mtime.toISOString(),
      size: formatFileSize(fileStat.size),
    };
  } catch {
    return null;
  }
}

function readMcpServers(): { id: string; name: string; status: 'active' | 'inactive' | 'error'; tools: number; description: string }[] {
  const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
  try {
    // Read synchronously since we need the result immediately
    const raw = require('fs').readFileSync(settingsPath, 'utf-8');
    const settings = JSON.parse(raw);
    const mcpServers = settings.mcpServers || {};

    return Object.keys(mcpServers).map((name, index) => {
      const meta = MCP_DESCRIPTIONS[name] || { tools: 0, description: `MCP server: ${name}` };
      return {
        id: `mcp-${String(index + 1).padStart(3, '0')}`,
        name,
        status: 'active' as const,
        tools: meta.tools,
        description: meta.description,
      };
    });
  } catch {
    return [];
  }
}

function getRecentFiles(): string[] {
  try {
    const output = execSync('git log --name-only --pretty=format: -n 20', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 5000,
    });
    const files = output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    // Deduplicate and take first 30
    const unique = [...new Set(files)];
    return unique.slice(0, 30);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // Read all file categories in parallel
    const [activeRules, agentDefinitions, configFiles] = await Promise.all([
      Promise.all(RULE_FILES.map((f, i) => readFileInfo(f, 'rule', i))),
      Promise.all(AGENT_FILES.map((f, i) => readFileInfo(f, 'agent', i))),
      Promise.all(CONFIG_FILES.map((f, i) => readFileInfo(f, 'config', i))),
    ]);

    const mcpServers = readMcpServers();
    const recentFiles = getRecentFiles();

    return NextResponse.json({
      projectName: 'Diana Corporacao Senciente',
      projectPath: PROJECT_ROOT,
      claudeMdPath: 'CLAUDE.md',
      activeRules: activeRules.filter(Boolean),
      agentDefinitions: agentDefinitions.filter(Boolean),
      configFiles: configFiles.filter(Boolean),
      mcpServers,
      recentFiles,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to read context: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
