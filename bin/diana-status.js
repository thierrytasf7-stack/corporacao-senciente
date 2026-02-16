#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Cores simples (sem dependência externa se chalk não estiver disponível)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color] || colors.reset}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log('\n' + colorize(`╔═══════════════════════════════════════╗`, 'cyan'));
  console.log(colorize(`║ ${title.padEnd(37)} ║`, 'cyan'));
  console.log(colorize(`╚═══════════════════════════════════════╝`, 'cyan'));
}

function printTable(headers, rows) {
  const colWidths = headers.map((h, i) => {
    const headerWidth = h.length;
    const maxRowWidth = rows.reduce((max, row) => Math.max(max, String(row[i]).length), 0);
    return Math.max(headerWidth, maxRowWidth) + 2;
  });

  // Header
  console.log('┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐');
  console.log('│' + headers.map((h, i) => ` ${h.padEnd(colWidths[i] - 2)} `).join('│') + '│');
  console.log('├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤');

  // Rows
  rows.forEach((row, idx) => {
    console.log('│' + row.map((cell, i) => ` ${String(cell).padEnd(colWidths[i] - 2)} `).join('│') + '│');
    if (idx < rows.length - 1) {
      console.log('├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤');
    }
  });

  console.log('└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘');
}

async function getPM2Status() {
  try {
    const output = execSync('pm2 jlist', { encoding: 'utf8' });
    const processes = JSON.parse(output);
    return processes || [];
  } catch (error) {
    return [];
  }
}

