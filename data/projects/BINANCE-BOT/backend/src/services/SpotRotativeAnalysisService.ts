import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from './BinanceApiService';
import { MathStrategyService } from './MathStrategyService';
import { SpotStrategyService } from './SpotStrategyService';

export interface CandleData {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
}

export interface MultiTimeframeSignal {
    timeframe1m: { strength: number; diagnostics: string };
    timeframe3m: { strength: number; diagnostics: string };
    timeframe5m: { strength: number; diagnostics: string };
    strongest: { timeframe: string; strength: number };
}

export interface SpotSignalsTable {
    market: string;
    strategies: {
        [strategyId: string]: MultiTimeframeSignal;
    };
}

export interface SpotStrategy {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    isFavorite: boolean;
}

export interface RotativeAnalysisConfig {
    minSignalsRequired: number;
    minSignalStrength: number;
    cycleIntervalMs: number;
    maxHistoryTables: number;
}

export interface CycleSummary {
    cycleNumber: number;
    timestamp: string;
    signalsGenerated: number;
    executionsPerformed: number;
    signalsByMarket: { [market: string]: number };
    table: SpotSignalsTable[];
}

export class SpotRotativeAnalysisService {
    private binanceService: BinanceApiService;
    private spotStrategyService: SpotStrategyService;
    private mathStrategyService: MathStrategyService;
    private isRunning: boolean = false;
    private analysisInterval: NodeJS.Timeout | null = null;
    private lastUpdate: string = '';
    private signalsTable: SpotSignalsTable[] = [];
    private cycleHistory: CycleSummary[] = [];
    private currentCycle: number = 0;
    private favoriteSymbols: string[] = [];
    private emittedSignals: any[] = [];
    // Disk persistence roots
    private readonly CYCLES_DIR = path.join(process.cwd(), 'data', 'LOGS-CICLOS-SPOT');
    private readonly CYCLES_META = path.join(this.CYCLES_DIR, 'cycles-index.json');
    private readonly EXEC_DIR = path.join(process.cwd(), 'data', 'LOGS-EXECUCOES-SPOT');
    private readonly EXEC_META = path.join(this.EXEC_DIR, 'executions-index.json');
    private config: RotativeAnalysisConfig = {
        minSignalsRequired: 3,
        minSignalStrength: 90, // Restaurado para 90%
        cycleIntervalMs: 10000, // 10 segundos
        maxHistoryTables: 20 // Aumentado para 20 ciclos
    };

    constructor() {
        this.binanceService = new BinanceApiService({
            apiKey: process.env.BINANCE_API_KEY || 'test',
            secretKey: process.env.BINANCE_SECRET_KEY || 'test',
            isTestnet: true
        });
        this.spotStrategyService = SpotStrategyService.getInstance();
        this.mathStrategyService = new MathStrategyService();
        // Ensure directories and meta files exist
        this.ensureDir(this.CYCLES_DIR);
        this.ensureDir(this.EXEC_DIR);
        this.initMetaIfMissing(this.CYCLES_META);
        this.initMetaIfMissing(this.EXEC_META);

        // Clear legacy in-memory file if present and load latest page to memory
        this.clearLegacyCycleHistoryIfAny();
        this.loadLatestCyclesPageToMemory();
    }

