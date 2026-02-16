/**
 * Serviço de Logs Otimizado para Análise Rotativa
 * Evita logs repetitivos e só mostra atualizações quando há mudanças reais
 */

interface LogState {
    lastStatusHash: string;
    lastSignalsHash: string;
    lastOrdersHash: string;
    lastPositionsHash: string;
    loggedSignals: Set<string>;
    loggedOrders: Set<string>;
    loggedPositions: Set<string>;
    lastLogTime: number;
}

interface AnalysisStatus {
    isRunning: boolean;
    isAnalyzing: boolean;
    lastAnalysisMarkets: number;
    executedOrders: number;
    totalCyclesCompleted: number;
    currentCycleNumber: number;
}

interface TradingSignal {
    symbol: string;
    signal: string;
    strength: number;
    price: number;
    timestamp: number;
    orderStatus?: string;
    orderId?: string;
}

interface Position {
    symbol: string;
    side: string;
    status: string;
    orderId?: string;
    timestamp: number;
}

export class OptimizedLogService {
    private static instance: OptimizedLogService;
    private logState: LogState;
    private readonly MIN_LOG_INTERVAL = 2000; // Mínimo 2 segundos entre logs similares

    private constructor() {
        this.logState = {
            lastStatusHash: '',
            lastSignalsHash: '',
            lastOrdersHash: '',
            lastPositionsHash: '',
            loggedSignals: new Set(),
            loggedOrders: new Set(),
            loggedPositions: new Set(),
            lastLogTime: 0
        };
    }

    public static getInstance(): OptimizedLogService {
        if (!OptimizedLogService.instance) {
            OptimizedLogService.instance = new OptimizedLogService();
        }
        return OptimizedLogService.instance;
    }

    /**
     * Log de status apenas quando há mudanças significativas
     */
    logStatusUpdate(status: AnalysisStatus): void {
        const currentTime = Date.now();
        const timeSinceLastLog = currentTime - this.logState.lastLogTime;

        // Criar hash único para o status atual
        const statusHash = `${status.isRunning}-${status.isAnalyzing}-${status.lastAnalysisMarkets}-${status.executedOrders}-${status.totalCyclesCompleted}-${status.currentCycleNumber}`;

        // Só logar se houve mudança significativa e passou tempo suficiente
        if (statusHash !== this.logState.lastStatusHash && timeSinceLastLog >= this.MIN_LOG_INTERVAL) {
            console.log('📊 [STATUS] Status da análise atualizado:', {
                isRunning: status.isRunning,
                isAnalyzing: status.isAnalyzing,
                lastAnalysisMarkets: status.lastAnalysisMarkets,
                executedOrders: status.executedOrders,
                totalCyclesCompleted: status.totalCyclesCompleted,
                currentCycleNumber: status.currentCycleNumber
            });

            this.logState.lastStatusHash = statusHash;
            this.logState.lastLogTime = currentTime;
        }
    }

    /**
     * Log de ordens executadas apenas quando há mudanças
     */
    logOrdersUpdate(ordersCount: number, cycleNumber: number): void {
        const ordersHash = `orders-${ordersCount}-${cycleNumber}`;

        if (ordersCount > 0 && !this.logState.loggedOrders.has(ordersHash)) {
            console.log(`💰 [ORDENS] ${ordersCount} ordens executadas na última análise`);
            this.logState.loggedOrders.add(ordersHash);
        }
    }

    /**
     * Log de sinais apenas quando há novos sinais
     */
    logSignalsUpdate(signals: TradingSignal[]): void {
        if (signals.length === 0) return;

        // Criar hash dos sinais baseado em símbolo e timestamp
        const signalsHash = signals.map(s => `${s.symbol}-${s.timestamp}`).join(',');

        if (signalsHash !== this.logState.lastSignalsHash) {
            console.log('🔍 [SINAIS] Sinais detectados:', signals.length);

            // Log detalhado apenas dos novos sinais
            signals.forEach((signal, index) => {
                const signalKey = `${signal.symbol}-${signal.timestamp}`;
                if (!this.logState.loggedSignals.has(signalKey)) {
                    console.log(`📡 [SINAL ${index + 1}] Detalhes:`, {
                        symbol: signal.symbol,
                        signal: signal.signal,
                        strength: signal.strength,
                        price: signal.price,
                        timestamp: signal.timestamp,
                        orderStatus: signal.orderStatus,
                        orderId: signal.orderId
                    });
                    this.logState.loggedSignals.add(signalKey);
                }
            });

            this.logState.lastSignalsHash = signalsHash;
        }
    }

    /**
     * Log de novos sinais de trading (apenas uma vez por sinal)
     */
    logNewTradingSignal(signal: TradingSignal): void {
        const signalKey = `new-signal-${signal.symbol}-${signal.timestamp}`;

        if (!this.logState.loggedSignals.has(signalKey)) {
            console.log(`🚀 [NOVO SINAL] ${signal.symbol} ${signal.signal} (${signal.strength}%) - ${signal.orderStatus || 'PENDENTE'}`);
            this.logState.loggedSignals.add(signalKey);
        }
    }

