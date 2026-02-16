/**
 * Logger simples para capturar todos os logs do console
 * Envia automaticamente para o backend
 */

class ViteLogger {
    constructor() {
        this.logs = [];
        this.sessionId = `vite_logger_${Date.now()}`;
        this.startTime = new Date().toISOString();
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        // Salvar console methods originais
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };

        // Substituir console methods
        console.log = (...args) => this.captureLog('info', ...args);
        console.error = (...args) => this.captureLog('error', ...args);
        console.warn = (...args) => this.captureLog('warn', ...args);
        console.info = (...args) => this.captureLog('info', ...args);
        console.debug = (...args) => this.captureLog('debug', ...args);

        // Capturar erros não tratados
        window.addEventListener('error', (event) => {
            this.captureLog('error', 'Uncaught Error:', event.error?.message || event.message);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.captureLog('error', 'Unhandled Promise Rejection:', event.reason);
        });

        this.isInitialized = true;
        this.originalConsole.log('🔧 Vite Logger inicializado');
    }

    captureLog(level, ...args) {
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
                source: 'vite_logger',
                type: 'console_capture'
            }
        };

        this.logs.push(logEntry);

        // Enviar para backend a cada 5 logs
        if (this.logs.length % 5 === 0) {
            this.sendLogsToBackend();
        }

        // Chamar método original
        this.originalConsole[level].apply(console, args);
    }

    sendLogsToBackend() {
        const logData = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: new Date().toISOString(),
            totalLogs: this.logs.length,
            errors: this.logs.filter(log => log.level === 'error').length,
            warnings: this.logs.filter(log => log.level === 'warn').length,
            logs: this.logs
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
            this.originalConsole.error('Erro ao enviar logs:', err);
        });
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }
}

// Criar instância global
const viteLogger = new ViteLogger();

export default viteLogger;
