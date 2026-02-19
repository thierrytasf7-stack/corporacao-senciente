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
//
// NOTA: Frontends vite usam `node node_modules/vite/bin/vite.js` diretamente
//       (npm.cmd não funciona de forma confiável no PM2 Windows)
// ============================================================================

const ROOT = 'C:/Users/User/Desktop/Diana-Corporacao-Senciente';

module.exports = {
  apps: [
    // =====================================================================
    // WORKERS - Processos background via PowerShell (pm2-wrapper.js)
    // =====================================================================

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
    {
      // Testnet Arena: Loop de simulação de bots de aposta
      name: 'betting-testnet-worker',
      namespace: 'WORKERS',
      script: 'node_modules/.bin/ts-node',
      args: 'src/scripts/testnet-simulation.ts',
      cwd: `${ROOT}/modules/betting-platform/backend`,
      instances: 1,
      autorestart: false,
      max_restarts: 3,
      restart_delay: 60000, // Loop a cada 60s (Demo)
      env: {
        NODE_ENV: 'development'
      }
    },

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
      // Corp Frontend (Vite preview) - porta 21303
      // Requer build: cd apps/frontend && npm run build
      name: 'corp-frontend',
      namespace: 'SERVERS',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 21303 --host',
      cwd: `${ROOT}/apps/frontend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      env: {
        PORT: 21303,
        DIANA_BACKEND_PORT: 21301
      }
    },
    {
      // Dashboard Next.js - porta 21300
      // Requer build: cd apps/dashboard && npm run build
      name: 'dashboard-ui',
      namespace: 'SERVERS',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 21300',
      cwd: `${ROOT}/apps/dashboard`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 3000,
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
      // Binance Backend - porta 21341
      // Usa dist/real-server.js (compilado com: npm run build)
      name: 'binance-backend',
      namespace: 'SERVERS',
      script: 'dist/real-server.js',
      cwd: `${ROOT}/modules/binance-bot/backend`,
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 5000,
      env: {
        PORT: 21341,
        NODE_ENV: 'production'
      }
    },
    {
      // Binance Frontend (Vite preview) - porta 21340
      // Requer build: cd modules/binance-bot/frontend && npm run build
      name: 'binance-frontend',
      namespace: 'SERVERS',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 21340 --host',
      cwd: `${ROOT}/modules/binance-bot/frontend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      env: {
        PORT: 21340,
        DIANA_BINANCE_FRONTEND_PORT: 21340,
        DIANA_BINANCE_BACKEND_PORT: 21341
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
    },
    {
      // Betting Backend (Backtest API) - porta 21370
      // Usa backtest-api.js (puro JS, sem compilação)
      name: 'betting-backend',
      namespace: 'SERVERS',
      script: 'backtest-api.js',
      cwd: `${ROOT}/modules/betting-platform/backend`,
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      env: {
        PORT: 21370,
        NODE_ENV: 'production'
      }
    },
    {
      // DNA Arena V2 - Evolucao Genetica
      name: 'binance-dna-arena',
      namespace: 'WORKERS',
      script: 'dist/services/DNAArenaV2Engine.js',
      cwd: `${ROOT}/modules/binance-bot/backend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      // Executor Isolado: Testnet Futures - porta 21342
      name: 'binance-testnet-futures',
      namespace: 'SERVERS',
      script: 'dist/server-executor.js',
      cwd: `${ROOT}/modules/binance-bot/backend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 5000,
      env: {
        PORT: 21342,
        DIANA_BINANCE_BACKEND_PORT: 21342,
        BINANCE_USE_TESTNET: 'true',
        TRADING_TYPE: 'FUTURES',
        NODE_ENV: 'production'
      }
    },
    {
      // Executor Isolado: Testnet Spot - porta 21343
      name: 'binance-testnet-spot',
      namespace: 'SERVERS',
      script: 'dist/server-executor.js',
      cwd: `${ROOT}/modules/binance-bot/backend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 5000,
      env: {
        PORT: 21343,
        DIANA_BINANCE_BACKEND_PORT: 21343,
        BINANCE_USE_TESTNET: 'true',
        TRADING_TYPE: 'SPOT',
        NODE_ENV: 'production'
      }
    },
    {
      // Executor Isolado: Mainnet Futures - porta 21344
      name: 'binance-mainnet-futures',
      namespace: 'SERVERS',
      script: 'dist/server-executor.js',
      cwd: `${ROOT}/modules/binance-bot/backend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 5000,
      env: {
        PORT: 21344,
        DIANA_BINANCE_BACKEND_PORT: 21344,
        BINANCE_USE_TESTNET: 'false',
        TRADING_TYPE: 'FUTURES',
        NODE_ENV: 'production'
      }
    },
    {
      // Executor Isolado: Mainnet Spot - porta 21345
      name: 'binance-mainnet-spot',
      namespace: 'SERVERS',
      script: 'dist/server-executor.js',
      cwd: `${ROOT}/modules/binance-bot/backend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 5000,
      env: {
        PORT: 21345,
        DIANA_BINANCE_BACKEND_PORT: 21345,
        BINANCE_USE_TESTNET: 'false',
        TRADING_TYPE: 'SPOT',
        NODE_ENV: 'production'
      }
    },
    {
      // Betting Frontend (Vite preview) - porta 21371
      // Requer build: cd modules/betting-platform/frontend && npm run build
      name: 'betting-frontend',
      namespace: 'SERVERS',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 21371 --host',
      cwd: `${ROOT}/modules/betting-platform/frontend`,
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      env: {
        PORT: 21371,
        VITE_API_URL: 'http://localhost:21370'
      }
    }
  ]
};
