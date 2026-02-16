/**
 * Plugin personalizado do Vite para capturar logs do console
 * Salva automaticamente todos os logs em arquivo
 * MELHORADO para capturar erros de posições e trading
 */

import fs from 'fs';

export default function viteLoggerPlugin() {
  const logFile = 'LOGS-CONSOLE-FRONTEND.JSON';
  let logs = [];
  let sessionId = `vite_logger_${Date.now()}`;
  let startTime = new Date().toISOString();

  // Função para salvar logs
  const saveLogs = () => {
    const logData = {
      sessionId,
      startTime,
      endTime: new Date().toISOString(),
      totalLogs: logs.length,
      errors: logs.filter(log => log.level === 'error').length,
      warnings: logs.filter(log => log.level === 'warn').length,
      tradingErrors: logs.filter(log => log.category === 'trading').length,
      apiErrors: logs.filter(log => log.category === 'api').length,
      logs: logs
    };

    try {
      fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
      console.log(`📄 Logs salvos: ${logs.length} entradas`);
    } catch (error) {
      console.error('❌ Erro ao salvar logs:', error);
    }
  };

  // Interceptar console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };

  // Função para adicionar log com categoria
  const addLog = (level, category = 'general', ...args) => {
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      url: typeof window !== 'undefined' ? window?.location?.href || 'console' : 'server',
      source: 'web_console',
      details: {
        source: 'vite_plugin',
        type: 'console_capture',
        category
      }
    };

    logs.push(logEntry);

    // Salvar a cada 5 logs para capturar mais rapidamente
    if (logs.length % 5 === 0) {
      saveLogs();
    }

    // Chamar método original
    originalConsole[level].apply(console, args);
  };

  return {
    name: 'vite-logger-plugin',

    configureServer(server) {
      console.log('🚀 Vite Logger Plugin ativado - MELHORADO para Trading');

      // Interceptar console methods no servidor
      console.log = (...args) => addLog('info', 'general', ...args);
      console.error = (...args) => addLog('error', 'general', ...args);
      console.warn = (...args) => addLog('warn', 'general', ...args);
      console.info = (...args) => addLog('info', 'general', ...args);
      console.debug = (...args) => addLog('debug', 'general', ...args);
    },

    transformIndexHtml(html) {
      // Injetar script para capturar logs no cliente
      const loggerScript = `
        <script>
          (function() {
            // Garantir que as funções personalizadas sejam definidas ANTES de qualquer uso
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info,
              debug: console.debug
            };

            const logs = [];
            const sessionId = 'vite_logger_${Date.now()}';
            const startTime = new Date().toISOString();

            function addLog(level, category = 'general', ...args) {
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ');

              const logEntry = {
                timestamp: new Date().toISOString(),
                level,
                category,
                message,
                url: window.location.href,
                source: 'web_console',
                details: {
                  source: 'vite_plugin_client',
                  type: 'console_capture',
                  category
                }
              };

              logs.push(logEntry);

              // Enviar para backend a cada 10 logs para reduzir spam
              if (logs.length % 10 === 0) {
                fetch('http://localhost:13001/api/logs/update-frontend', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    filename: 'LOGS-CONSOLE-FRONTEND.JSON',
                    content: JSON.stringify({
                      sessionId,
                      startTime,
                      endTime: new Date().toISOString(),
                      totalLogs: logs.length,
                      errors: logs.filter(log => log.level === 'error').length,
                      warnings: logs.filter(log => log.level === 'warn').length,
                      tradingErrors: logs.filter(log => log.category === 'trading').length,
                      apiErrors: logs.filter(log => log.category === 'api').length,
                      logs: logs
                    }),
                    timestamp: new Date().toISOString(),
                    sourceUrl: window.location.href
                  })
                }).catch(err => {
                  // Silenciar erro para não poluir os logs
                  console.debug('Erro ao enviar logs para backend:', err.message);
                });
              }

              // Chamar método original
              originalConsole[level].apply(console, args);
            }

            // DEFINIR FUNÇÕES PERSONALIZADAS ANTES DE SUBSTITUIR CONSOLE
            console.trading = (...args) => addLog('info', 'trading', ...args);
            console.tradingError = (...args) => addLog('error', 'trading', ...args);
            console.apiError = (...args) => addLog('error', 'api', ...args);
            console.positionError = (...args) => addLog('error', 'position', ...args);

            // Substituir console methods DEPOIS de definir as funções personalizadas
            console.log = (...args) => addLog('info', 'general', ...args);
            console.error = (...args) => addLog('error', 'general', ...args);
            console.warn = (...args) => addLog('warn', 'general', ...args);
            console.info = (...args) => addLog('info', 'general', ...args);
            console.debug = (...args) => addLog('debug', 'general', ...args);

            // Capturar erros não tratados
            window.addEventListener('error', (event) => {
              addLog('error', 'uncaught', 'Uncaught Error:', event.error?.message || event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
              });
            });

            window.addEventListener('unhandledrejection', (event) => {
              addLog('error', 'uncaught', 'Unhandled Promise Rejection:', event.reason);
            });

            // Interceptar fetch para capturar erros de API
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
              const startTime = Date.now();
              const url = args[0];
              
              // Filtrar URLs que não precisam ser logadas - MAIS AGRESSIVO
              const shouldLog = !url.includes('/logs/update-frontend') && 
                               !url.includes('/api/v1/binance/prices') &&
                               !url.includes('/api/v1/rotative-analysis/status') &&
                               !url.includes('/api/v1/rotative-analysis/logs') &&
                               !url.includes('/api/v1/trading-strategies') &&
                               !url.includes('/api/markets') &&
                               !url.includes('/api/v1/binance/portfolio') &&
                               !url.includes('/api/v1/binance/balances') &&
                               !url.includes('/api/v1/binance/positions');
              
              return originalFetch.apply(this, args)
                .then(response => {
                  const duration = Date.now() - startTime;
                  
                  if (!response.ok) {
                    // Sempre logar erros
                    addLog('error', 'api', 'API Error:', {
                      url: url,
                      status: response.status,
                      statusText: response.statusText,
                      duration: duration + 'ms'
                    });
                  } else if (shouldLog) {
                    // Logar apenas sucessos importantes
                    addLog('info', 'api', 'API Success:', {
                      url: url,
                      status: response.status,
                      duration: duration + 'ms'
                    });
                  }
                  return response;
                })
                .catch(error => {
                  const duration = Date.now() - startTime;
                  addLog('error', 'api', 'API Fetch Error:', {
                    url: url,
                    error: error.message,
                    duration: duration + 'ms'
                  });
                  throw error;
                });
            };

            console.log('🔧 Vite Logger Plugin MELHORADO ativado no cliente - Trading Ready');
            console.trading('🚀 Sistema de logs de trading inicializado com sucesso');
          })();
        </script>
      `;

      return html.replace('</head>', `${loggerScript}</head>`);
    },

    closeBundle() {
      // Salvar logs finais
      saveLogs();
      console.log('📄 Logs finais salvos');
    }
  };
}
