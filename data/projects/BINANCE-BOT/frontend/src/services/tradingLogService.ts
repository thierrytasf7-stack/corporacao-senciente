/**
 * Serviço para buscar logs detalhados de trading do backend
 * e exibi-los no console do frontend
 */

import { config } from '../../env.config.js';

class TradingLogService {
    private apiUrl: string;

    constructor() {
        // Usa diretamente a configuração do env.config.js
        this.apiUrl = config.API_URL;
    }

    /**
     * Busca logs de análise rotativa do backend
     */
    async fetchTradingLogs(limit: number = 50): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/real-analysis/logs?limit=${limit}`);

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.logs) {
                console.log('📋 [TRADING] Logs solicitados pelo usuário');
                console.log('📊 Status atual das posições:', {
                    total: data.logs.length,
                    errors: data.logs.filter((log: any) => log.level === 'error').length,
                    pending: data.logs.filter((log: any) => log.message?.includes('PENDING')).length,
                    open: data.logs.filter((log: any) => log.message?.includes('OPEN')).length,
                    closed: data.logs.filter((log: any) => log.message?.includes('CLOSED')).length
                });

                // Exibir logs mais recentes e importantes
                const recentLogs = data.logs.slice(-10);
                recentLogs.forEach((log: any) => {
                    const timestamp = new Date(log.timestamp).toLocaleTimeString();

                    if (log.message?.includes('ORDER_SUCCESS')) {
                        console.log(`✅ [${timestamp}] ${log.message}`);
                    } else if (log.message?.includes('ORDER_FAILED') || log.message?.includes('ORDER_ERROR')) {
                        console.error(`❌ [${timestamp}] ${log.message}`);
                    } else if (log.message?.includes('POSITION') || log.message?.includes('TRADING')) {
                        console.log(`📊 [${timestamp}] ${log.message}`);
                    } else if (log.message?.includes('Estratégia')) {
                        console.log(`🎯 [${timestamp}] ${log.message}`);
                    }
                });
            }
        } catch (error) {
            console.error('❌ Erro ao buscar logs de trading:', error);
        }
    }

    /**
     * Busca status atual da análise rotativa
     */
    async fetchAnalysisStatus(): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/real-analysis/status`);

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log('📊 [ANÁLISE] Status atual:', {
                    isRunning: data.isRunning,
                    currentMarket: data.currentMarket,
                    cycleNumber: data.cycleNumber,
                    totalSignals: data.totalSignals,
                    successfulTrades: data.successfulTrades,
                    lastUpdate: data.lastUpdate
                });
            }
        } catch (error) {
            console.error('❌ Erro ao buscar status da análise:', error);
        }
    }

    /**
     * Inicia monitoramento automático de logs
     */
    startLogMonitoring(intervalMs: number = 30000): void {
        console.log('🔄 [MONITORAMENTO] Iniciando monitoramento automático de logs de trading');

        // Buscar logs imediatamente
        this.fetchTradingLogs();
        this.fetchAnalysisStatus();

        // Configurar intervalo
        setInterval(() => {
            this.fetchTradingLogs();
            this.fetchAnalysisStatus();
        }, intervalMs);
    }
}

export default new TradingLogService();
