/**
 * Logger Estruturado
 * Sistema de logging com diferentes níveis e formato estruturado
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_LEVEL_NAMES = Object.keys(LOG_LEVELS);

class Logger {
  constructor(options = {}) {
    this.level = options.level || (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    this.levelValue = LOG_LEVELS[this.level] || LOG_LEVELS.INFO;
    this.enableFileLogging = options.enableFileLogging !== false;
    this.logDir = options.logDir || 'logs';
    this.enableConsole = options.enableConsole !== false;

    // Criar diretório de logs se necessário
    if (this.enableFileLogging) {
      try {
        if (!fs.existsSync(this.logDir)) {
          fs.mkdirSync(this.logDir, { recursive: true });
        }
      } catch (err) {
        console.warn(`⚠️ Could not create log directory ${this.logDir}:`, err.message);
        this.enableFileLogging = false; // Disable file logging if we can't create the dir
      }
    }
  }

  /**
   * Formata mensagem de log
   */
  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...metadata,
    };
  }

  /**
   * Escreve log no arquivo
   */
  writeToFile(level, formattedMessage) {
    if (!this.enableFileLogging) return;

    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);

    const logLine = JSON.stringify(formattedMessage) + '\n';

    try {
      fs.appendFileSync(logFile, logLine, 'utf8');
    } catch (error) {
      // If we can't write, just disable it quietly
      this.enableFileLogging = false;
    }
  }


  /**
   * Escreve log no console
   */
  writeToConsole(level, formattedMessage) {
    if (!this.enableConsole) return;

    const emoji = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
    }[level] || '';

    const color = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m', // Gray
    }[level] || '';

    const reset = '\x1b[0m';

    console.log(
      `${color}${emoji} [${level}] ${formattedMessage.timestamp} - ${formattedMessage.message}${reset}`,
      Object.keys(formattedMessage).length > 3
        ? formattedMessage
        : ''
    );
  }

  /**
   * Log genérico
   */
  log(level, message, metadata = {}) {
    const levelValue = LOG_LEVELS[level];
    if (levelValue === undefined || levelValue > this.levelValue) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, metadata);

    this.writeToFile(level, formattedMessage);
    this.writeToConsole(level, formattedMessage);
  }

  /**
   * Log de erro
   */
  error(message, metadata = {}) {
    this.log('ERROR', message, metadata);
  }

  /**
   * Log de aviso
   */
  warn(message, metadata = {}) {
    this.log('WARN', message, metadata);
  }

  /**
   * Log de informação
   */
  info(message, metadata = {}) {
    this.log('INFO', message, metadata);
  }

  /**
   * Log de debug
   */
  debug(message, metadata = {}) {
    this.log('DEBUG', message, metadata);
  }

  /**
   * Cria child logger com contexto adicional
   */
  child(context) {
    const childLogger = new Logger({
      level: this.level,
      enableFileLogging: this.enableFileLogging,
      logDir: this.logDir,
      enableConsole: this.enableConsole,
    });

    // Wrap métodos para incluir contexto
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, metadata = {}) => {
      originalLog(level, message, { ...context, ...metadata });
    };

    return childLogger;
  }
}

// Instância singleton
export const logger = new Logger({
  level: process.env.LOG_LEVEL || 'INFO',
  enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
  logDir: process.env.LOG_DIR || 'logs',
});

/**
 * Cria logger customizado
 */
export function createLogger(options) {
  return new Logger(options);
}

export default logger;

























