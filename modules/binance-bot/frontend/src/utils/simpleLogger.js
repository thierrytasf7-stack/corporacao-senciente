/**
 * Logger simples para capturar logs do console
 */

console.log('🔧 Simple Logger carregado');

// Salvar console methods originais
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Array para armazenar logs
const logs = [];

// Função para capturar log
function captureLog(level, ...args) {
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    url: window.location.href,
    source: 'web_console',
    details: {
      source: 'simple_logger',
      type: 'console_capture'
    }
  };

  logs.push(logEntry);

  // Enviar para backend a cada 3 logs
  if (logs.length % 3 === 0) {
    sendLogsToBackend();
  }

  // Chamar método original
  originalConsole[level].apply(console, args);
}

// Função para enviar logs para backend
function sendLogsToBackend() {
  const logData = {
    sessionId: `simple_logger_${Date.now()}`,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    totalLogs: logs.length,
    errors: logs.filter(log => log.level === 'error').length,
    warnings: logs.filter(log => log.level === 'warn').length,
    logs: logs
  };

  fetch('/api/logs/update-frontend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: 'LOGS-CONSOLE-FRONTEND.JSON',
      content: JSON.stringify(logData),
      timestamp: new Date().toISOString(),
      sourceUrl: window.location.href
    })
  }).catch(err => {
    originalConsole.error('Erro ao enviar logs:', err);
  });
}

// Substituir console methods
console.log = (...args) => captureLog('info', ...args);
console.error = (...args) => captureLog('error', ...args);
console.warn = (...args) => captureLog('warn', ...args);
console.info = (...args) => captureLog('info', ...args);
console.debug = (...args) => captureLog('debug', ...args);

// Capturar erros não tratados
window.addEventListener('error', (event) => {
  captureLog('error', 'Uncaught Error:', event.error?.message || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  captureLog('error', 'Unhandled Promise Rejection:', event.reason);
});

console.log('✅ Simple Logger ativado - capturando todos os logs');
