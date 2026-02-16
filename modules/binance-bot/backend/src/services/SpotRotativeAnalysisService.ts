import * as fs from 'fs';
import * as path from 'path';
import { BinanceApiService } from './BinanceApiService';
import { MathStrategyService } from './MathStrategyService';
import { SpotStrategyService } from './SpotStrategyService';
import { triggerStorage, TriggerConfig } from '../trigger-storage';

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
    maxOpenPositions: number;
    maxPositionsPerSymbol: number;
    symbolCooldownMs: number;
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
    private paperTradingMode: boolean = false;
    // MEMORY-LEAK-FIX: Sets/Maps that grow without limit - add periodic cleanup
    private triggerSellsExecuted: Set<string> = new Set();
    private symbolCooldowns: Map<string, number> = new Map();
    // Disk persistence roots
    private readonly CYCLES_DIR = path.join(process.cwd(), 'data', 'LOGS-CICLOS-SPOT');
    private readonly CYCLES_META = path.join(this.CYCLES_DIR, 'cycles-index.json');
    private readonly EXEC_DIR = path.join(process.cwd(), 'data', 'LOGS-EXECUCOES-SPOT');
    private readonly EXEC_META = path.join(this.EXEC_DIR, 'executions-index.json');
    private readonly CONFIG_FILE = path.join(process.cwd(), 'data', 'spot-rotative-config.json');
    private config: RotativeAnalysisConfig = {
        minSignalsRequired: 1,
        minSignalStrength: 65,
        cycleIntervalMs: 10000, // 10 segundos
        maxHistoryTables: 20, // 20 ciclos
        maxOpenPositions: 5, // max 5 posições abertas simultâneas
        maxPositionsPerSymbol: 1, // max 1 posição por par
        symbolCooldownMs: 900000 // 15 minutos cooldown após venda
    };

    constructor() {
        const apiKey = process.env.BINANCE_API_KEY || '';
        const secretKey = process.env.BINANCE_SECRET_KEY || '';

        // Detect paper trading mode when API keys are missing/invalid
        this.paperTradingMode = !apiKey || !secretKey || apiKey === 'test' || secretKey === 'test';
        if (this.paperTradingMode) {
            console.log('📝 [PAPER TRADING] Modo paper trading ATIVADO - API keys não configuradas');
            console.log('📝 [PAPER TRADING] Ordens serão simuladas com preços reais');
            console.log('📝 [PAPER TRADING] Para operar de verdade, configure BINANCE_API_KEY e BINANCE_SECRET_KEY no .env');
        }

        this.binanceService = new BinanceApiService({
            apiKey: apiKey || 'paper-trading',
            secretKey: secretKey || 'paper-trading',
            isTestnet: true
        });
        this.spotStrategyService = SpotStrategyService.getInstance();
        this.mathStrategyService = new MathStrategyService();
        // Ensure directories and meta files exist
        this.ensureDir(this.CYCLES_DIR);
        this.ensureDir(this.EXEC_DIR);
        this.initMetaIfMissing(this.CYCLES_META);
        this.initMetaIfMissing(this.EXEC_META);

        // Load persisted config from disk (overrides defaults)
        this.loadConfigFromDisk();

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
     * Load config from disk if exists
     */
    private loadConfigFromDisk(): void {
        try {
            if (fs.existsSync(this.CONFIG_FILE)) {
                const raw = fs.readFileSync(this.CONFIG_FILE, 'utf8');
                const savedConfig = JSON.parse(raw);
                this.config = { ...this.config, ...savedConfig };
                console.log(`⚙️ [CONFIG] Configuração carregada do disco:`, this.config);
            } else {
                console.log(`⚙️ [CONFIG] Usando configuração padrão (sem arquivo salvo)`);
                this.saveConfigToDisk();
            }
        } catch (error) {
            console.warn(`⚠️ [CONFIG] Erro ao carregar config do disco, usando defaults:`, error);
        }
    }

    /**
     * Save config to disk
     */
    private saveConfigToDisk(): void {
        try {
            fs.writeFileSync(this.CONFIG_FILE, JSON.stringify(this.config, null, 2));
            console.log(`💾 [CONFIG] Configuração salva em disco`);
        } catch (error) {
            console.warn(`⚠️ [CONFIG] Erro ao salvar config no disco:`, error);
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
     * MEMORY-LEAK-FIX: Log RSS/heap usage every 100 cycles
     */
    private logMemoryUsage(): void {
        const mem = process.memoryUsage();
        const rss = (mem.rss / 1024 / 1024).toFixed(1);
        const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
        const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);
        const external = (mem.external / 1024 / 1024).toFixed(1);
        console.log(`📊 [MEMORY] Cycle ${this.currentCycle} | RSS: ${rss}MB | Heap: ${heapUsed}/${heapTotal}MB | External: ${external}MB`);
        if (mem.rss > 512 * 1024 * 1024) {
            console.warn(`⚠️ [MEMORY] RSS exceeds 512MB limit! Current: ${rss}MB`);
        }
    }

    /**
     * MEMORY-LEAK-FIX: Periodic cleanup of accumulated data structures
     */
    private performMemoryCleanup(): void {
        const now = Date.now();

        // Clean expired symbol cooldowns
        for (const [symbol, expiry] of this.symbolCooldowns) {
            if (now > expiry) {
                this.symbolCooldowns.delete(symbol);
            }
        }

        // Limit triggerSellsExecuted to last 200 entries (oldest are irrelevant)
        if (this.triggerSellsExecuted.size > 200) {
            const arr = Array.from(this.triggerSellsExecuted);
            this.triggerSellsExecuted = new Set(arr.slice(-200));
        }

        // Limit cycleHistory in-memory to max 20 (already loaded from disk)
        if (this.cycleHistory.length > 20) {
            this.cycleHistory = this.cycleHistory.slice(-20);
        }

        // Limit emittedSignals in-memory to max 100
        if (this.emittedSignals.length > 100) {
            this.emittedSignals = this.emittedSignals.slice(-100);
        }

        // Clear previous signalsTable (will be regenerated next cycle)
        this.signalsTable = [];

        console.log(`🧹 [MEMORY] Cleanup done: cooldowns=${this.symbolCooldowns.size}, triggers=${this.triggerSellsExecuted.size}, history=${this.cycleHistory.length}, signals=${this.emittedSignals.length}`);
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

            // Monitorar triggers ativos (TP/SL) ANTES de comprar
            await this.checkAndExecuteTriggers();

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

            // MEMORY-LEAK-FIX: Periodic cleanup every 100 cycles
            if (this.currentCycle % 100 === 0) {
                this.performMemoryCleanup();
                this.logMemoryUsage();
            }

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

        const activeTriggers = triggerStorage.getActiveTriggers();
        const totalOpenPositions = activeTriggers.length;

        console.log(`🔍 [EXECUÇÃO] Analisando sinais para execução...`);
        console.log(`⚙️ [CONFIG] Sinais necessários: ${this.config.minSignalsRequired}`);
        console.log(`⚙️ [CONFIG] Força mínima: ${this.config.minSignalStrength}%`);
        console.log(`⚙️ [CONFIG] Posições abertas: ${totalOpenPositions}/${this.config.maxOpenPositions} | Max por par: ${this.config.maxPositionsPerSymbol}`);

        // CHECK GLOBAL: Limite de posições abertas simultâneas
        if (totalOpenPositions >= this.config.maxOpenPositions) {
            console.log(`🛑 [EXECUÇÃO] LIMITE GLOBAL atingido: ${totalOpenPositions}/${this.config.maxOpenPositions} posições abertas. Aguardando TP/SL.`);
            // Still count signals for reporting
            for (const marketData of signalsTable) {
                let marketSignals = 0;
                for (const [, strategySignals] of Object.entries(marketData.strategies)) {
                    for (const timeframe of ['timeframe1m', 'timeframe3m', 'timeframe5m']) {
                        const signal = strategySignals[timeframe];
                        if (signal && signal.strength >= this.config.minSignalStrength) {
                            marketSignals++;
                            totalSignals++;
                        }
                    }
                }
                signalsByMarket[marketData.market] = marketSignals;
            }
            return { signalsGenerated: totalSignals, executionsPerformed: 0, signalsByMarket };
        }

        for (const marketData of signalsTable) {
            const market = marketData.market;
            let marketSignals = 0;

            console.log(`\n📊 [${market}] Analisando sinais:`);

            // Contar sinais fortes para este mercado
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
                // CHECK: Limite global re-check (pode ter mudado durante loop)
                const currentOpen = triggerStorage.getActiveTriggers().length;
                if (currentOpen >= this.config.maxOpenPositions) {
                    console.log(`🛑 [${market}] SKIP - Limite global atingido (${currentOpen}/${this.config.maxOpenPositions})`);
                    continue;
                }

                // CHECK: Limite por par - max N posições ativas por symbol
                const symbolPositions = activeTriggers.filter(t => t.symbol === market).length;
                if (symbolPositions >= this.config.maxPositionsPerSymbol) {
                    console.log(`⚠️ [${market}] SKIP - Já tem ${symbolPositions}/${this.config.maxPositionsPerSymbol} posição(ões) aberta(s). Aguardando TP/SL.`);
                    continue;
                }

                // CHECK: Cooldown por symbol (após venda recente)
                const cooldownExpiry = this.symbolCooldowns.get(market);
                if (cooldownExpiry && Date.now() < cooldownExpiry) {
                    const remainingMs = cooldownExpiry - Date.now();
                    const remainingSec = Math.ceil(remainingMs / 1000);
                    console.log(`⏳ [${market}] SKIP - Cooldown ativo (${remainingSec}s restantes)`);
                    continue;
                }

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

            // Executar ordem de compra na Binance (ou simular em paper trading)
            let orderResult: { success: boolean; data?: any; message?: string };

            if (this.paperTradingMode) {
                // PAPER TRADING: Simular ordem com preço real
                console.log(`📝 [PAPER TRADING] Simulando ordem MARKET BUY ${market}...`);
                const simulatedOrderId = `PAPER-${Date.now()}`;
                orderResult = {
                    success: true,
                    data: {
                        orderId: simulatedOrderId,
                        symbol: market,
                        side: 'BUY',
                        type: 'MARKET',
                        status: 'FILLED',
                        executedQty: quantity.toFixed(8),
                        cummulativeQuoteQty: activeMathStrategy.betAmount.toFixed(2),
                        fills: [{
                            price: currentPrice.toFixed(8),
                            qty: quantity.toFixed(8),
                            commission: '0',
                            commissionAsset: 'USDT'
                        }],
                        paperTrading: true
                    }
                };
                console.log(`📝 [PAPER TRADING] Ordem simulada: ${simulatedOrderId}`);
            } else {
                // REAL TRADING: Enviar ordem para Binance usando quoteOrderQty ($USDT)
                console.log(`🔄 [EXECUÇÃO] Executando ordem MARKET BUY $${activeMathStrategy.betAmount} de ${market}...`);

                orderResult = await this.binanceService.placeMarketBuyQuote({
                    symbol: market,
                    quoteOrderQty: activeMathStrategy.betAmount.toString()
                });
            }

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
     * Monitora triggers ativos e executa vendas automáticas (TP/SL)
     */
    private async checkAndExecuteTriggers(): Promise<void> {
        try {
            const activeTriggers = triggerStorage.getActiveTriggers();
            if (activeTriggers.length === 0) return;

            console.log(`\n🎯 [TRIGGER MONITOR] Verificando ${activeTriggers.length} triggers ativos...`);

            for (const trigger of activeTriggers) {
                // Skip if already processed this session
                if (this.triggerSellsExecuted.has(trigger.executionId)) continue;

                try {
                    const currentPrice = await this.binanceService.getCurrentPrice(trigger.symbol);
                    if (!currentPrice) continue;

                    let shouldSell = false;
                    let sellReason = '';

                    // Check Take Profit
                    if (trigger.profitTrigger && currentPrice >= trigger.profitTrigger) {
                        shouldSell = true;
                        sellReason = 'TAKE_PROFIT';
                        const pnlPct = ((currentPrice - trigger.buyPrice) / trigger.buyPrice * 100).toFixed(2);
                        console.log(`🚀 [TP HIT] ${trigger.symbol}: $${currentPrice.toFixed(4)} >= TP $${trigger.profitTrigger.toFixed(4)} (+${pnlPct}%)`);
                    }

                    // Check Stop Loss
                    if (trigger.lossTrigger && currentPrice <= trigger.lossTrigger) {
                        shouldSell = true;
                        sellReason = 'STOP_LOSS';
                        const pnlPct = ((currentPrice - trigger.buyPrice) / trigger.buyPrice * 100).toFixed(2);
                        console.log(`🛑 [SL HIT] ${trigger.symbol}: $${currentPrice.toFixed(4)} <= SL $${trigger.lossTrigger.toFixed(4)} (${pnlPct}%)`);
                    }

                    if (shouldSell) {
                        await this.executeTriggerSell(trigger, currentPrice, sellReason);
                    } else {
                        const pnlPct = ((currentPrice - trigger.buyPrice) / trigger.buyPrice * 100).toFixed(2);
                        console.log(`  📊 ${trigger.symbol}: $${currentPrice.toFixed(4)} (buy: $${trigger.buyPrice.toFixed(4)}, PnL: ${pnlPct}%, TP: $${trigger.profitTrigger?.toFixed(4)}, SL: $${trigger.lossTrigger?.toFixed(4)})`);
                    }
                } catch (priceError) {
                    console.error(`❌ [TRIGGER] Erro ao verificar ${trigger.symbol}:`, priceError);
                }
            }
        } catch (error) {
            console.error('❌ [TRIGGER MONITOR] Erro geral:', error);
        }
    }

    /**
     * Executa venda automática quando trigger é ativado
     */
    private async executeTriggerSell(trigger: TriggerConfig, currentPrice: number, reason: string): Promise<void> {
        try {
            this.triggerSellsExecuted.add(trigger.executionId);

            const pnlValue = (currentPrice - trigger.buyPrice) * trigger.quantity;
            const pnlPct = ((currentPrice - trigger.buyPrice) / trigger.buyPrice * 100).toFixed(2);

            console.log(`\n⚡ ===== VENDA AUTOMÁTICA (${reason}) =====`);
            console.log(`📊 Símbolo: ${trigger.symbol}`);
            console.log(`💲 Preço compra: $${trigger.buyPrice.toFixed(8)}`);
            console.log(`💲 Preço atual: $${currentPrice.toFixed(8)}`);
            console.log(`📊 Quantidade: ${trigger.quantity}`);
            console.log(`💰 PnL: $${pnlValue.toFixed(4)} (${pnlPct}%)`);

            let sellResult: { success: boolean; data?: any; message?: string };

            if (this.paperTradingMode) {
                console.log(`📝 [PAPER] Simulando venda...`);
                sellResult = {
                    success: true,
                    data: {
                        orderId: `PAPER-SELL-${Date.now()}`,
                        symbol: trigger.symbol,
                        side: 'SELL',
                        status: 'FILLED',
                        executedQty: trigger.quantity.toString(),
                        cummulativeQuoteQty: (trigger.quantity * currentPrice).toFixed(2),
                        paperTrading: true
                    }
                };
            } else {
                console.log(`🔄 Executando venda REAL na Binance...`);
                // Use quantity for SELL (we know exact amount we bought)
                sellResult = await this.binanceService.placeOrder({
                    symbol: trigger.symbol,
                    side: 'SELL',
                    type: 'MARKET',
                    quantity: trigger.quantity.toFixed(8)
                });
            }

            if (sellResult.success) {
                console.log(`✅ VENDA EXECUTADA! OrderId: ${sellResult.data?.orderId}`);
                console.log(`💰 Resultado: ${pnlValue >= 0 ? 'LUCRO' : 'PREJUÍZO'} de $${Math.abs(pnlValue).toFixed(4)} (${pnlPct}%)`);

                // Deactivate the trigger
                triggerStorage.deactivateTrigger(trigger.executionId);

                // Set cooldown for this symbol (prevent immediate re-entry)
                this.symbolCooldowns.set(trigger.symbol, Date.now() + this.config.symbolCooldownMs);
                console.log(`⏳ [COOLDOWN] ${trigger.symbol} em cooldown por ${this.config.symbolCooldownMs / 1000}s`);

                // Log the sell execution
                await this.logSellExecution(trigger, currentPrice, reason, sellResult, pnlValue);

                console.log(`⚡ ===== VENDA CONCLUÍDA =====\n`);
            } else {
                console.log(`❌ FALHA NA VENDA: ${sellResult.message}`);
                this.triggerSellsExecuted.delete(trigger.executionId); // Allow retry
            }
        } catch (error) {
            console.error(`❌ Erro na venda automática de ${trigger.symbol}:`, error);
            this.triggerSellsExecuted.delete(trigger.executionId); // Allow retry
        }
    }

    /**
     * Loga execução de venda em arquivo
     */
    private async logSellExecution(trigger: TriggerConfig, sellPrice: number, reason: string, result: any, pnlValue: number): Promise<void> {
        try {
            const sellLog = {
                type: 'SELL',
                timestamp: new Date().toISOString(),
                executionId: trigger.executionId,
                symbol: trigger.symbol,
                buyPrice: trigger.buyPrice,
                sellPrice: sellPrice,
                quantity: trigger.quantity,
                pnlUSD: pnlValue,
                pnlPercentage: ((sellPrice - trigger.buyPrice) / trigger.buyPrice * 100),
                reason: reason,
                orderId: result.data?.orderId,
                paperTrading: this.paperTradingMode
            };

            const sellDir = path.join(process.cwd(), 'data', 'LOGS-VENDAS-SPOT');
            this.ensureDir(sellDir);
            const filename = path.join(sellDir, `sell-${Date.now()}.json`);
            fs.writeFileSync(filename, JSON.stringify(sellLog, null, 2));

            console.log(`📝 Venda logada em: ${filename}`);
        } catch (error) {
            console.error('❌ Erro ao logar venda:', error);
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
            case 'spot_stochastic_005': {
                const stochResult = this.calculateStochasticSignal(candles, timeframe);
                signalStrength = stochResult.strength;
                diagnostics = stochResult.diagnostics;
                break;
            }
            case 'spot_ema_trend_006': {
                const emaResult = this.calculateEMATrendSignal(candles, timeframe);
                signalStrength = emaResult.strength;
                diagnostics = emaResult.diagnostics;
                break;
            }
            case 'spot_williams_r_007': {
                const willResult = this.calculateWilliamsRSignal(candles, timeframe);
                signalStrength = willResult.strength;
                diagnostics = willResult.diagnostics;
                break;
            }
            case 'spot_cci_cyclical_008': {
                const cciResult = this.calculateCCISignal(candles, timeframe);
                signalStrength = cciResult.strength;
                diagnostics = cciResult.diagnostics;
                break;
            }
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

    // ===== ESTRATÉGIA 005: STOCHASTIC OSCILLATOR =====
    private calculateStochasticSignal(candles: CandleData[], timeframe: string): { strength: number; diagnostics: string } {
        if (candles.length < 14) return { strength: 30, diagnostics: 'Stochastic: dados insuficientes' };

        const period = 14;
        const smoothK = 3;
        const smoothD = 3;

        // Calculate %K
        const kValues: number[] = [];
        for (let i = period - 1; i < candles.length; i++) {
            const slice = candles.slice(i - period + 1, i + 1);
            const highestHigh = Math.max(...slice.map(c => c.high));
            const lowestLow = Math.min(...slice.map(c => c.low));
            const range = highestHigh - lowestLow;
            const k = range === 0 ? 50 : ((candles[i].close - lowestLow) / range) * 100;
            kValues.push(k);
        }

        // Smooth %K with SMA
        const smoothedK: number[] = [];
        for (let i = smoothK - 1; i < kValues.length; i++) {
            const sum = kValues.slice(i - smoothK + 1, i + 1).reduce((a, b) => a + b, 0);
            smoothedK.push(sum / smoothK);
        }

        // Calculate %D (SMA of smoothed %K)
        const dValues: number[] = [];
        for (let i = smoothD - 1; i < smoothedK.length; i++) {
            const sum = smoothedK.slice(i - smoothD + 1, i + 1).reduce((a, b) => a + b, 0);
            dValues.push(sum / smoothD);
        }

        if (smoothedK.length < 2 || dValues.length < 2) {
            return { strength: 30, diagnostics: 'Stochastic: cálculo insuficiente' };
        }

        const currentK = smoothedK[smoothedK.length - 1];
        const prevK = smoothedK[smoothedK.length - 2];
        const currentD = dValues[dValues.length - 1];
        const prevD = dValues.length >= 2 ? dValues[dValues.length - 2] : currentD;

        let strength = 0;
        let diagnostics = `Stochastic ${timeframe}: `;

        // Bullish: %K crosses above %D from oversold (<20)
        if (currentK > currentD && prevK <= prevD && currentK < 30) {
            strength = Math.min(95, 75 + (30 - currentK));
            diagnostics += `${strength.toFixed(0)}% - Crossover bullish em zona oversold (K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)})`;
        }
        // Bullish momentum: %K above %D, both rising
        else if (currentK > currentD && currentK > prevK) {
            strength = Math.min(85, 55 + (currentK - currentD));
            diagnostics += `${strength.toFixed(0)}% - Momentum bullish (K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)})`;
        }
        // Bearish: %K crosses below %D from overbought (>80)
        else if (currentK < currentD && prevK >= prevD && currentK > 70) {
            strength = Math.min(90, 70 + (currentK - 70));
            diagnostics += `${strength.toFixed(0)}% - Crossover bearish em zona overbought (K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)})`;
        }
        // Neutral zone
        else {
            strength = Math.min(50, 20 + Math.abs(currentK - 50) * 0.6);
            diagnostics += `${strength.toFixed(0)}% - Zona neutra (K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)})`;
        }

        return { strength: Math.round(strength), diagnostics };
    }

    // ===== ESTRATÉGIA 006: EMA TREND =====
    private calculateEMATrendSignal(candles: CandleData[], timeframe: string): { strength: number; diagnostics: string } {
        if (candles.length < 26) return { strength: 30, diagnostics: 'EMA Trend: dados insuficientes' };

        const prices = candles.map(c => c.close);
        const ema9 = this.calculateEMA(prices, 9);
        const ema21 = this.calculateEMA(prices, 21);
        const currentPrice = prices[prices.length - 1];

        // Check EMA alignment
        const priceAboveEma9 = currentPrice > ema9;
        const priceAboveEma21 = currentPrice > ema21;
        const ema9AboveEma21 = ema9 > ema21;

        // Calculate trend strength based on separation
        const emaSeparation = Math.abs(ema9 - ema21) / ema21 * 100;
        const priceVsEma9 = (currentPrice - ema9) / ema9 * 100;

        let strength = 0;
        let diagnostics = `EMA Trend ${timeframe}: `;

        // Strong bullish: Price > EMA9 > EMA21
        if (priceAboveEma9 && priceAboveEma21 && ema9AboveEma21) {
            strength = Math.min(95, 65 + emaSeparation * 15 + priceVsEma9 * 5);
            diagnostics += `${strength.toFixed(0)}% - Tendência de alta forte (EMA9>${ema9.toFixed(2)}, EMA21>${ema21.toFixed(2)})`;
        }
        // Bullish crossover: EMA9 just crossed above EMA21
        else if (ema9AboveEma21 && !priceAboveEma9) {
            strength = Math.min(75, 50 + emaSeparation * 10);
            diagnostics += `${strength.toFixed(0)}% - Crossover bullish recente`;
        }
        // Strong bearish: Price < EMA9 < EMA21
        else if (!priceAboveEma9 && !priceAboveEma21 && !ema9AboveEma21) {
            strength = Math.min(85, 55 + emaSeparation * 10);
            diagnostics += `${strength.toFixed(0)}% - Tendência de baixa (reversão potencial)`;
        }
        // Neutral/consolidation
        else {
            strength = Math.min(45, 25 + emaSeparation * 5);
            diagnostics += `${strength.toFixed(0)}% - Consolidação`;
        }

        return { strength: Math.round(Math.max(0, strength)), diagnostics };
    }

    // ===== ESTRATÉGIA 007: WILLIAMS %R =====
    private calculateWilliamsRSignal(candles: CandleData[], timeframe: string): { strength: number; diagnostics: string } {
        if (candles.length < 14) return { strength: 30, diagnostics: 'Williams %R: dados insuficientes' };

        const period = 14;
        const williamsValues: number[] = [];

        for (let i = period - 1; i < candles.length; i++) {
            const slice = candles.slice(i - period + 1, i + 1);
            const highestHigh = Math.max(...slice.map(c => c.high));
            const lowestLow = Math.min(...slice.map(c => c.low));
            const range = highestHigh - lowestLow;
            // Williams %R: -100 to 0 (0 = overbought, -100 = oversold)
            const wr = range === 0 ? -50 : ((highestHigh - candles[i].close) / range) * -100;
            williamsValues.push(wr);
        }

        if (williamsValues.length < 3) return { strength: 30, diagnostics: 'Williams %R: cálculo insuficiente' };

        const currentWR = williamsValues[williamsValues.length - 1];
        const prevWR = williamsValues[williamsValues.length - 2];
        const prev2WR = williamsValues[williamsValues.length - 3];

        let strength = 0;
        let diagnostics = `Williams %R ${timeframe}: `;

        // Oversold reversal: WR crosses above -80 (bullish)
        if (currentWR > -80 && prevWR <= -80) {
            strength = Math.min(95, 75 + Math.abs(currentWR + 80) * 2);
            diagnostics += `${strength.toFixed(0)}% - Reversão de oversold (%R=${currentWR.toFixed(1)})`;
        }
        // Deeply oversold with momentum turning: WR < -90 and rising
        else if (currentWR < -80 && currentWR > prevWR && prevWR > prev2WR) {
            strength = Math.min(85, 65 + Math.abs(currentWR + 100) * 1.5);
            diagnostics += `${strength.toFixed(0)}% - Oversold com momentum positivo (%R=${currentWR.toFixed(1)})`;
        }
        // Overbought: near 0 (potential short signal, useful for awareness)
        else if (currentWR > -20 && prevWR <= -20) {
            strength = Math.min(80, 60 + Math.abs(currentWR) * 2);
            diagnostics += `${strength.toFixed(0)}% - Zona overbought, potencial reversão (%R=${currentWR.toFixed(1)})`;
        }
        // Mid-range, no signal
        else {
            strength = Math.min(45, 20 + Math.abs(currentWR + 50) * 0.5);
            diagnostics += `${strength.toFixed(0)}% - Zona neutra (%R=${currentWR.toFixed(1)})`;
        }

        return { strength: Math.round(Math.max(0, strength)), diagnostics };
    }

    // ===== ESTRATÉGIA 008: CCI CYCLICAL =====
    private calculateCCISignal(candles: CandleData[], timeframe: string): { strength: number; diagnostics: string } {
        if (candles.length < 20) return { strength: 30, diagnostics: 'CCI: dados insuficientes' };

        const period = 20;
        // Calculate Typical Price for each candle
        const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);

        // Calculate CCI for last few values
        const cciValues: number[] = [];
        for (let i = period - 1; i < typicalPrices.length; i++) {
            const slice = typicalPrices.slice(i - period + 1, i + 1);
            const sma = slice.reduce((a, b) => a + b, 0) / period;
            const meanDeviation = slice.reduce((a, b) => a + Math.abs(b - sma), 0) / period;
            const cci = meanDeviation === 0 ? 0 : (typicalPrices[i] - sma) / (0.015 * meanDeviation);
            cciValues.push(cci);
        }

        if (cciValues.length < 3) return { strength: 30, diagnostics: 'CCI: cálculo insuficiente' };

        const currentCCI = cciValues[cciValues.length - 1];
        const prevCCI = cciValues[cciValues.length - 2];
        const prev2CCI = cciValues[cciValues.length - 3];

        let strength = 0;
        let diagnostics = `CCI ${timeframe}: `;

        // Bullish: CCI crosses above -100 (exit oversold)
        if (currentCCI > -100 && prevCCI <= -100) {
            strength = Math.min(95, 80 + Math.min(15, Math.abs(currentCCI + 100) * 0.5));
            diagnostics += `${strength.toFixed(0)}% - CCI saiu de oversold (CCI=${currentCCI.toFixed(0)})`;
        }
        // Strong bullish: CCI above +100 and rising
        else if (currentCCI > 100 && currentCCI > prevCCI) {
            strength = Math.min(90, 70 + Math.min(20, (currentCCI - 100) * 0.1));
            diagnostics += `${strength.toFixed(0)}% - CCI em zona overbought com momentum (CCI=${currentCCI.toFixed(0)})`;
        }
        // Bearish reversal: CCI crosses below +100
        else if (currentCCI < 100 && prevCCI >= 100) {
            strength = Math.min(80, 60 + Math.min(20, Math.abs(currentCCI - 100) * 0.5));
            diagnostics += `${strength.toFixed(0)}% - CCI saiu de overbought (CCI=${currentCCI.toFixed(0)})`;
        }
        // CCI rising from negative territory
        else if (currentCCI > prevCCI && prevCCI > prev2CCI && currentCCI > -50) {
            strength = Math.min(75, 50 + Math.min(25, Math.abs(currentCCI) * 0.15));
            diagnostics += `${strength.toFixed(0)}% - CCI em tendência de alta (CCI=${currentCCI.toFixed(0)})`;
        }
        // Neutral
        else {
            strength = Math.min(40, 20 + Math.min(20, Math.abs(currentCCI) * 0.08));
            diagnostics += `${strength.toFixed(0)}% - Zona neutra (CCI=${currentCCI.toFixed(0)})`;
        }

        return { strength: Math.round(Math.max(0, strength)), diagnostics };
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
        paperTradingMode: boolean;
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
            paperTradingMode: this.paperTradingMode,
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
            this.saveConfigToDisk();
            console.log(`⚙️ [CONFIG] Configuração atualizada e salva:`, this.config);
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