    /**
     * Ensure directory exists
     */
    private ensureDir(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Initialize meta file if missing
     */
    private initMetaIfMissing(metaPath: string): void {
        if (!fs.existsSync(metaPath)) {
            const initial = { lastId: 0, totalCount: 0 };
            fs.writeFileSync(metaPath, JSON.stringify(initial, null, 2));
        }
    }

    /**
     * Read meta (lastId, totalCount)
     */
    private readMeta(metaPath: string): { lastId: number; totalCount: number } {
        try {
            const raw = fs.readFileSync(metaPath, 'utf8');
            return JSON.parse(raw);
        } catch {
            return { lastId: 0, totalCount: 0 };
        }
    }

    /**
     * Write meta
     */
    private writeMeta(metaPath: string, meta: { lastId: number; totalCount: number }): void {
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    }

    /**
     * Clear legacy cycle-history.json and in-memory cache
     */
    private clearLegacyCycleHistoryIfAny(): void {
        try {
            const legacyPath = path.join(__dirname, '../../data/cycle-history.json');
            if (fs.existsSync(legacyPath)) {
                fs.unlinkSync(legacyPath);
                console.log('🧹 [CYCLE HISTORY] Histórico legado removido (cycle-history.json)');
            }
            this.cycleHistory = [];
        } catch (e) {
            console.warn('⚠️ [CYCLE HISTORY] Falha ao limpar histórico legado:', e);
        }
    }

    /**
     * Load latest 20 cycles page into in-memory cycleHistory (most recent first)
     */
    private loadLatestCyclesPageToMemory(): void {
        const pageData = this.getCyclesPageSync(1, 20);
        this.cycleHistory = pageData.items;
        // Note: currentCycle is managed by executeAnalysisCycle, not here
    }

    /**
     * Busca os favoritos do sistema simples
     */
    private getSimpleFavorites(): string[] {
        try {
            const favoritesFile = path.join(process.cwd(), 'data', 'spot-favorites.json');
            if (fs.existsSync(favoritesFile)) {
                const data = fs.readFileSync(favoritesFile, 'utf8');
                const favorites = JSON.parse(data);
                console.log(`⭐ [ANÁLISE] Favoritos simples encontrados: ${favorites.length}`, favorites);
                return favorites;
            } else {
                console.log(`📝 [ANÁLISE] Nenhum arquivo de favoritos simples encontrado`);
                return [];
            }
        } catch (error) {
            console.error(`❌ [ANÁLISE] Erro ao carregar favoritos simples:`, error);
            return [];
        }
    }

    /**
     * Busca estratégias favoritas (combinando sistema antigo e novo)
     */
    private getFavoriteStrategies(): SpotStrategy[] {
        // Buscar favoritos do sistema simples
        const simpleFavorites = this.getSimpleFavorites();

        // Buscar todas as estratégias
        const allStrategies = this.spotStrategyService.getAllStrategies();

        // Filtrar apenas as que estão nos favoritos simples
        const favoriteStrategies = allStrategies.filter(strategy =>
            simpleFavorites.includes(strategy.id)
        );

        console.log(`📊 [ANÁLISE] Total de estratégias: ${allStrategies.length}`);
        console.log(`⭐ [ANÁLISE] Favoritos simples: ${simpleFavorites.length}`);
        console.log(`✅ [ANÁLISE] Estratégias favoritas encontradas: ${favoriteStrategies.length}`);
        console.log(`📋 [ANÁLISE] IDs das estratégias favoritas:`, favoriteStrategies.map(s => s.id));

        return favoriteStrategies;
    }

    /**
     * Inicia análise rotativa spot
     */
    async startRotativeAnalysis(): Promise<{ success: boolean; message: string }> {
        try {
            if (this.isRunning) {
                return { success: false, message: 'Análise rotativa já está em execução' };
            }

            console.log(`🚀 [ROTATIVA SPOT] Iniciando análise rotativa spot...`);
            console.log(`⚙️ [ROTATIVA SPOT] Configuração: ${this.config.minSignalsRequired} sinais de ${this.config.minSignalStrength}% necessários`);

            this.isRunning = true;
            this.currentCycle = 0;

            // Executar primeiro ciclo imediatamente
            await this.executeAnalysisCycle();

            // Configurar intervalo para próximos ciclos
            this.analysisInterval = setInterval(async () => {
                console.log(`🔄 [TIMER] Executando próximo ciclo... (isRunning: ${this.isRunning})`);
                if (this.isRunning) {
                    await this.executeAnalysisCycle();
                } else {
                    console.log(`⚠️ [TIMER] Análise não está rodando, pulando ciclo`);
                }
            }, this.config.cycleIntervalMs);

            return { success: true, message: 'Análise rotativa spot iniciada com sucesso' };
        } catch (error) {
            console.error(`❌ [ROTATIVA SPOT] Erro ao iniciar análise rotativa:`, error);
            this.isRunning = false;
            return { success: false, message: 'Erro ao iniciar análise rotativa: ' + error.message };
        }
    }

    /**
     * Para análise rotativa spot
     */
    async stopRotativeAnalysis(): Promise<{ success: boolean; message: string }> {
        try {
            if (!this.isRunning) {
                return { success: false, message: 'Análise rotativa não está em execução' };
            }

            console.log(`🛑 [ROTATIVA SPOT] Parando análise rotativa spot...`);

            this.isRunning = false;

            if (this.analysisInterval) {
                clearInterval(this.analysisInterval);
                this.analysisInterval = null;
            }

            return { success: true, message: 'Análise rotativa spot parada com sucesso' };
        } catch (error) {
            console.error(`❌ [ROTATIVA SPOT] Erro ao parar análise rotativa:`, error);
            return { success: false, message: 'Erro ao parar análise rotativa: ' + error.message };
        }
    }

    /**
     * Executa um ciclo de análise
     */
    private async executeAnalysisCycle(): Promise<void> {
        try {
            // Determine next sequential cycle id from disk meta
            const cycleMeta = this.readMeta(this.CYCLES_META);
            const nextId = cycleMeta.lastId + 1;
            this.currentCycle = nextId;
            const cycleStartTime = new Date().toISOString();

            console.log(`\n🔄 [CICLO ${this.currentCycle}] Iniciando análise rotativa spot - ${cycleStartTime}`);

            // Executar análise simples
            const analysisResult = await this.generateSignalsTable();

            // Analisar sinais e executar posições
            const executionResult = await this.analyzeAndExecutePositions(analysisResult);

            // Criar resumo do ciclo
            const cycleSummary: CycleSummary = {
                cycleNumber: this.currentCycle,
                timestamp: cycleStartTime,
                signalsGenerated: executionResult.signalsGenerated,
                executionsPerformed: executionResult.executionsPerformed,
                signalsByMarket: executionResult.signalsByMarket,
                table: analysisResult
            };

            // Persist single cycle to disk with sequential filename
            this.saveCycleToDisk(nextId, cycleSummary);

            // Update meta
            this.writeMeta(this.CYCLES_META, { lastId: nextId, totalCount: cycleMeta.totalCount + 1 });

            // Refresh in-memory latest page (most recent first)
            this.loadLatestCyclesPageToMemory();

            // Atualizar última atualização
            this.lastUpdate = cycleStartTime;

            console.log(`✅ [CICLO ${this.currentCycle}] Análise concluída - ${executionResult.signalsGenerated} sinais, ${executionResult.executionsPerformed} execuções`);

        } catch (error) {
            console.error(`❌ [CICLO ${this.currentCycle}] Erro no ciclo de análise:`, error);
            console.log(`🔍 [DEBUG] isRunning após erro: ${this.isRunning}`);
        }
    }

    /**
     * Analisa sinais e executa posições spot
     */
    private async analyzeAndExecutePositions(signalsTable: SpotSignalsTable[]): Promise<{
        signalsGenerated: number;
        executionsPerformed: number;
        signalsByMarket: { [market: string]: number };
    }> {
        let totalSignals = 0;
        let totalExecutions = 0;
        const signalsByMarket: { [market: string]: number } = {};

        console.log(`🔍 [EXECUÇÃO] Analisando sinais para execução...`);
        console.log(`⚙️ [CONFIG] Sinais necessários: ${this.config.minSignalsRequired}`);
        console.log(`⚙️ [CONFIG] Força mínima: ${this.config.minSignalStrength}%`);

        for (const marketData of signalsTable) {
            const market = marketData.market;
            let marketSignals = 0;

            console.log(`\n📊 [${market}] Analisando sinais:`);

            // Contar sinais de 90%+ para este mercado
            for (const [strategyId, strategySignals] of Object.entries(marketData.strategies)) {
                const timeframes = ['timeframe1m', 'timeframe3m', 'timeframe5m'];

                for (const timeframe of timeframes) {
                    const signal = strategySignals[timeframe];
                    if (signal) {
                        console.log(`  📊 ${strategyId} ${timeframe}: ${signal.strength.toFixed(1)}% ${signal.strength >= this.config.minSignalStrength ? '✅' : '❌'}`);
                        if (signal.strength >= this.config.minSignalStrength) {
                            marketSignals++;
                            totalSignals++;
                        }
                    }
                }
            }

            signalsByMarket[market] = marketSignals;
            console.log(`📈 [${market}] Total de sinais ${this.config.minSignalStrength}%+: ${marketSignals}`);

            // Verificar se tem sinais suficientes para executar
            if (marketSignals >= this.config.minSignalsRequired) {
                console.log(`🎯 [${market}] SINAL DE EXECUÇÃO! ${marketSignals} sinais >= ${this.config.minSignalsRequired} necessários`);

                // Coletar sinais que geraram a execução
                const executionSignals: any[] = [];
                for (const [strategyId, strategySignals] of Object.entries(marketData.strategies)) {
                    const timeframes = ['timeframe1m', 'timeframe3m', 'timeframe5m'];
                    for (const timeframe of timeframes) {
                        const signal = strategySignals[timeframe];
                        if (signal && signal.strength >= this.config.minSignalStrength) {
                            executionSignals.push({
                                strategy: strategyId,
                                timeframe: timeframe,
                                strength: signal.strength
                            });
                        }
                    }
                }

                // Executar posição spot
                const executionResult = await this.executeSpotPosition(market, executionSignals);
                if (executionResult.success) {
                    totalExecutions++;
                    console.log(`💰 [${market}] Posição spot executada com sucesso!`);
                } else {
                    console.log(`❌ [${market}] Falha na execução: ${executionResult.message}`);
                }
            } else {
                console.log(`⏳ [${market}] Aguardando mais sinais (${marketSignals}/${this.config.minSignalsRequired})`);
            }
        }

        return {
            signalsGenerated: totalSignals,
            executionsPerformed: totalExecutions,
            signalsByMarket
        };
    }

    /**
     * Executa posição spot
     */
    private async executeSpotPosition(market: string, signals: any[] = []): Promise<{ success: boolean; message: string; executionDetails?: any }> {
        try {
            console.log(`\n🚀 ===== INICIANDO EXECUÇÃO SPOT =====`);
            console.log(`📊 [EXECUÇÃO] Mercado: ${market}`);
            console.log(`⏰ [EXECUÇÃO] Timestamp: ${new Date().toISOString()}`);

            // Obter estratégia matemática ativa
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();
            if (!activeMathStrategy) {
                console.log(`❌ [EXECUÇÃO] ERRO: Nenhuma estratégia matemática ativa`);
                return { success: false, message: 'Nenhuma estratégia matemática ativa' };
            }

            console.log(`💰 [EXECUÇÃO] Estratégia Matemática: ${activeMathStrategy.name}`);
            console.log(`💵 [EXECUÇÃO] Valor da Posição: $${activeMathStrategy.betAmount}`);

            // Obter preço atual do mercado
            console.log(`📈 [EXECUÇÃO] Obtendo preço atual de ${market}...`);
            const currentPrice = await this.binanceService.getCurrentPrice(market);
            if (!currentPrice) {
                console.log(`❌ [EXECUÇÃO] ERRO: Não foi possível obter preço de ${market}`);
                return { success: false, message: `Não foi possível obter preço de ${market}` };
            }
            console.log(`💲 [EXECUÇÃO] Preço Atual: $${currentPrice.toFixed(8)}`);

            // Calcular quantidade da moeda
            const quantity = activeMathStrategy.betAmount / currentPrice;
            console.log(`📊 [EXECUÇÃO] Quantidade Calculada: ${quantity.toFixed(8)} ${market.replace('USDT', '')}`);

            // Executar ordem de compra na Binance
            console.log(`🔄 [EXECUÇÃO] Executando ordem de compra na Binance...`);

            // Usar uma quantidade mínima para teste (0.001 BTC)
            const testQuantity = Math.max(0.001, quantity);
            console.log(`📊 [EXECUÇÃO] Quantidade para teste: ${testQuantity.toFixed(8)}`);

            const orderResult = await this.binanceService.placeOrder({
                symbol: market,
                side: 'BUY',
                type: 'MARKET',
                quantity: testQuantity.toFixed(8)
            });

            console.log(`📋 [EXECUÇÃO] Resultado da ordem:`, JSON.stringify(orderResult, null, 2));

            if (orderResult.success) {
                console.log(`✅ [EXECUÇÃO] ORDEM EXECUTADA COM SUCESSO!`);
                console.log(`📋 [EXECUÇÃO] Order ID: ${orderResult.data?.orderId || 'N/A'}`);
                console.log(`💵 [EXECUÇÃO] Valor Investido: $${activeMathStrategy.betAmount}`);
                console.log(`📊 [EXECUÇÃO] Quantidade Comprada: ${quantity.toFixed(8)} ${market.replace('USDT', '')}`);
                console.log(`💲 [EXECUÇÃO] Preço de Execução: $${currentPrice.toFixed(8)}`);
                console.log(`💰 [EXECUÇÃO] Valor Final em Moeda: ${quantity.toFixed(8)} ${market.replace('USDT', '')}`);
                console.log(`💵 [EXECUÇÃO] Valor Final em USD: $${(quantity * currentPrice).toFixed(2)}`);
                console.log(`🚀 ===== EXECUÇÃO CONCLUÍDA =====\n`);

                // Obter configurações de stop win/loss da estratégia matemática
                const mathStrategies = await this.mathStrategyService.getAllStrategies();
                const activeMathStrategyConfig = mathStrategies.find(s => s.isActive);

                // Adicionar à lista de execuções emitidas
                await this.addEmittedSignal({
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    market: market,
                    signals: signals,
                    positionValue: activeMathStrategy.betAmount,
                    status: 'executed',
                    executionDetails: {
                        orderId: orderResult.data?.orderId,
                        quantity: quantity,
                        price: currentPrice,
                        finalValueUSD: quantity * currentPrice
                    },
                    stopWinLoss: {
                        takeProfitPercentage: activeMathStrategyConfig?.takeProfitPercentage || 80,
                        stopLossPercentage: activeMathStrategyConfig?.stopLossPercentage || 40,
                        takeProfitPrice: currentPrice * (1 + (activeMathStrategyConfig?.takeProfitPercentage || 80) / 100),
                        stopLossPrice: currentPrice * (1 - (activeMathStrategyConfig?.stopLossPercentage || 40) / 100)
                    }
                });

                return {
                    success: true,
                    message: `Posição spot executada: ${market} - $${activeMathStrategy.betAmount}`,
                    executionDetails: {
                        orderId: orderResult.data?.orderId,
                        quantity: quantity,
                        price: currentPrice,
                        finalValueUSD: quantity * currentPrice
                    }
                };
            } else {
                console.log(`❌ [EXECUÇÃO] ERRO NA ORDEM: ${orderResult.message}`);
                console.log(`🚀 ===== EXECUÇÃO FALHOU =====\n`);
                return { success: false, message: `Erro na ordem: ${orderResult.message}` };
            }

        } catch (error) {
            console.error(`❌ [EXECUÇÃO] ERRO GERAL:`, error);
            console.log(`🚀 ===== EXECUÇÃO FALHOU =====\n`);
            return { success: false, message: 'Erro na execução: ' + error.message };
        }
    }

    /**
     * Gera tabela de sinais multi-timeframe
     */
    async generateSignalsTable(): Promise<SpotSignalsTable[]> {
        try {
            console.log('🎯 Iniciando análise multi-timeframe...');

            const favoriteStrategies = this.getFavoriteStrategies();
            console.log(`📊 [ANÁLISE] Estratégias favoritas encontradas: ${favoriteStrategies.length}`);
            console.log(`📋 [ANÁLISE] IDs das estratégias favoritas:`, favoriteStrategies.map(s => s.id));

            let favoriteMarkets = await this.getFavoriteSymbols();
            console.log(`📊 [ANÁLISE] Mercados favoritos encontrados: ${favoriteMarkets.length}`);
            console.log(`📋 [ANÁLISE] Mercados favoritos:`, favoriteMarkets);

            // Se não há mercados favoritos, usar lista padrão
            if (favoriteMarkets.length === 0) {
                console.log('⚠️ [ANÁLISE] Nenhum mercado favorito encontrado, usando lista padrão');
                favoriteMarkets = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'LINKUSDT', 'BNBUSDT'];
            }

            if (favoriteStrategies.length === 0) {
                console.log('⚠️ [ANÁLISE] Nenhuma estratégia favorita encontrada');
                return [];
            }

            const signalsTable: SpotSignalsTable[] = [];

            for (const market of favoriteMarkets) {
                console.log(`\n📊 [${market}] Analisando mercado...`);

                const marketSignals: { [strategyId: string]: MultiTimeframeSignal } = {};

                for (const strategy of favoriteStrategies) {
                    console.log(`🎯 [${market}] Processando estratégia: ${strategy.name}`);

                    const multiTimeframeSignal = await this.calculateMultiTimeframeSignalStrength(strategy, market);
                    marketSignals[strategy.id] = multiTimeframeSignal;
                }

                signalsTable.push({
                    market,
                    strategies: marketSignals
                });
            }

            this.signalsTable = signalsTable;
            console.log(`✅ [ANÁLISE] Tabela de sinais gerada com ${signalsTable.length} mercados`);

            return signalsTable;
        } catch (error) {
            console.error('❌ Erro ao gerar tabela de sinais:', error);
            throw error;
        }
    }

