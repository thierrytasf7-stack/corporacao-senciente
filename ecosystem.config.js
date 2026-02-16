// ============================================================================
// DIANA CORPORAÇÃO SENCIENTE - PM2 Ecosystem Config
// ============================================================================
// Single source of truth para todos os processos do sistema.
// Portas centralizadas via .env.ports (faixa 21300-21399).
//
// Uso:
//   pm2 start ecosystem.config.js       # Inicia tudo
//   pm2 restart all                     # Reinicia tudo
//   pm2 status                          # Status dos processos
//   pm2 logs                            # Logs em tempo real
//
// PROCESSOS:
//   WORKERS  - Processos background (agent-zero, maestro)
//   SERVERS  - Servidores HTTP/WS (backend, frontend, dashboard, binance, whatsapp, monitor)
// ============================================================================

const ROOT = 'C:/Users/User/Desktop/Diana-Corporacao-Senciente';

module.exports = {
  apps: [
    // =====================================================================
    // WORKERS - Processos background via PowerShell (pm2-wrapper.js)
    // =====================================================================

    // DISABLED (Feb 14, 2026): Guardian Hive obsoleto - não usado mais
    // {
    //   name: 'guardian-hive',
    //   namespace: 'WORKERS',
    //   script: 'scripts/pm2-wrapper.js',
    //   args: `${ROOT}/scripts/hive-guardian-shim.ps1`,
    //   cwd: ROOT,
    //   instances: 1,
    //   autorestart: true,
    //   env: {
    //     DIANA_HIVE_HEALTH_PORT: 21310,
    //     DIANA_HIVE_DASHBOARD_PORT: 21311,
    //     DIANA_HIVE_METRICS_PORT: 21312
    //   }
    // },

    {
      // Agent Zero: Engine de delegação com modelos free (OpenRouter)
      // Daemon mode: processa queue/ automaticamente
      name: 'agent-zero',
      namespace: 'WORKERS',
      script: 'scripts/pm2-wrapper.js',
      args: `${ROOT}/workers/agent-zero/Start-AgentZero.ps1`,
      cwd: ROOT,
      instances: 1,
      autorestart: true
    },
    {
      // Maestro: Orquestrador principal da Corporação Senciente
      name: 'maestro',
      namespace: 'WORKERS',
      script: 'scripts/pm2-wrapper.js',
      args: `${ROOT}/scripts/Start-CorporacaoSenciente.ps1`,
      cwd: ROOT,
      instances: 1,
      autorestart: true
    },
    // WORKERS REMOVIDOS - Agora rodam via Start-Evolucao.bat (sessão isolada)
    // Genesis, Trabalhador, Revisador executam em terminal separado

    // =====================================================================
    // SERVERS - Apps e APIs principais
    // =====================================================================
    {
      name: 'corp-backend',
      namespace: 'SERVERS',
      script: 'apps/backend/server.js',
      cwd: ROOT,
      instances: 1,
      autorestart: true,
      env: {
        PORT: 21301,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'dashboard-ui',
      namespace: 'SERVERS',
      script: 'node_modules/.bin/next',
      args: 'start -p 21300',
      cwd: `${ROOT}/apps/dashboard`,
      instances: 1,
      autorestart: true,
      env: {
        PORT: 21300,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'monitor-server',
      namespace: 'SERVERS',
      script: 'apps/monitor-server/server/server.ts',
      cwd: ROOT,
      instances: 1,
      autorestart: true,
      interpreter: 'C:/Users/User/.bun/bin/bun.exe',
      env: {
        PORT: 21302
      }
    },
    {
      name: 'binance-backend',
      namespace: 'SERVERS',
      script: 'scripts/pm2-wrapper.js',
      args: `${ROOT}/modules/binance-bot/backend/start-backend.ps1`,
      cwd: ROOT,
      instances: 1,
      autorestart: true,
      env: {
        PORT: 21341,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'binance-frontend',
      namespace: 'SERVERS',
      script: 'scripts/pm2-wrapper.js',
      args: `${ROOT}/modules/binance-bot/frontend/start-frontend.ps1`,
      cwd: ROOT,
      instances: 1,
      autorestart: true,
      env: {
        PORT: 21340
      }
    },
    {
      name: 'whatsapp-bridge',
      namespace: 'SERVERS',
      script: 'apps/backend/integrations/whatsapp/index.js',
      cwd: ROOT,
      instances: 1,
      autorestart: true,
      env: {
        PORT: 21350
      }
    }
  ]
};