    /**
     * Log de posições apenas quando há mudanças
     */
    logPositionsUpdate(positions: Position[]): void {
        if (positions.length === 0) return;

        const positionsHash = positions.map(p => `${p.symbol}-${p.side}-${p.status}-${p.timestamp}`).join(',');

        if (positionsHash !== this.logState.lastPositionsHash) {
            console.log('📊 [POSIÇÕES] Posições atualizadas:', positions.length);

            // Log detalhado apenas das novas posições
            positions.forEach((position, index) => {
                const positionKey = `${position.symbol}-${position.side}-${position.timestamp}`;
                if (!this.logState.loggedPositions.has(positionKey)) {
                    console.log(`📊 [POSIÇÃO ${index + 1}] Detalhes:`, {
                        symbol: position.symbol,
                        side: position.side,
                        status: position.status,
                        orderId: position.orderId,
                        timestamp: position.timestamp
                    });
                    this.logState.loggedPositions.add(positionKey);
                }
            });

            this.logState.lastPositionsHash = positionsHash;
        }
    }

    /**
     * Log de abertura de posição (sempre importante)
     */
    logPositionOpened(symbol: string, side: string, orderId: string, price: number): void {
        console.log(`🎉 [POSIÇÃO ABERTA] ${symbol} ${side} - OrderId: ${orderId} - Preço: $${price}`);
        console.log(`✅ [CONFIRMAÇÃO] Posição confirmada na Binance Testnet`);
    }

    /**
     * Log de erro de posição (sempre importante)
     */
    logPositionError(symbol: string, side: string, error: string): void {
        console.error(`❌ [ERRO POSIÇÃO] ${symbol} ${side} - ${error}`);
    }

    /**
     * Log de análise atualizada apenas quando há mudanças significativas
     */
    logAnalysisUpdate(analysis: {
        totalMarkets: number;
        buySignals: number;
        sellSignals: number;
        holdSignals: number;
        averageStrength: number;
        timestamp: number;
    }): void {
        const analysisHash = `analysis-${analysis.buySignals}-${analysis.sellSignals}-${analysis.holdSignals}-${analysis.timestamp}`;

        if (!this.logState.loggedSignals.has(analysisHash)) {
            console.log('📊 [ANÁLISE] Análise atualizada:', {
                totalMarkets: analysis.totalMarkets,
                buySignals: analysis.buySignals,
                sellSignals: analysis.sellSignals,
                holdSignals: analysis.holdSignals,
                averageStrength: analysis.averageStrength
            });
            this.logState.loggedSignals.add(analysisHash);
        }
    }

    /**
     * Log de monitoramento de posição (apenas quando há mudanças de status)
     */
    logPositionMonitoring(symbol: string, side: string, status: string, attempts: number): void {
        const monitoringKey = `monitoring-${symbol}-${side}-${status}`;

        if (!this.logState.loggedPositions.has(monitoringKey)) {
            if (status === 'OPENED') {
                console.log(`✅ [POSIÇÃO ABERTA] ${symbol} ${side} - Posição confirmada na Binance`);
            } else if (status === 'PENDING') {
                console.log(`⏳ [AGUARDANDO] ${symbol} ${side} - Tentativa ${attempts} (aguardando confirmação)`);
            } else if (status === 'ERROR') {
                console.log(`❌ [ERRO] ${symbol} ${side} - Falha na abertura da posição`);
            }
            this.logState.loggedPositions.add(monitoringKey);
        }
    }

    /**
     * Log de início de análise rotativa (sempre importante)
     */
    logAnalysisStarted(markets: string[]): void {
        console.log('🚀 [ANÁLISE] Iniciando análise rotativa contínua REAL...');
        console.log('📋 [MERCADOS] Mercados favoritos selecionados:', markets);
        console.log('🔄 [MONITORAMENTO] Sistema irá verificar sinais a cada 30 segundos');
    }

    /**
     * Log de parada de análise rotativa (sempre importante)
     */
    logAnalysisStopped(totalSignals: number): void {
        console.log('🛑 [ANÁLISE] Parando análise rotativa contínua...');
        console.log('✅ [ANÁLISE] Análise rotativa contínua parada');
        console.log('📊 [RESUMO] Total de sinais acumulados:', totalSignals);
    }

    /**
     * Limpar estado dos logs (para reset)
     */
    clearLogState(): void {
        this.logState = {
            lastStatusHash: '',
            lastSignalsHash: '',
            lastOrdersHash: '',
            lastPositionsHash: '',
            loggedSignals: new Set(),
            loggedOrders: new Set(),
            loggedPositions: new Set(),
            lastLogTime: 0
        };
        console.log('🧹 [LOGS] Estado dos logs limpo - novos logs serão exibidos');
    }

    /**
     * Log de debug (apenas em desenvolvimento)
     */
    logDebug(message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 [DEBUG] ${message}`, data || '');
        }
    }

    /**
     * Log de warning (sempre importante)
     */
    logWarning(message: string, data?: any): void {
        console.warn(`⚠️ [WARNING] ${message}`, data || '');
    }

    /**
     * Log de erro (sempre importante)
     */
    logError(message: string, error?: any): void {
        console.error(`❌ [ERROR] ${message}`, error || '');
    }
}

export default OptimizedLogService.getInstance();