    /**
     * Calcula força do sinal multi-timeframe
     */
    private async calculateMultiTimeframeSignalStrength(strategy: SpotStrategy, market: string): Promise<MultiTimeframeSignal> {
        try {
            // Obter dados para cada timeframe
            const candles1m = await this.getKlinesData(market, '1m', 30);
            const candles3m = await this.getKlinesData(market, '3m', 60);
            const candles5m = await this.getKlinesData(market, '5m', 90);

            // Calcular sinais para cada timeframe
            const signal1m = await this.calculateStrategySignal(strategy, candles1m, '1m');
            const signal3m = await this.calculateStrategySignal(strategy, candles3m, '3m');
            const signal5m = await this.calculateStrategySignal(strategy, candles5m, '5m');

            // Determinar o sinal mais forte
            const signals = [
                { timeframe: '1m', strength: signal1m.strength },
                { timeframe: '3m', strength: signal3m.strength },
                { timeframe: '5m', strength: signal5m.strength }
            ];

            const strongest = signals.reduce((max, current) =>
                current.strength > max.strength ? current : max
            );

            return {
                timeframe1m: { strength: signal1m.strength, diagnostics: signal1m.diagnostics },
                timeframe3m: { strength: signal3m.strength, diagnostics: signal3m.diagnostics },
                timeframe5m: { strength: signal5m.strength, diagnostics: signal5m.diagnostics },
                strongest: { timeframe: strongest.timeframe, strength: strongest.strength }
            };
        } catch (error) {
            console.error(`❌ Erro ao calcular sinal multi-timeframe para ${strategy.name} em ${market}:`, error);
            throw error;
        }
    }

