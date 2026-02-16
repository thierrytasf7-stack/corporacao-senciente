/**
 * Utilitário de Console para Sistema AURA
 * Garante que todas as funções personalizadas estejam disponíveis
 */

// Função para adicionar log com categoria
const addLog = (level: string, category: string = 'general', ...args: any[]) => {
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    url: window?.location?.href || 'console',
    source: 'web_console',
    details: {
      source: 'console_logger_utils',
      type: 'console_capture',
      category
    }
  };

  // Chamar método original do console
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };

  originalConsole[level as keyof typeof originalConsole]?.apply(console, args);
};

// Garantir que as funções personalizadas estejam sempre disponíveis
export const ensureConsoleFunctions = () => {
  // Verificar se as funções já existem
  if (!console.trading) {
    console.trading = (...args: any[]) => addLog('info', 'trading', ...args);
  }

  if (!console.tradingError) {
    console.tradingError = (...args: any[]) => addLog('error', 'trading', ...args);
  }

  if (!console.apiError) {
    console.apiError = (...args: any[]) => addLog('error', 'api', ...args);
  }

  if (!console.positionError) {
    console.positionError = (...args: any[]) => addLog('error', 'position', ...args);
  }

  console.log('🔧 Console Logger Utils: Funções personalizadas garantidas');
};

// Executar imediatamente
ensureConsoleFunctions();

// Exportar funções para uso direto
export const tradingLog = (...args: any[]) => {
  ensureConsoleFunctions();
  console.trading(...args);
};

export const tradingErrorLog = (...args: any[]) => {
  ensureConsoleFunctions();
  console.tradingError(...args);
};

export const apiErrorLog = (...args: any[]) => {
  ensureConsoleFunctions();
  console.apiError(...args);
};

export const positionErrorLog = (...args: any[]) => {
  ensureConsoleFunctions();
  console.positionError(...args);
};
