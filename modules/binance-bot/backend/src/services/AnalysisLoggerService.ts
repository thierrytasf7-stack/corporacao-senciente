import { StrategyStorageService } from './StrategyStorageService';

export interface AnalysisLog {
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'analysis' | 'signal' | 'order' | 'market_data' | 'strategy_check';
    message: string;
    details?: any;
    market?: string;
    strategy?: string;
    confidence?: number;
    action?: 'BUY' | 'SELL';
    betAmount?: number;
    price?: number;
    volume?: number;
    rsi?: number;
    macd?: any;
    indicators?: any;
    orderResult?: any;
    error?: string;
    duration?: number;
    cycleInfo?: {
        currentMarket: number;
        totalMarkets: number;
        progress: number;
        cycleMode: string;
    };
}

export class AnalysisLoggerService {
    private storageService: StrategyStorageService;
    private logs: AnalysisLog[] = [];
    private maxLogs: number = 100;
    // MEMORY-LEAK-FIX: Limit max listeners to prevent unbounded growth
    private listeners: ((log: AnalysisLog) => void)[] = [];
    private readonly MAX_LISTENERS = 10;
    private saveCounter: number = 0;
    private readonly SAVE_INTERVAL = 10; // Save to disk every 10 logs instead of every log

    constructor() {
        this.storageService = new StrategyStorageService();
        this.loadLogs();
    }

    private async loadLogs(): Promise<void> {
        try {
            const savedLogs = await this.storageService.getData<AnalysisLog[]>('analysis_logs');
            if (savedLogs) {
                this.logs = savedLogs;
            }
        } catch (error) {
            console.error('Erro ao carregar logs de análise:', error);
        }
    }

    private async saveLogs(): Promise<void> {
        try {
            await this.storageService.saveData('analysis_logs', this.logs);
        } catch (error) {
            console.error('Erro ao salvar logs de análise:', error);
        }
    }

    private generateLogId(): string {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public addLog(logData: Omit<AnalysisLog, 'id' | 'timestamp'>): AnalysisLog {
        const log: AnalysisLog = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            ...logData
        };

        this.logs.push(log);

        // Manter apenas os últimos maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Notificar listeners
        this.listeners.forEach(listener => listener(log));

        // Enviar log para o console do frontend
        this.sendLogToFrontend(log);

        // MEMORY-LEAK-FIX: Save to disk every SAVE_INTERVAL logs instead of every log (reduces I/O)
        this.saveCounter++;
        if (this.saveCounter >= this.SAVE_INTERVAL) {
            this.saveCounter = 0;
            this.saveLogs();
        }

        return log;
    }

    public addAnalysisLog(market: string, cycleInfo: any, details?: any): AnalysisLog {
        return this.addLog({
            type: 'analysis',
            message: `🔍 Analisando mercado: ${market}`,
            market,
            cycleInfo,
            details
        });
    }

    public addMarketDataLog(market: string, data: any, duration: number): AnalysisLog {
        return this.addLog({
            type: 'market_data',
            message: `📊 Dados obtidos para ${market}: $${data.currentPrice}`,
            market,
            price: data.currentPrice,
            volume: data.candles?.[data.candles.length - 1]?.volume,
            duration,
            details: {
                candlesCount: data.candles?.length,
                symbolInfo: data.symbolInfo?.symbol,
                timestamp: data.timestamp
            }
        });
    }

    public addStrategyCheckLog(market: string, strategy: string, indicators: any, confidence: number): AnalysisLog {
        return this.addLog({
            type: 'strategy_check',
            message: `🎯 Estratégia ${strategy} analisada para ${market}`,
            market,
            strategy,
            confidence,
            indicators,
            details: {
                rsi: indicators.rsi,
                macd: indicators.macd,
                buyThreshold: indicators.buyThreshold,
                sellThreshold: indicators.sellThreshold
            }
        });
    }

    public addSignalLog(market: string, strategy: string, action: 'BUY' | 'SELL', confidence: number, betAmount: number): AnalysisLog {
        return this.addLog({
            type: 'signal',
            message: `📡 SINAL GERADO: ${strategy} - ${market} ${action} (Confiança: ${confidence}%)`,
            market,
            strategy,
            action,
            confidence,
            betAmount,
            details: {
                signalType: action,
                confidenceLevel: confidence > 70 ? 'ALTA' : confidence > 50 ? 'MÉDIA' : 'BAIXA'
            }
        });
    }

    public addOrderLog(market: string, action: 'BUY' | 'SELL', betAmount: number, orderResult: any): AnalysisLog {
        const success = orderResult?.success;
        return this.addLog({
            type: 'order',
            message: `${success ? '✅' : '❌'} Ordem ${action} executada para ${market}: $${betAmount}`,
            market,
            action,
            betAmount,
            orderResult,
            details: {
                success,
                price: orderResult?.price,
                message: orderResult?.message
            }
        });
    }

    public addSuccessLog(message: string, details?: any): AnalysisLog {
        return this.addLog({
            type: 'success',
            message: `✅ ${message}`,
            details
        });
    }

    public addWarningLog(message: string, details?: any): AnalysisLog {
        return this.addLog({
            type: 'warning',
            message: `⚠️ ${message}`,
            details
        });
    }