    /**
     * Obtém dados de klines da Binance
     */
    private async getKlinesData(symbol: string, interval: string, limit: number): Promise<CandleData[]> {
        try {
            console.log(`📊 [KLINES] Obtendo ${limit} velas de ${symbol} ${interval}...`);
            const klines = await this.binanceService.getKlines(symbol, interval, limit);
            console.log(`📊 [KLINES] Recebidas ${klines.length} velas para ${symbol} ${interval}`);

            const candles = klines.map(kline => ({
                open: parseFloat(kline.open),
                high: parseFloat(kline.high),
                low: parseFloat(kline.low),
                close: parseFloat(kline.close),
                volume: parseFloat(kline.volume),
                timestamp: kline.openTime
            }));

            // Debug: mostrar primeiros dados
            if (candles.length > 0) {
                console.log(`🔍 [DEBUG] Primeira vela ${symbol} ${interval}:`, {
                    open: candles[0].open,
                    high: candles[0].high,
                    low: candles[0].low,
                    close: candles[0].close,
                    volume: candles[0].volume,
                    isCloseValid: !isNaN(candles[0].close) && candles[0].close > 0
                });
            }

            // Verificar se há dados válidos
            const validCandles = candles.filter(c => !isNaN(c.close) && c.close > 0);
            console.log(`📊 [KLINES] ${validCandles.length} velas válidas de ${candles.length} total para ${symbol} ${interval}`);

            if (validCandles.length === 0) {
                console.warn(`⚠️ [KLINES] Nenhuma vela válida para ${symbol} ${interval}`);
                // Debug: mostrar por que as velas são inválidas
                if (candles.length > 0) {
                    const invalidCandles = candles.filter(c => isNaN(c.close) || c.close <= 0);
                    console.log(`🔍 [DEBUG] Velas inválidas:`, invalidCandles.slice(0, 3));
                }
            }

            return validCandles;
        } catch (error) {
            console.error(`❌ Erro ao obter klines para ${symbol} ${interval}:`, error);
            throw error;
        }
    }

    /**
     * Calcula sinal da estratégia para timeframe específico
     */
    private async calculateStrategySignal(strategy: SpotStrategy, candles: CandleData[], timeframe: string): Promise<{ strength: number, diagnostics: string }> {
        console.log(`🎯 [${timeframe.toUpperCase()}] Calculando sinal para ${strategy.name}...`);

        let signalStrength = 0;
        let diagnostics = '';

        // Estratégias específicas por timeframe e quantidade de velas
        switch (strategy.id) {
            case 'spot_rsi_momentum_001':
                if (timeframe === '1m' && candles.length === 30) {
                    const rsiResult = this.calculateRSIMomentum1mScalping(candles);
                    signalStrength = rsiResult.strength;
                    diagnostics = rsiResult.diagnostics;
                } else if (timeframe === '3m' && candles.length === 60) {
                    const rsiResult = this.calculateRSIMomentum3mTrend(candles);
                    signalStrength = rsiResult.strength;
                    diagnostics = rsiResult.diagnostics;
                } else if (timeframe === '5m' && candles.length === 90) {
                    const rsiResult = this.calculateRSIMomentum5mLongTerm(candles);
                    signalStrength = rsiResult.strength;
                    diagnostics = rsiResult.diagnostics;
                } else {
                    const rsiResult = this.calculateRSIMomentumStrengthWithDiagnostics(candles);
                    signalStrength = rsiResult.strength;
                    diagnostics = rsiResult.diagnostics;
                }
                break;
            case 'spot_bollinger_squeeze_002':
                if (timeframe === '1m' && candles.length === 30) {
                    const bbResult = this.calculateBollingerSqueeze1mBreakout(candles);
                    signalStrength = bbResult.strength;
                    diagnostics = bbResult.diagnostics;
                } else if (timeframe === '3m' && candles.length === 60) {
                    const bbResult = this.calculateBollingerSqueeze3mModerate(candles);
                    signalStrength = bbResult.strength;
                    diagnostics = bbResult.diagnostics;
                } else if (timeframe === '5m' && candles.length === 90) {
                    const bbResult = this.calculateBollingerSqueeze5mLong(candles);
                    signalStrength = bbResult.strength;
                    diagnostics = bbResult.diagnostics;
                } else {
                    const bbResult = this.calculateBollingerSqueezeStrengthWithDiagnostics(candles);
                    signalStrength = bbResult.strength;
                    diagnostics = bbResult.diagnostics;
                }
                break;
            case 'spot_macd_crossover_003':
                if (timeframe === '1m' && candles.length === 30) {
                    const macdResult = this.calculateMACDCrossover1mScalping(candles);
                    signalStrength = macdResult.strength;
                    diagnostics = macdResult.diagnostics;
                } else if (timeframe === '3m' && candles.length === 60) {
                    const macdResult = this.calculateMACDCrossover3mTrend(candles);
                    signalStrength = macdResult.strength;
                    diagnostics = macdResult.diagnostics;
                } else if (timeframe === '5m' && candles.length === 90) {
                    const macdResult = this.calculateMACDCrossover5mLongTerm(candles);
                    signalStrength = macdResult.strength;
                    diagnostics = macdResult.diagnostics;
                } else {
                    const macdResult = this.calculateMACDCrossoverStrengthWithDiagnostics(candles);
                    signalStrength = macdResult.strength;
                    diagnostics = macdResult.diagnostics;
                }
                break;
            case 'spot_volume_breakout_004':
                if (timeframe === '1m' && candles.length === 30) {
                    const volumeResult = this.calculateVolumeBreakout1mScalping(candles);
                    signalStrength = volumeResult.strength;
                    diagnostics = volumeResult.diagnostics;
                } else if (timeframe === '3m' && candles.length === 60) {
                    const volumeResult = this.calculateVolumeBreakout3mTrend(candles);
                    signalStrength = volumeResult.strength;
                    diagnostics = volumeResult.diagnostics;
                } else if (timeframe === '5m' && candles.length === 90) {
                    const volumeResult = this.calculateVolumeBreakout5mLongTerm(candles);
                    signalStrength = volumeResult.strength;
                    diagnostics = volumeResult.diagnostics;
                } else {
                    const volumeResult = this.calculateVolumeBreakoutStrengthWithDiagnostics(candles);
                    signalStrength = volumeResult.strength;
                    diagnostics = volumeResult.diagnostics;
                }
                break;
            default:
                // Estratégia padrão
                const defaultResult = this.calculateDefaultStrategy(candles);
                signalStrength = defaultResult.strength;
                diagnostics = defaultResult.diagnostics;
                break;
        }

        return { strength: signalStrength, diagnostics };
    }

