import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class Logger {
    constructor(squad = 'GENERAL', agent = 'SYSTEM') {
        this.squad = squad;
        this.agent = agent;
        this.baseLogDir = path.resolve(process.cwd(), 'logs');
    }

    async log(level, message, metadata = {}) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const logDir = path.join(this.baseLogDir, dateStr);
        
        try {
            await fs.mkdir(logDir, { recursive: true });
        } catch (e) {}

        const timestamp = now.toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${this.squad}:${this.agent}] ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}
`;
        
        const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
        const combinedFile = path.join(logDir, 'combined.log');

        await Promise.all([
            fs.appendFile(logFile, logEntry),
            fs.appendFile(combinedFile, logEntry)
        ]);

        // Console output for visibility in CLI
        const colors = {
            INFO: '\x1b[32m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            DEBUG: '\x1b[36m'
        };
        const reset = '\x1b[0m';
        console.log(`${colors[level.toUpperCase()] || ''}[${level}]${reset} ${message}`);
    }

    info(msg, meta) { return this.log('INFO', msg, meta); }
    warn(msg, meta) { return this.log('WARN', msg, meta); }
    error(msg, meta) { return this.log('ERROR', msg, meta); }
    debug(msg, meta) { return this.log('DEBUG', msg, meta); }
}

export default Logger;