function formatUptime(uptime) {
  if (!uptime || uptime < 0) return 'offline';
  const seconds = Math.floor(uptime / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatMemory(bytes) {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getProcessStatus(process) {
  const pm2Status = process.pm2_env?.status || 'unknown';
  if (pm2Status === 'online') {
    return colorize('✓ online', 'green');
  }
  return colorize('✗ ' + pm2Status, 'red');
}

async function showPM2Status() {
  printHeader('PM2 Processos');
  const processes = await getPM2Status();

  if (processes.length === 0) {
    console.log(colorize('Nenhum processo PM2 ativo', 'yellow'));
    return 0;
  }

  const rows = processes.map(p => [
    p.name || 'unknown',
    getProcessStatus(p),
    formatUptime(p.pm2_env?.created_at ? Date.now() - p.pm2_env.created_at : -1),
    formatMemory(p.monit?.memory || 0),
    p.pm2_env?.restart_time || 0,
  ]);

  printTable(['Processo', 'Status', 'Uptime', 'Memória', 'Restarts'], rows);

  const allOnline = processes.every(p => p.pm2_env?.status === 'online');
  return allOnline ? 0 : 1;
}

function getActivePortsInRange() {
  const portMapping = {
    21300: 'Dashboard AIOS',
    21301: 'Backend API',
    21302: 'Monitor Server',
    21303: 'Corp Frontend',
    21340: 'Binance Frontend',
    21341: 'Binance Backend',
    21350: 'WhatsApp Bridge',
    21310: 'Hive Health',
    21311: 'Hive Dashboard',
    21312: 'Hive Metrics',
  };

  const activePorts = [];

  try {
    const netOutput = execSync('netstat -ano', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = netOutput.split('\n');

    lines.forEach(line => {
      Object.keys(portMapping).forEach(port => {
        const pattern = new RegExp(`:${port}\\s+`, 'i');
        if (pattern.test(line) && line.includes('LISTENING')) {
          if (!activePorts.find(p => p.port === port)) {
            activePorts.push({
              port,
              service: portMapping[port],
              status: colorize('✓ listening', 'green'),
            });
          }
        }
      });
    });
  } catch (error) {
    // Fallback para sistemas que não têm netstat
  }

  return activePorts;
}

function showPorts() {
  printHeader('Portas Diana (21300-21399)');
  const ports = getActivePortsInRange();

  if (ports.length === 0) {
    console.log(colorize('Nenhuma porta Diana ativa no momento', 'yellow'));
    return 0;
  }

  const rows = ports.map(p => [p.port, p.service, p.status]);
  printTable(['Porta', 'Serviço', 'Status'], rows);
  return 0;
}

function getStoriesStatus() {
  const storiesDir = path.join(process.cwd(), 'docs', 'stories');
  const statuses = {
    TODO: 0,
    EM_EXECUCAO: 0,
    PARA_REVISAO: 0,
    REVISADO: 0,
    DONE: 0,
  };

  try {
    const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.md'));

    files.forEach(file => {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf8');

      if (content.includes('**Status:** DONE') || content.includes('**Status:** Done')) {
        statuses.DONE++;
      } else if (content.includes('**Status:** REVISADO') || content.includes('**Status:** Revisado')) {
        statuses.REVISADO++;
      } else if (content.includes('**Status:** PARA_REVISAO') || content.includes('**Status:** Para Revisão')) {
        statuses.PARA_REVISAO++;
      } else if (content.includes('**Status:** EM_EXECUCAO') || content.includes('**Status:** Em Execução')) {
        statuses.EM_EXECUCAO++;
      } else {
        statuses.TODO++;
      }
    });
  } catch (error) {
    // Diretório pode não existir
  }

  return statuses;
}

function showStoriesStatus() {
  printHeader('Stories Status');
  const statuses = getStoriesStatus();

  const rows = [
    ['TODO', colorize(String(statuses.TODO), 'yellow')],
    ['EM_EXECUCAO', colorize(String(statuses.EM_EXECUCAO), 'cyan')],
    ['PARA_REVISAO', colorize(String(statuses.PARA_REVISAO), 'cyan')],
    ['REVISADO', colorize(String(statuses.REVISADO), 'yellow')],
    ['DONE', colorize(String(statuses.DONE), 'green')],
  ];

  printTable(['Status', 'Contagem'], rows);
  return 0;
}

function getDiskUsage() {
  try {
    // Comando mais rápido - apenas tamanho dos principais diretórios
    const output = execSync('powershell -NoProfile -Command "$size = (Get-ChildItem -Path . -Include node_modules,apps,modules,workers,.aios-core -Recurse -Directory -Depth 1 -Force -ErrorAction SilentlyContinue | Get-ChildItem -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum; [Math]::Round($size / 1GB, 2)"', {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    return parseFloat(output.trim()) || 0;
  } catch (error) {
    // Fallback simples - tamanho estimado
    return -1;
  }
}

function showDiskUsage() {
  printHeader('Disco');
  const usage = getDiskUsage();

  if (usage === -1) {
    console.log(`Repo (principais diretórios): ${colorize('N/A', 'yellow')}`);
  } else {
    console.log(`Repo (principais diretórios): ${colorize(usage.toFixed(2) + ' GB', usage > 5 ? 'yellow' : 'green')}`);
  }
  return 0;
}

function showMemoryUsage() {
  printHeader('Memória do Sistema');
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usagePercent = ((usedMem / totalMem) * 100).toFixed(1);

  const rows = [
    ['Total', colorize((totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB', 'cyan')],
    ['Usado', colorize((usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB', usagePercent > 80 ? 'red' : 'green')],
    ['Livre', colorize((freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB', usagePercent > 80 ? 'red' : 'green')],
    ['Uso', colorize(usagePercent + '%', usagePercent > 80 ? 'red' : 'green')],
  ];

  printTable(['Métrica', 'Valor'], rows);
  return 0;
}

async function main() {
  console.log(colorize('\n🔷 Diana Corporacao Senciente - System Status', 'bright'));
  console.log(colorize('═══════════════════════════════════════════\n', 'cyan'));

  let exitCode = 0;

  exitCode = Math.max(exitCode, await showPM2Status());
  exitCode = Math.max(exitCode, showPorts());
  exitCode = Math.max(exitCode, showStoriesStatus());
  exitCode = Math.max(exitCode, showDiskUsage());
  exitCode = Math.max(exitCode, showMemoryUsage());

  console.log(colorize('\n═══════════════════════════════════════════', 'cyan'));
  const timestamp = new Date().toLocaleString('pt-BR');
  console.log(`Timestamp: ${timestamp}\n`);

  process.exit(exitCode);
}

main().catch(error => {
  console.error(colorize('Erro: ' + error.message, 'red'));
  process.exit(1);
});