    // Métodos de cálculo das estratégias (implementações existentes)
    private calculateRSIMomentum1mScalping(candles: CandleData[]): { strength: number, diagnostics: string } {
        // Implementação existente
        const rsi = this.calculateRSI(candles, 14);
        const momentum = this.calculateMomentum(candles, 5);
        const strength = Math.min(100, Math.max(0, (rsi + momentum) / 2));
        return {
            strength: Math.round(strength),
            diagnostics: `RSI Momentum: ${Math.round(strength)}% - Análise de momentum com RSI`
        };
    }

    private calculateRSIMomentum3mTrend(candles: CandleData[]): { strength: number, diagnostics: string } {
        const rsi = this.calculateRSI(candles, 14);
        const momentum = this.calculateMomentum(candles, 10);
        const strength = Math.min(100, Math.max(0, (rsi + momentum) / 2));
        return {
            strength: Math.round(strength),
            diagnostics: `RSI Momentum: ${Math.round(strength)}% - Análise de momentum com RSI`
        };
    }

    private calculateRSIMomentum5mLongTerm(candles: CandleData[]): { strength: number, diagnostics: string } {
        const rsi = this.calculateRSI(candles, 14);
        const momentum = this.calculateMomentum(candles, 20);
        const strength = Math.min(100, Math.max(0, (rsi + momentum) / 2));
        return {
            strength: Math.round(strength),
            diagnostics: `RSI Momentum: ${Math.round(strength)}% - Análise de momentum com RSI`
        };
    }

    private calculateRSIMomentumStrengthWithDiagnostics(candles: CandleData[]): { strength: number, diagnostics: string } {
        const rsi = this.calculateRSI(candles, 14);
        const momentum = this.calculateMomentum(candles, 5);
        const strength = Math.min(100, Math.max(0, (rsi + momentum) / 2));
        return {
            strength: Math.round(strength),
            diagnostics: `RSI Momentum: ${Math.round(strength)}% - Análise de momentum com RSI`
        };
    }

    private calculateBollingerSqueeze1mBreakout(candles: CandleData[]): { strength: number, diagnostics: string } {
        const bb = this.calculateBollingerBands(candles, 20, 2);
        const squeeze = this.calculateBollingerSqueeze(candles, bb);
        const strength = Math.min(100, Math.max(0, squeeze * 100));
        return {
            strength: Math.round(strength * 100) / 100,
            diagnostics: 'Bollinger Squeeze - Placeholder'
        };
    }

    private calculateBollingerSqueeze3mModerate(candles: CandleData[]): { strength: number, diagnostics: string } {
        const bb = this.calculateBollingerBands(candles, 20, 2);
        const squeeze = this.calculateBollingerSqueeze(candles, bb);
        const strength = Math.min(100, Math.max(0, squeeze * 100));
        return {
            strength: Math.round(strength * 100) / 100,
            diagnostics: 'Bollinger Squeeze - Placeholder'
        };
    }

    private calculateBollingerSqueeze5mLong(candles: CandleData[]): { strength: number, diagnostics: string } {
        const bb = this.calculateBollingerBands(candles, 20, 2);
        const squeeze = this.calculateBollingerSqueeze(candles, bb);
        const strength = Math.min(100, Math.max(0, squeeze * 100));
        return {
            strength: Math.round(strength * 100) / 100,
            diagnostics: 'Bollinger Squeeze - Placeholder'
        };
    }

    private calculateBollingerSqueezeStrengthWithDiagnostics(candles: CandleData[]): { strength: number, diagnostics: string } {
        const bb = this.calculateBollingerBands(candles, 20, 2);
        const squeeze = this.calculateBollingerSqueeze(candles, bb);
        const strength = Math.min(100, Math.max(0, squeeze * 100));
        return {
            strength: Math.round(strength * 100) / 100,
            diagnostics: 'Bollinger Squeeze - Placeholder'
        };
    }

    private calculateDefaultStrategy(candles: CandleData[]): { strength: number, diagnostics: string } {
        const rsi = this.calculateRSI(candles, 14);
        const strength = Math.min(100, Math.max(0, rsi));
        return {
            strength: Math.round(strength),
            diagnostics: `Estratégia Padrão: ${Math.round(strength)}%`
        };
    }

