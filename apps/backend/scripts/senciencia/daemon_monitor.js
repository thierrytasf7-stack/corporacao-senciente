import fs from 'fs';
import PCMonitor from '../infra/pc_monitor.js';
import { logger } from '../utils/logger.js';

// Configuração
const CHECK_INTERVAL = 30000; // 30s
const DAEMON_STATE_FILE = '.daemon_state.json';

const log = logger.child({ module: 'daemon_monitor' });

class DaemonMonitor {
    constructor() {
        this.pcMonitor = new PCMonitor();
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('📈 INICIANDO MONITORAMENTO DO DAEMON');
        console.log('='.repeat(50));

        this.monitorLoop();
    }

    async monitorLoop() {
        if (!this.isRunning) return;

        try {
            const timestamp = new Date().toISOString();
            const metrics = await this.collectMetrics();

            console.log(`[${timestamp}] Status: ${metrics.status} | Tasks: ${metrics.queueSize}`);

            if (metrics.status === 'ERROR' || metrics.status === 'OFFLINE') {
                log.warn('⚠️ Alerta de Daemon:', metrics);
            }

        } catch (error) {
            log.error('Erro no ciclo de monitoramento:', error);
        }

        setTimeout(() => this.monitorLoop(), CHECK_INTERVAL);
    }

    async collectMetrics() {
        // Tentar ler estado do arquivo (se o daemon persistir estado)
        let state = { status: 'UNKNOWN', queueSize: 0 };

        if (fs.existsSync(DAEMON_STATE_FILE)) {
            try {
                const data = JSON.parse(fs.readFileSync(DAEMON_STATE_FILE, 'utf8'));
                state = { ...state, ...data };
            } catch (e) {
                state.status = 'READ_ERROR';
            }
        } else {
            state.status = 'OFFLINE';
        }

        return state;
    }

    stop() {
        this.isRunning = false;
        console.log('🛑 Monitoramento parado.');
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new DaemonMonitor();
    monitor.start();

    process.on('SIGINT', () => {
        monitor.stop();
        process.exit(0);
    });
}

export default DaemonMonitor;