    public addErrorLog(message: string, error?: any, details?: any): AnalysisLog {
        return this.addLog({
            type: 'error',
            message: `❌ ${message}`,
            error: error instanceof Error ? error.message : (error?.message || String(error)),
            details
        });
    }

    public addInfoLog(message: string, details?: any): AnalysisLog {
        return this.addLog({
            type: 'info',
            message: `ℹ️ ${message}`,
            details
        });
    }

    public addCycleStartLog(cycleMode: string, marketsCount: number, strategiesCount: number, mathStrategy: string): AnalysisLog {
        return this.addLog({
            type: 'info',
            message: `🚀 Ciclo de análise iniciado - Modo: ${cycleMode}`,
            details: {
                cycleMode,
                marketsCount,
                strategiesCount,
                mathStrategy,
                startTime: new Date().toISOString()
            }
        });
    }

    public addCycleCompleteLog(cycleNumber: number, totalSignals: number, successfulTrades: number): AnalysisLog {
        return this.addLog({
            type: 'success',
            message: `🔄 Ciclo ${cycleNumber} completo - ${totalSignals} sinais, ${successfulTrades} trades bem-sucedidos`,
            details: {
                cycleNumber,
                totalSignals,
                successfulTrades,
                successRate: totalSignals > 0 ? (successfulTrades / totalSignals) * 100 : 0
            }
        });
    }

    public getLogs(limit: number = 100): AnalysisLog[] {
        return this.logs.slice(-limit);
    }

    public getLogsByType(type: AnalysisLog['type'], limit: number = 50): AnalysisLog[] {
        return this.logs.filter(log => log.type === type).slice(-limit);
    }

    public getLogsByMarket(market: string, limit: number = 50): AnalysisLog[] {
        return this.logs.filter(log => log.market === market).slice(-limit);
    }

    public getRecentSignals(limit: number = 20): AnalysisLog[] {
        return this.logs.filter(log => log.type === 'signal').slice(-limit);
    }

    public getRecentOrders(limit: number = 20): AnalysisLog[] {
        return this.logs.filter(log => log.type === 'order').slice(-limit);
    }

    public getErrors(limit: number = 20): AnalysisLog[] {
        return this.logs.filter(log => log.type === 'error').slice(-limit);
    }

    public clearLogs(): void {
        this.logs = [];
        this.saveLogs();
    }

    public addListener(listener: (log: AnalysisLog) => void): void {
        // MEMORY-LEAK-FIX: Limit listeners to prevent unbounded growth
        if (this.listeners.length >= this.MAX_LISTENERS) {
            console.warn(`⚠️ [AnalysisLogger] Max listeners (${this.MAX_LISTENERS}) reached, removing oldest`);
            this.listeners.shift();
        }
        this.listeners.push(listener);
    }

    public removeListener(listener: (log: AnalysisLog) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    public getStats(): {
        totalLogs: number;
        signalsCount: number;
        ordersCount: number;
        errorsCount: number;
        successRate: number;
        averageConfidence: number;
    } {
        const signals = this.logs.filter(log => log.type === 'signal');
        const orders = this.logs.filter(log => log.type === 'order');
        const errors = this.logs.filter(log => log.type === 'error');
        const successfulOrders = orders.filter(log => log.details?.success);

        const totalConfidence = signals.reduce((sum, log) => sum + (log.confidence || 0), 0);
        const averageConfidence = signals.length > 0 ? totalConfidence / signals.length : 0;

        return {
            totalLogs: this.logs.length,
            signalsCount: signals.length,
            ordersCount: orders.length,
            errorsCount: errors.length,
            successRate: orders.length > 0 ? (successfulOrders.length / orders.length) * 100 : 0,
            averageConfidence
        };
    }

    private async sendLogToFrontend(log: AnalysisLog): Promise<void> {
        try {
            // Formatar mensagem para o console do frontend
            const consoleMessage = this.formatLogForConsole(log);

            // Exibir no console do backend
            console.log(`[ANÁLISE] ${consoleMessage}`);

            // Enviar para o endpoint de logs do frontend via WebSocket ou polling
            // Por enquanto, vamos usar um método mais simples
            // console.log(`[ANÁLISE] ${consoleMessage}`);
        } catch (error) {
            // Silenciar erro para não poluir os logs
            console.debug('Erro ao enviar log para frontend:', error);
        }
    }

    private formatLogForConsole(log: AnalysisLog): string {
        const timestamp = new Date(log.timestamp).toLocaleTimeString('pt-BR');

        switch (log.type) {
            case 'analysis':
                return `🔍 [${timestamp}] Análise: ${log.message}`;
            case 'signal':
                return `📡 [${timestamp}] SINAL: ${log.message}`;
            case 'order':
                return `💰 [${timestamp}] ORDEM: ${log.message}`;
            case 'market_data':
                return `📊 [${timestamp}] Dados: ${log.message}`;
            case 'strategy_check':
                return `🎯 [${timestamp}] Estratégia: ${log.message}`;
            case 'success':
                return `✅ [${timestamp}] Sucesso: ${log.message}`;
            case 'warning':
                return `⚠️ [${timestamp}] Aviso: ${log.message}`;
            case 'error':
                return `❌ [${timestamp}] Erro: ${log.message}`;
            default:
                return `ℹ️ [${timestamp}] ${log.message}`;
        }
    }
}

export default AnalysisLoggerService;