    // Métodos auxiliares de cálculo (implementações existentes)
    private calculateRSI(candles: CandleData[], period: number): number {
        if (candles.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = candles[i].close - candles[i - 1].close;
            if (change > 0) gains += change;
            else losses -= change;
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    private calculateMomentum(candles: CandleData[], period: number): number {
        if (candles.length < period) return 0;

        const current = candles[candles.length - 1].close;
        const past = candles[candles.length - period].close;

        return ((current - past) / past) * 100;
    }

    private calculateBollingerBands(candles: CandleData[], period: number, stdDev: number): { upper: number[], middle: number[], lower: number[] } {
        const closes = candles.map(c => c.close);
        const sma = this.calculateSMA(closes, period);
        const std = this.calculateStandardDeviation(closes, period);

        return {
            upper: sma.map((val, i) => val + (std[i] * stdDev)),
            middle: sma,
            lower: sma.map((val, i) => val - (std[i] * stdDev))
        };
    }

    private calculateBollingerSqueeze(candles: CandleData[], bb: { upper: number[], middle: number[], lower: number[] }): number {
        if (bb.upper.length === 0) return 0;

        const lastUpper = bb.upper[bb.upper.length - 1];
        const lastLower = bb.lower[bb.lower.length - 1];
        const lastMiddle = bb.middle[bb.middle.length - 1];

        const bandWidth = (lastUpper - lastLower) / lastMiddle;
        return Math.min(1, Math.max(0, bandWidth * 10));
    }

    private calculateSMA(values: number[], period: number): number[] {
        const result: number[] = [];
        for (let i = period - 1; i < values.length; i++) {
            const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / period);
        }
        return result;
    }

    private calculateStandardDeviation(values: number[], period: number): number[] {
        const result: number[] = [];
        for (let i = period - 1; i < values.length; i++) {
            const slice = values.slice(i - period + 1, i + 1);
            const mean = slice.reduce((a, b) => a + b, 0) / period;
            const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
            result.push(Math.sqrt(variance));
        }
        return result;
    }

    /**
     * Obtém status da análise rotativa
     */
    async getRotativeAnalysisStatus(favoriteMarkets?: string[]): Promise<{
        isRunning: boolean;
        currentCycle: number;
        totalCycles: number;
        totalSignals: number;
        totalExecutions: number;
        lastUpdate: string;
        config: RotativeAnalysisConfig;
        cycleHistory: CycleSummary[];
        currentTable: SpotSignalsTable[];
        tradingStrategies: string[];
        favoriteSymbols: string[];
        mathStrategy: string;
    }> {
        const totalSignals = this.cycleHistory.reduce((sum, cycle) => sum + cycle.signalsGenerated, 0);
        const totalExecutions = this.cycleHistory.reduce((sum, cycle) => sum + cycle.executionsPerformed, 0);

        // Atualizar mercados favoritos se fornecidos
        if (favoriteMarkets && favoriteMarkets.length > 0) {
            this.favoriteSymbols = favoriteMarkets;
            console.log('📊 [STATUS] Mercados favoritos atualizados:', this.favoriteSymbols);
        }

        // Obter estratégias favoritas
        const favoriteStrategies = this.getFavoriteStrategies();
        const tradingStrategies = favoriteStrategies.map(s => s.name);

        // Obter mercados favoritos
        const favoriteSymbols = await this.getFavoriteSymbols();

        // Obter estratégia matemática ativa
        const mathStrategy = await this.getActiveMathStrategy();

        const cyclesMeta = this.readMeta(this.CYCLES_META);
        return {
            isRunning: this.isRunning,
            currentCycle: this.currentCycle,
            totalCycles: cyclesMeta.totalCount,
            totalSignals,
            totalExecutions,
            lastUpdate: this.lastUpdate,
            config: this.config,
            // latest 20 most recent cycles
            cycleHistory: this.cycleHistory,
            currentTable: this.signalsTable,
            tradingStrategies,
            favoriteSymbols,
            mathStrategy
        };
    }


    /**
     * Obtém mercados favoritos
     */
    private async getFavoriteSymbols(): Promise<string[]> {
        try {
            // Lista padrão de mercados válidos na Binance Testnet
            const defaultMarkets = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'LINKUSDT', 'BNBUSDT'];

            // Tentar obter mercados favoritos do status da análise
            // O frontend envia os mercados favoritos via favoriteSymbols
            if (this.favoriteSymbols && this.favoriteSymbols.length > 0) {
                console.log('📊 [FAVORITES] Usando mercados favoritos do frontend:', this.favoriteSymbols);
                return this.favoriteSymbols;
            }

            console.log('📊 [FAVORITES] Nenhum mercado favorito do frontend, usando lista padrão:', defaultMarkets);
            return defaultMarkets;
        } catch (error) {
            console.error('❌ [FAVORITES] Erro ao obter mercados favoritos:', error);
            return ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'LINKUSDT', 'BNBUSDT'];
        }
    }

    /**
     * Obtém lista de sinais emitidos
     */
    async getEmittedSignals(): Promise<any[]> {
        // default to page 1, 20 most recent
        const page = this.getExecutionsPageSync(1, 20);
        return page.items;
    }

    /**
     * Public: get executions paginated
     */
    async getExecutionsPage(page: number, pageSize: number): Promise<{ items: any[]; total: number; page: number; pageSize: number }> {
        return this.getExecutionsPageSync(page, pageSize);
    }

    /**
     * Public: get cycles paginated
     */
    async getCyclesPage(page: number, pageSize: number): Promise<{ items: CycleSummary[]; total: number; page: number; pageSize: number }> {
        return this.getCyclesPageSync(page, pageSize);
    }

    /**
     * Adiciona um sinal emitido
     */
    private async addEmittedSignal(signal: any): Promise<void> {
        try {
            // Persist each execution as a separate file with sequential ID
            const meta = this.readMeta(this.EXEC_META);
            const nextId = meta.lastId + 1;
            const filename = path.join(this.EXEC_DIR, `execution-${String(nextId).padStart(8, '0')}.json`);
            const enriched = { id: nextId, ...signal };
            fs.writeFileSync(filename, JSON.stringify(enriched, null, 2));
            this.writeMeta(this.EXEC_META, { lastId: nextId, totalCount: meta.totalCount + 1 });

            // Keep a small in-memory cache of latest 100 for quick UI updates
            this.emittedSignals.unshift(enriched);
            if (this.emittedSignals.length > 100) {
                this.emittedSignals = this.emittedSignals.slice(0, 100);
            }

            // Registrar triggers de stop win/loss se disponíveis
            if (signal.stopWinLoss && signal.executionDetails?.orderId) {
                try {
                    const { triggerStorage } = await import('../trigger-storage');

                    // Criar trigger com Take Profit e Stop Loss
                    triggerStorage.saveTrigger({
                        executionId: nextId.toString(),
                        symbol: signal.market,
                        quantity: signal.executionDetails.quantity,
                        buyPrice: signal.executionDetails.price,
                        profitTrigger: signal.stopWinLoss.takeProfitPrice,
                        lossTrigger: signal.stopWinLoss.stopLossPrice,
                        isActive: true
                    });

                    console.log(`🎯 [TRIGGERS] Triggers criados para execução ${nextId}: TP=${signal.stopWinLoss.takeProfitPrice.toFixed(8)}, SL=${signal.stopWinLoss.stopLossPrice.toFixed(8)}`);
                } catch (triggerError) {
                    console.error('❌ [TRIGGERS] Erro ao criar triggers:', triggerError);
                }
            }
        } catch (error) {
            console.error('❌ [SIGNALS] Erro ao adicionar sinal emitido:', error);
            console.error('❌ [SIGNALS] Signal data:', JSON.stringify(signal, null, 2));
        }
    }

    /**
     * Salva sinais emitidos em arquivo
     */
    private async saveEmittedSignals(): Promise<void> { /* deprecated - kept for compatibility */ }

    /**
     * Carrega histórico de ciclos do arquivo
     */
    private loadCycleHistory(): void { /* deprecated - replaced by per-file paging */ }

    /**
     * Salva histórico de ciclos em arquivo
     */
    private async saveCycleHistory(): Promise<void> { /* deprecated - replaced by per-file saving */ }

    /**
     * Save a single cycle summary to disk with sequential name
     */
    private saveCycleToDisk(id: number, cycle: CycleSummary): void {
        const filename = path.join(this.CYCLES_DIR, `cycle-${String(id).padStart(8, '0')}.json`);
        fs.writeFileSync(filename, JSON.stringify(cycle, null, 2));
    }

    /**
     * Get paginated cycles (most recent first)
     */
    private getCyclesPageSync(page: number, pageSize: number): { items: CycleSummary[]; total: number; page: number; pageSize: number } {
        const meta = this.readMeta(this.CYCLES_META);
        const total = meta.totalCount;
        if (total === 0) return { items: [], total: 0, page, pageSize };

        const startId = meta.lastId - ((page - 1) * pageSize);
        const items: CycleSummary[] = [];
        for (let i = startId; i > 0 && items.length < pageSize; i--) {
            const fp = path.join(this.CYCLES_DIR, `cycle-${String(i).padStart(8, '0')}.json`);
            if (fs.existsSync(fp)) {
                try {
                    const raw = fs.readFileSync(fp, 'utf8');
                    items.push(JSON.parse(raw));
                } catch { }
            }
        }
        return { items, total, page, pageSize };
    }

    /**
     * Get paginated executions (most recent first)
     */
    private getExecutionsPageSync(page: number, pageSize: number): { items: any[]; total: number; page: number; pageSize: number } {
        const meta = this.readMeta(this.EXEC_META);
        const total = meta.totalCount;
        if (total === 0) return { items: [], total: 0, page, pageSize };

        const startId = meta.lastId - ((page - 1) * pageSize);
        const items: any[] = [];
        for (let i = startId; i > 0 && items.length < pageSize; i--) {
            const fp = path.join(this.EXEC_DIR, `execution-${String(i).padStart(8, '0')}.json`);
            if (fs.existsSync(fp)) {
                try {
                    const raw = fs.readFileSync(fp, 'utf8');
                    items.push(JSON.parse(raw));
                } catch { }
            }
        }
        return { items, total, page, pageSize };
    }

    /**
     * Método de teste para forçar execução
     */
    async testExecution(): Promise<{ success: boolean; message: string }> {
        try {
            console.log(`\n🧪 ===== TESTE DE EXECUÇÃO =====`);
            console.log(`⚙️ [CONFIG] Sinais necessários: ${this.config.minSignalsRequired}`);
            console.log(`⚙️ [CONFIG] Força mínima: ${this.config.minSignalStrength}%`);

            // Simular dados de teste
            const testSignals: any[] = [
                { strategy: 'spot_rsi_momentum_001', timeframe: 'timeframe1m', strength: 85 },
                { strategy: 'spot_rsi_momentum_001', timeframe: 'timeframe3m', strength: 75 },
                { strategy: 'spot_rsi_momentum_001', timeframe: 'timeframe5m', strength: 65 },
                { strategy: 'spot_macd_crossover_003', timeframe: 'timeframe1m', strength: 80 },
                { strategy: 'spot_macd_crossover_003', timeframe: 'timeframe3m', strength: 70 }
            ];

            console.log(`📊 [TESTE] Sinais de teste: ${testSignals.length}`);
            testSignals.forEach(signal => {
                console.log(`  📊 ${signal.strategy} ${signal.timeframe}: ${signal.strength}% ${signal.strength >= this.config.minSignalStrength ? '✅' : '❌'}`);
            });

            const validSignals = testSignals.filter(s => s.strength >= this.config.minSignalStrength);
            console.log(`📈 [TESTE] Sinais válidos (>=${this.config.minSignalStrength}%): ${validSignals.length}`);

            if (validSignals.length >= this.config.minSignalsRequired) {
                console.log(`🎯 [TESTE] SINAL DE EXECUÇÃO! ${validSignals.length} sinais >= ${this.config.minSignalsRequired} necessários`);

                // Simular execução
                const executionResult = await this.executeSpotPosition('BTCUSDT', validSignals);
                console.log(`🧪 ===== TESTE CONCLUÍDO =====\n`);

                return {
                    success: true,
                    message: `Teste executado: ${validSignals.length} sinais válidos, execução: ${executionResult.success ? 'SUCESSO' : 'FALHA'}`
                };
            } else {
                console.log(`⏳ [TESTE] Aguardando mais sinais (${validSignals.length}/${this.config.minSignalsRequired})`);
                console.log(`🧪 ===== TESTE CONCLUÍDO =====\n`);

                return {
                    success: true,
                    message: `Teste executado: ${validSignals.length} sinais válidos (insuficientes para execução)`
                };
            }
        } catch (error) {
            console.error(`❌ [TESTE] Erro no teste:`, error);
            return { success: false, message: 'Erro no teste: ' + error.message };
        }
    }

    // ===== MÉTODOS DE CÁLCULO MACD CROSSOVER =====

    private calculateMACDCrossover1mScalping(candles: CandleData[]): { strength: number, diagnostics: string } {
        const macd = this.calculateMACD(candles, 12, 26, 9);
        const signal = macd.signal;
        const histogram = macd.histogram;

        let strength = 0;
        let diagnostics = 'MACD 1m Scalping: ';

        if (macd.macd > signal && histogram > 0) {
            strength = Math.min(95, 60 + (histogram * 10));
            diagnostics += `${strength.toFixed(1)}% - Bullish crossover detectado`;
        } else if (macd.macd < signal && histogram < 0) {
            strength = Math.min(95, 60 + (Math.abs(histogram) * 10));
            diagnostics += `${strength.toFixed(1)}% - Bearish crossover detectado`;
        } else {
            strength = 20;
            diagnostics += `${strength.toFixed(1)}% - Sem sinal claro`;
        }

        return { strength, diagnostics };
    }

    private calculateMACDCrossover3mTrend(candles: CandleData[]): { strength: number, diagnostics: string } {
        const macd = this.calculateMACD(candles, 12, 26, 9);
        const signal = macd.signal;
        const histogram = macd.histogram;

        let strength = 0;
        let diagnostics = 'MACD 3m Trend: ';

        if (macd.macd > signal && histogram > 0) {
            strength = Math.min(90, 50 + (histogram * 8));
            diagnostics += `${strength.toFixed(1)}% - Tendência de alta confirmada`;
        } else if (macd.macd < signal && histogram < 0) {
            strength = Math.min(90, 50 + (Math.abs(histogram) * 8));
            diagnostics += `${strength.toFixed(1)}% - Tendência de baixa confirmada`;
        } else {
            strength = 25;
            diagnostics += `${strength.toFixed(1)}% - Tendência lateral`;
        }

        return { strength, diagnostics };
    }

    private calculateMACDCrossover5mLongTerm(candles: CandleData[]): { strength: number, diagnostics: string } {
        const macd = this.calculateMACD(candles, 12, 26, 9);
        const signal = macd.signal;
        const histogram = macd.histogram;

        let strength = 0;
        let diagnostics = 'MACD 5m Long: ';

        if (macd.macd > signal && histogram > 0) {
            strength = Math.min(85, 40 + (histogram * 6));
            diagnostics += `${strength.toFixed(1)}% - Momentum de alta sustentado`;
        } else if (macd.macd < signal && histogram < 0) {
            strength = Math.min(85, 40 + (Math.abs(histogram) * 6));
            diagnostics += `${strength.toFixed(1)}% - Momentum de baixa sustentado`;
        } else {
            strength = 30;
            diagnostics += `${strength.toFixed(1)}% - Momentum neutro`;
        }

        return { strength, diagnostics };
    }

    private calculateMACDCrossoverStrengthWithDiagnostics(candles: CandleData[]): { strength: number, diagnostics: string } {
        const macd = this.calculateMACD(candles, 12, 26, 9);
        const signal = macd.signal;
        const histogram = macd.histogram;

        let strength = 0;
        let diagnostics = 'MACD Crossover: ';

        if (macd.macd > signal && histogram > 0) {
            strength = Math.min(80, 45 + (histogram * 5));
            diagnostics += `${strength.toFixed(1)}% - Crossover bullish`;
        } else if (macd.macd < signal && histogram < 0) {
            strength = Math.min(80, 45 + (Math.abs(histogram) * 5));
            diagnostics += `${strength.toFixed(1)}% - Crossover bearish`;
        } else {
            strength = 35;
            diagnostics += `${strength.toFixed(1)}% - Sem crossover`;
        }

        return { strength, diagnostics };
    }

    // ===== MÉTODOS DE CÁLCULO VOLUME BREAKOUT =====

    private calculateVolumeBreakout1mScalping(candles: CandleData[]): { strength: number, diagnostics: string } {
        const volumeAnalysis = this.calculateVolumeAnalysis(candles, 10);
        const priceChange = this.calculatePriceChange(candles, 5);

        let strength = 0;
        let diagnostics = 'Volume 1m Scalping: ';

        if (volumeAnalysis.isHighVolume && priceChange > 0.5) {
            strength = Math.min(95, 70 + (volumeAnalysis.volumeRatio * 10));
            diagnostics += `${strength.toFixed(1)}% - Breakout com volume alto`;
        } else if (volumeAnalysis.isHighVolume && priceChange < -0.5) {
            strength = Math.min(95, 70 + (volumeAnalysis.volumeRatio * 10));
            diagnostics += `${strength.toFixed(1)}% - Breakdown com volume alto`;
        } else {
            strength = 25;
            diagnostics += `${strength.toFixed(1)}% - Volume insuficiente`;
        }

        return { strength, diagnostics };
    }

    private calculateVolumeBreakout3mTrend(candles: CandleData[]): { strength: number, diagnostics: string } {
        const volumeAnalysis = this.calculateVolumeAnalysis(candles, 20);
        const priceChange = this.calculatePriceChange(candles, 10);

        let strength = 0;
        let diagnostics = 'Volume 3m Trend: ';

        if (volumeAnalysis.isHighVolume && priceChange > 1.0) {
            strength = Math.min(90, 60 + (volumeAnalysis.volumeRatio * 8));
            diagnostics += `${strength.toFixed(1)}% - Tendência com volume confirmado`;
        } else if (volumeAnalysis.isHighVolume && priceChange < -1.0) {
            strength = Math.min(90, 60 + (volumeAnalysis.volumeRatio * 8));
            diagnostics += `${strength.toFixed(1)}% - Reversão com volume confirmado`;
        } else {
            strength = 30;
            diagnostics += `${strength.toFixed(1)}% - Volume baixo para tendência`;
        }

        return { strength, diagnostics };
    }

    private calculateVolumeBreakout5mLongTerm(candles: CandleData[]): { strength: number, diagnostics: string } {
        const volumeAnalysis = this.calculateVolumeAnalysis(candles, 30);
        const priceChange = this.calculatePriceChange(candles, 20);

        let strength = 0;
        let diagnostics = 'Volume 5m Long: ';

        if (volumeAnalysis.isHighVolume && priceChange > 2.0) {
            strength = Math.min(85, 50 + (volumeAnalysis.volumeRatio * 6));
            diagnostics += `${strength.toFixed(1)}% - Breakout sustentado`;
        } else if (volumeAnalysis.isHighVolume && priceChange < -2.0) {
            strength = Math.min(85, 50 + (volumeAnalysis.volumeRatio * 6));
            diagnostics += `${strength.toFixed(1)}% - Breakdown sustentado`;
        } else {
            strength = 35;
            diagnostics += `${strength.toFixed(1)}% - Volume insuficiente para sustentação`;
        }

        return { strength, diagnostics };
    }

    private calculateVolumeBreakoutStrengthWithDiagnostics(candles: CandleData[]): { strength: number, diagnostics: string } {
        const volumeAnalysis = this.calculateVolumeAnalysis(candles, 20);
        const priceChange = this.calculatePriceChange(candles, 10);

        let strength = 0;
        let diagnostics = 'Volume Breakout: ';

        if (volumeAnalysis.isHighVolume && Math.abs(priceChange) > 1.0) {
            strength = Math.min(80, 55 + (volumeAnalysis.volumeRatio * 5));
            diagnostics += `${strength.toFixed(1)}% - Breakout com volume`;
        } else {
            strength = 40;
            diagnostics += `${strength.toFixed(1)}% - Volume normal`;
        }

        return { strength, diagnostics };
    }

    // ===== MÉTODOS AUXILIARES =====

    private calculateMACD(candles: CandleData[], fastPeriod: number, slowPeriod: number, signalPeriod: number): { macd: number, signal: number, histogram: number } {
        if (candles.length < slowPeriod) {
            return { macd: 0, signal: 0, histogram: 0 };
        }

        const prices = candles.map(c => c.close);
        const emaFast = this.calculateEMA(prices, fastPeriod);
        const emaSlow = this.calculateEMA(prices, slowPeriod);

        const macd = emaFast - emaSlow;
        const signal = this.calculateEMA([macd], signalPeriod);
        const histogram = macd - signal;

        return { macd, signal, histogram };
    }

    private calculateVolumeAnalysis(candles: CandleData[], period: number): { isHighVolume: boolean, volumeRatio: number } {
        if (candles.length < period) {
            return { isHighVolume: false, volumeRatio: 1 };
        }

        const recentVolumes = candles.slice(-period).map(c => c.volume);
        const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
        const currentVolume = candles[candles.length - 1].volume;
        const volumeRatio = currentVolume / avgVolume;

        return {
            isHighVolume: volumeRatio > 1.5,
            volumeRatio
        };
    }

    private calculatePriceChange(candles: CandleData[], period: number): number {
        if (candles.length < period) {
            return 0;
        }

        const currentPrice = candles[candles.length - 1].close;
        const pastPrice = candles[candles.length - period].close;

        return ((currentPrice - pastPrice) / pastPrice) * 100;
    }

    private calculateEMA(prices: number[], period: number): number {
        if (prices.length === 0) return 0;
        if (prices.length === 1) return prices[0];

        const multiplier = 2 / (period + 1);
        let ema = prices[0];

        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }

        return ema;
    }

    /**
     * Obtém estratégia matemática ativa
     */
    private async getActiveMathStrategy(): Promise<string> {
        try {
            const strategies = await this.mathStrategyService.getAllStrategies();
            const activeStrategy = strategies.find(s => s.isActive);
            return activeStrategy ? activeStrategy.name : 'Nenhuma estratégia ativa';
        } catch (error) {
            console.error('❌ [MATH] Erro ao obter estratégia matemática:', error);
            return 'Erro ao carregar estratégia';
        }
    }

    /**
     * Atualiza configuração da análise rotativa
     */
    async updateConfig(newConfig: Partial<RotativeAnalysisConfig>): Promise<{ success: boolean; message: string }> {
        try {
            this.config = { ...this.config, ...newConfig };
            console.log(`⚙️ [CONFIG] Configuração atualizada:`, this.config);
            return { success: true, message: 'Configuração atualizada com sucesso' };
        } catch (error) {
            console.error(`❌ [CONFIG] Erro ao atualizar configuração:`, error);
            return { success: false, message: 'Erro ao atualizar configuração: ' + error.message };
        }
    }

    /**
     * Limpa histórico de execuções
     */
    async clearExecutions(): Promise<{ success: boolean; message: string }> {
        try {
            // Limpar cache em memória
            this.emittedSignals = [];

            // Limpar diretório de execuções
            if (fs.existsSync(this.EXEC_DIR)) {
                const files = fs.readdirSync(this.EXEC_DIR);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        fs.unlinkSync(path.join(this.EXEC_DIR, file));
                    }
                }
            }

            // Resetar metadata
            this.writeMeta(this.EXEC_META, { lastId: 0, totalCount: 0 });

            console.log('🗑️ [CLEAR] Histórico de execuções limpo com sucesso');
            return { success: true, message: 'Histórico de execuções limpo com sucesso' };
        } catch (error) {
            console.error('❌ [CLEAR] Erro ao limpar execuções:', error);
            return { success: false, message: 'Erro ao limpar execuções: ' + error.message };
        }
    }

    /**
     * Limpa histórico de ciclos
     */
    async clearCycles(): Promise<{ success: boolean; message: string }> {
        try {
            // Limpar cache em memória
            this.cycleHistory = [];
            this.currentCycle = 0;

            // Limpar diretório de ciclos
            if (fs.existsSync(this.CYCLES_DIR)) {
                const files = fs.readdirSync(this.CYCLES_DIR);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        fs.unlinkSync(path.join(this.CYCLES_DIR, file));
                    }
                }
            }

            // Resetar metadata
            this.writeMeta(this.CYCLES_META, { lastId: 0, totalCount: 0 });

            console.log('🗑️ [CLEAR] Histórico de ciclos limpo com sucesso');
            return { success: true, message: 'Histórico de ciclos limpo com sucesso' };
        } catch (error) {
            console.error('❌ [CLEAR] Erro ao limpar ciclos:', error);
            return { success: false, message: 'Erro ao limpar ciclos: ' + error.message };
        }
    }
}