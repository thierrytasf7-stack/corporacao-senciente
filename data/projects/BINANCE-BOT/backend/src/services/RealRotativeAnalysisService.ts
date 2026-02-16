import { logger } from '../utils/logger';
import { BinanceApiService } from './BinanceApiService';
import { MathStrategyService } from './MathStrategyService';
import { RotativeAnalysisService } from './RotativeAnalysisService';
import { SimpleExecutionService } from './SimpleExecutionService';
import { CandleData, TechnicalAnalysisService, TradingSignal } from './TechnicalAnalysisService';
import { TradingStrategyService } from './TradingStrategyService';

export interface FavoriteMarket {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    category: string;
}

export interface RotativeAnalysisResult {
    totalMarkets: number;
    analyzedMarkets: number;
    signals: TradingSignal[];
    timestamp: number;
    duration: number;
    errors: string[];
    summary: {
        buySignals: number;
        sellSignals: number;
        holdSignals: number;
        averageStrength: number;
    };
    executedOrders: number;
    activeStrategies: {
        trading: number;
        mathStrategy: string | null;
    };
    totalCyclesCompleted: number;
    currentCycleNumber: number;
}

export class RealRotativeAnalysisService {
    private binanceService: BinanceApiService;
    private tradingStrategyService: TradingStrategyService;
    private mathStrategyService: MathStrategyService;
    private executionService: SimpleExecutionService;
    private rotativeAnalysisService: RotativeAnalysisService;
    private isAnalyzing: boolean = false;
    private isRunning: boolean = false;
    private lastAnalysis: RotativeAnalysisResult | null = null;
    private analysisInterval: NodeJS.Timeout | null = null;
    private accumulatedSignals: TradingSignal[] = [];
    private totalCyclesCompleted: number = 0;
    private currentCycleNumber: number = 0;

    // Cache e controle de logs
    private lastLoggedStatus: string = '';
    private lastLoggedCycle: number = 0;
    private statusCache: Map<string, any> = new Map();
    private cacheExpiry: number = 5000; // 5 segundos

    constructor(
        binanceService: BinanceApiService,
        tradingStrategyService: TradingStrategyService,
        mathStrategyService: MathStrategyService,
        executionService: SimpleExecutionService,
        rotativeAnalysisService?: RotativeAnalysisService
    ) {
        this.binanceService = binanceService;
        this.tradingStrategyService = tradingStrategyService;
        this.mathStrategyService = mathStrategyService;
        this.executionService = executionService;
        this.rotativeAnalysisService = rotativeAnalysisService || new RotativeAnalysisService(binanceService);
    }

    /**
     * Start continuous rotative analysis
     */
    async startRotativeAnalysis(favoriteSymbols: string[]): Promise<{ success: boolean; message: string }> {
        if (this.isRunning) {
            return { success: false, message: 'Análise rotativa já está em execução' };
        }

        try {
            // Verificar estratégias ativas
            const activeStrategies = await this.tradingStrategyService.getActiveStrategies();
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();

            if (activeStrategies.length === 0) {
                return { success: false, message: 'Nenhuma estratégia de trading ativa' };
            }

            if (!activeMathStrategy) {
                return { success: false, message: 'Nenhuma estratégia matemática ativa' };
            }

            if (favoriteSymbols.length === 0) {
                return { success: false, message: 'Nenhum mercado favorito selecionado' };
            }

            this.isRunning = true;

            logger.info(`🚀 Iniciando análise rotativa contínua REAL com ${favoriteSymbols.length} mercados favoritos`);
            logger.info(`📊 Estratégias ativas: ${activeStrategies.length} trading, math: ${activeMathStrategy.name}`);

            // Executar primeira análise imediatamente
            await this.runSingleAnalysisCycle(favoriteSymbols);

            // Configurar execução contínua a cada 60 segundos (mais tempo para aguardar execução)
            this.analysisInterval = setInterval(async () => {
                try {
                    logger.info(`🔄 Iniciando novo ciclo de análise rotativa...`);
                    await this.runSingleAnalysisCycle(favoriteSymbols);
                    logger.info(`✅ Ciclo de análise concluído, aguardando próximo ciclo...`);
                } catch (error) {
                    logger.error('Erro no ciclo de análise:', error);
                }
            }, 60000); // 60 segundos entre ciclos

            return { success: true, message: 'Análise rotativa iniciada com sucesso' };

        } catch (error: any) {
            this.isRunning = false;
            logger.error('Erro ao iniciar análise rotativa:', error);
            return { success: false, message: `Erro: ${error.message}` };
        }
    }

    /**
     * Stop continuous rotative analysis
     */
    async stopRotativeAnalysis(): Promise<{ success: boolean; message: string }> {
        if (!this.isRunning) {
            return { success: false, message: 'Análise rotativa não está em execução' };
        }

        this.isRunning = false;

        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        logger.info('🛑 Análise rotativa parada');
        return { success: true, message: 'Análise rotativa parada com sucesso' };
    }

    /**
     * Run single analysis cycle (used both for one-time and continuous analysis)
     */
    async runSingleAnalysisCycle(favoriteSymbols: string[]): Promise<RotativeAnalysisResult> {
        if (this.isAnalyzing) {
            logger.warn('Analysis already in progress, returning cached result');
            return this.lastAnalysis || this.getEmptyResult();
        }

        const startTime = Date.now();
        this.isAnalyzing = true;

        try {
            // Get active strategies
            const activeStrategies = await this.tradingStrategyService.getActiveStrategies();
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();

            // Log otimizado - apenas quando há mudanças
            const currentCycle = Math.floor(Date.now() / 60000); // Mudança a cada minuto
            if (currentCycle > this.lastLoggedCycle) {
                logger.info(`🔄 Iniciando ciclo de análise REAL com ${favoriteSymbols.length} mercados favoritos`);
                logger.info(`📊 Estratégias ativas: ${activeStrategies.length} trading, math: ${activeMathStrategy?.name || 'Nenhuma'}`);
                this.lastLoggedCycle = currentCycle;
            }

            if (favoriteSymbols.length === 0) {
                return this.getEmptyResult();
            }

            const signals: TradingSignal[] = [];
            const errors: string[] = [];
            let analyzedCount = 0;
            let executedOrders = 0;

            // Analyze each favorite market
            for (const symbol of favoriteSymbols) {
                try {
                    // Log apenas no primeiro ciclo ou a cada 5 ciclos
                    if (currentCycle <= 1 || currentCycle % 5 === 0) {
                        logger.info(`📊 Analisando mercado real: ${symbol}`);
                    }

                    // Get real candlestick data from Binance
                    const klines = await this.binanceService.getKlines(symbol, '1h', 100);

                    // Convert to CandleData format
                    const candles: CandleData[] = klines.map(kline => ({
                        openTime: kline.openTime,
                        open: parseFloat(kline.open),
                        high: parseFloat(kline.high),
                        low: parseFloat(kline.low),
                        close: parseFloat(kline.close),
                        volume: parseFloat(kline.volume),
                        closeTime: kline.closeTime
                    }));

                    // Generate trading signal using real technical analysis AND active strategies
                    const signal = await this.generateSignalWithStrategies(symbol, candles, activeStrategies);
                    signals.push(signal);
                    analyzedCount++;

                    // Execute order if signal is strong enough and math strategy is active - RESTRITIVO
                    if (activeMathStrategy && (signal.signal === 'BUY' || signal.signal === 'SELL') && signal.strength >= 80) {
                        try {
                            logger.info(`🔄 Processando sinal: ${signal.symbol} ${signal.signal} (${signal.strength}%)`);
                            await this.executeTradeSignal(signal, activeMathStrategy);
                            executedOrders++;
                            logger.info(`✅ Ordem executada com sucesso: ${signal.symbol} ${signal.signal} (${signal.strength}%)`);

                            // Aguardar execução antes de continuar para o próximo sinal
                            logger.info(`⏳ Aguardando confirmação da execução de ${signal.symbol}...`);
                            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos de espera

                        } catch (executeError: any) {
                            logger.error(`❌ Erro ao executar ordem para ${signal.symbol}:`, executeError);
                            errors.push(`Erro execução ${signal.symbol}: ${executeError.message}`);

                            // Aguardar mesmo em caso de erro antes do próximo sinal
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    // Log de sinal apenas se diferente do anterior ou for ordem executada
                    if (executedOrders > 0 || signal.signal !== 'HOLD') {
                        logger.info(`✅ ${symbol}: ${signal.signal} (${signal.strength}%) - ${signal.reasons.join(', ')}`);
                    }

                } catch (error: any) {
                    const errorMsg = `Erro ao analisar ${symbol}: ${error.message}`;
                    errors.push(errorMsg);
                    logger.error(errorMsg, error);
                }
            }

            // Calculate summary
            const summary = this.calculateSummary(signals);
            const duration = Date.now() - startTime;

            const result: RotativeAnalysisResult = {
                totalMarkets: favoriteSymbols.length,
                analyzedMarkets: analyzedCount,
                signals,
                timestamp: Date.now(),
                duration,
                errors,
                summary,
                executedOrders,
                activeStrategies: {
                    trading: activeStrategies.length,
                    mathStrategy: activeMathStrategy?.name || null
                },
                totalCyclesCompleted: this.totalCyclesCompleted + 1,
                currentCycleNumber: this.totalCyclesCompleted + 1
            };

            this.lastAnalysis = result;

            // Incrementar contadores de ciclos
            this.totalCyclesCompleted++;
            this.currentCycleNumber = this.totalCyclesCompleted;

            // Acumular sinais (não limpar)
            this.accumulatedSignals.push(...signals);

            // Log de resumo otimizado - apenas quando há execuções ou mudanças significativas
            const hasExecutions = executedOrders > 0;
            const hasSignals = summary.buySignals > 0 || summary.sellSignals > 0;

            if (hasExecutions || hasSignals || currentCycle % 5 === 0) {
                logger.info(`🎯 Ciclo REAL concluído: ${analyzedCount}/${favoriteSymbols.length} mercados, ${executedOrders} ordens executadas em ${duration}ms`);
                logger.info(`📈 Sinais: ${summary.buySignals} BUY, ${summary.sellSignals} SELL, ${summary.holdSignals} HOLD`);

                if (currentCycle % 10 === 0) { // Log total apenas a cada 10 ciclos
                    logger.info(`📊 Total acumulado: ${this.accumulatedSignals.length} sinais históricos`);
                }
            }

            return result;

        } catch (error: any) {
            logger.error('Erro no ciclo de análise:', error);
            return this.getErrorResult(favoriteSymbols.length, Date.now() - startTime, error.message);
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * Get analysis for specific symbol
     */
    async analyzeSymbol(symbol: string): Promise<TradingSignal> {
        try {
            logger.info(`📊 Análise individual: ${symbol}`);

            const klines = await this.binanceService.getKlines(symbol, '1h', 100);
            const candles: CandleData[] = klines.map(kline => ({
                openTime: kline.openTime,
                open: parseFloat(kline.open),
                high: parseFloat(kline.high),
                low: parseFloat(kline.low),
                close: parseFloat(kline.close),
                volume: parseFloat(kline.volume),
                closeTime: kline.closeTime
            }));

            return TechnicalAnalysisService.generateTradingSignal(symbol, candles);
        } catch (error: any) {
            logger.error(`Erro ao analisar ${symbol}:`, error);
            throw new Error(`Falha na análise de ${symbol}: ${error.message}`);
        }
    }

    /**
     * Get multiple timeframe analysis
     */
    async getMultiTimeframeAnalysis(symbol: string): Promise<{
        symbol: string;
        timeframes: {
            [key: string]: TradingSignal;
        };
        consensus: 'BUY' | 'SELL' | 'HOLD';
        timestamp: number;
    }> {
        try {
            logger.info(`📊 Análise multi-timeframe para ${symbol}`);

            const timeframes = ['1h', '4h', '1d'];
            const signals: { [key: string]: TradingSignal } = {};

            for (const timeframe of timeframes) {
                const klines = await this.binanceService.getKlines(symbol, timeframe, 100);
                const candles: CandleData[] = klines.map(kline => ({
                    openTime: kline.openTime,
                    open: parseFloat(kline.open),
                    high: parseFloat(kline.high),
                    low: parseFloat(kline.low),
                    close: parseFloat(kline.close),
                    volume: parseFloat(kline.volume),
                    closeTime: kline.closeTime
                }));

                signals[timeframe] = TechnicalAnalysisService.generateTradingSignal(symbol, candles);
            }

            // Calculate consensus
            const signalValues = Object.values(signals);
            const buyCount = signalValues.filter(s => s.signal === 'BUY').length;
            const sellCount = signalValues.filter(s => s.signal === 'SELL').length;

            let consensus: 'BUY' | 'SELL' | 'HOLD';
            if (buyCount > sellCount) {
                consensus = 'BUY';
            } else if (sellCount > buyCount) {
                consensus = 'SELL';
            } else {
                consensus = 'HOLD';
            }

            return {
                symbol,
                timeframes: signals,
                consensus,
                timestamp: Date.now()
            };
        } catch (error: any) {
            logger.error(`Erro na análise multi-timeframe de ${symbol}:`, error);
            throw new Error(`Falha na análise multi-timeframe: ${error.message}`);
        }
    }

    /**
     * Get last analysis result
     */
    getLastAnalysis(): RotativeAnalysisResult | null {
        return this.lastAnalysis;
    }

    /**
     * Check if analysis is currently running
     */
    isAnalysisRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Get analysis status
     */
    getAnalysisStatus(): {
        isRunning: boolean;
        isAnalyzing: boolean;
        lastAnalysisTime: number | null;
        lastAnalysisMarkets: number;
        hasLastAnalysis: boolean;
        totalCyclesCompleted: number;
        currentCycleNumber: number;
    } {
        const status = {
            isRunning: this.isRunning,
            isAnalyzing: this.isAnalyzing,
            lastAnalysisTime: this.lastAnalysis?.timestamp || null,
            lastAnalysisMarkets: this.lastAnalysis?.totalMarkets || 0,
            hasLastAnalysis: this.lastAnalysis !== null,
            totalCyclesCompleted: this.totalCyclesCompleted,
            currentCycleNumber: this.currentCycleNumber
        };

        console.log('🔍 [DEBUG] getAnalysisStatus retornando:', status);
        return status;
    }

    /**
     * Generate signal using active strategies
     */
    private async generateSignalWithStrategies(symbol: string, candles: CandleData[], activeStrategies: any[]): Promise<TradingSignal> {
        // Use base technical analysis
        const baseSignal = TechnicalAnalysisService.generateTradingSignal(symbol, candles);

        // ✅ DEBUG: Log da força do sinal base
        console.log(`🔍 [DEBUG FORÇA] ${symbol}: Força base = ${baseSignal.strength}, Sinal = ${baseSignal.signal}`);

        // TODO: Apply active strategy filters here
        // For now, return base signal with strategy influence
        if (activeStrategies.length > 0) {
            // ✅ REMOVIDO BONUS DE ESTRATÉGIAS - ERA ISSO QUE ESTAVA INFLANDO A FORÇA
            // const strategyBonus = Math.min(activeStrategies.length * 5, 20); // Max 20% bonus
            // baseSignal.strength = Math.min(baseSignal.strength + strategyBonus, 100);
            baseSignal.reasons.push(`${activeStrategies.length} estratégias ativas (sem bonus)`);
        }

        console.log(`🔍 [DEBUG FORÇA] ${symbol}: Força final = ${baseSignal.strength}`);
        return baseSignal;
    }

    /**
     * Execute trade signal
     */
    private async executeTradeSignal(signal: TradingSignal, mathStrategy: any): Promise<void> {
        try {
            logger.info(`💰 Executando ordem: ${signal.symbol} ${signal.signal} com estratégia ${mathStrategy.name}`);
            logger.info(`💰 Valor da aposta: $${mathStrategy.betAmount}, Força: ${signal.strength}%`);

            // ✅ USAR ROTATIVEANALYSISSERVICE PARA EXECUTAR ORDENS
            // Isso garante que os sinais sejam atualizados com status correto
            const orderResult = await this.executionService.executeOrder({
                symbol: signal.symbol,
                side: signal.signal as 'BUY' | 'SELL',
                amount: mathStrategy.betAmount,
                strategy: mathStrategy.name,
                confidence: signal.strength
            });

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Falha na execução da ordem');
            }

            // ✅ ADICIONAR SINAL AO ROTATIVEANALYSISSERVICE COM STATUS ATUALIZADO
            const tradingSignal = {
                symbol: signal.symbol,
                signal: signal.signal,
                strength: signal.strength,
                indicators: signal.indicators || {
                    rsi: 50,
                    macd: { macd: 0, signal: 0, histogram: 0 },
                    ema12: 0,
                    ema26: 0,
                    sma20: 0,
                    bollingerBands: { upper: 0, middle: 0, lower: 0 },
                    stochastic: { k: 50, d: 50 }
                },
                price: signal.price,
                timestamp: Date.now(),
                reasons: [`Sinal executado via RealRotativeAnalysisService - ${mathStrategy.name}`]
            };

            // Adicionar sinal ao RotativeAnalysisService para sincronização
            if (this.rotativeAnalysisService) {
                // Usar reflexão para acessar o array privado de sinais
                const signalsArray = (this.rotativeAnalysisService as any).signals;
                if (signalsArray) {
                    signalsArray.push(tradingSignal);
                    logger.info(`✅ Sinal adicionado ao RotativeAnalysisService: ${tradingSignal.symbol} ${tradingSignal.signal}`);
                }
            }

            logger.info(`✅ Ordem executada com sucesso: ${orderResult.orderId}`);

        } catch (error) {
            logger.error(`Erro na execução da ordem:`, error);
            throw error;
        }
    }

    /**
     * Get error result
     */
    private getErrorResult(totalMarkets: number, duration: number, errorMessage: string): RotativeAnalysisResult {
        return {
            totalMarkets,
            analyzedMarkets: 0,
            signals: [],
            timestamp: Date.now(),
            duration,
            errors: [`Erro geral: ${errorMessage}`],
            summary: {
                buySignals: 0,
                sellSignals: 0,
                holdSignals: 0,
                averageStrength: 0
            },
            executedOrders: 0,
            activeStrategies: {
                trading: 0,
                mathStrategy: null
            },
            totalCyclesCompleted: this.totalCyclesCompleted,
            currentCycleNumber: this.currentCycleNumber
        };
    }

    /**
     * Calculate summary statistics
     */
    private calculateSummary(signals: TradingSignal[]) {
        if (signals.length === 0) {
            return {
                buySignals: 0,
                sellSignals: 0,
                holdSignals: 0,
                averageStrength: 0
            };
        }

        const buySignals = signals.filter(s => s.signal === 'BUY').length;
        const sellSignals = signals.filter(s => s.signal === 'SELL').length;
        const holdSignals = signals.filter(s => s.signal === 'HOLD').length;
        const averageStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

        return {
            buySignals,
            sellSignals,
            holdSignals,
            averageStrength: Math.round(averageStrength)
        };
    }

    /**
     * Get empty result for error cases
     */
    private getEmptyResult(): RotativeAnalysisResult {
        return {
            totalMarkets: 0,
            analyzedMarkets: 0,
            signals: [],
            timestamp: Date.now(),
            duration: 0,
            errors: [],
            summary: {
                buySignals: 0,
                sellSignals: 0,
                holdSignals: 0,
                averageStrength: 0
            },
            executedOrders: 0,
            activeStrategies: {
                trading: 0,
                mathStrategy: null
            },
            totalCyclesCompleted: this.totalCyclesCompleted,
            currentCycleNumber: this.currentCycleNumber
        };
    }

    /**
     * Get all accumulated signals - Sincronizado com RotativeAnalysisService
     */
    async getAllSignals(): Promise<TradingSignal[]> {
        try {
            // ✅ BUSCAR SINAIS REAIS DO ROTATIVEANALYSISSERVICE
            // Este método agora busca sinais do serviço que realmente executa as ordens
            const realSignals = await this.rotativeAnalysisService.getAllSignals();

            // Converter sinais para o formato correto do TechnicalAnalysisService
            const convertedSignals: TradingSignal[] = realSignals.map(signal => ({
                symbol: signal.symbol,
                signal: signal.side as 'BUY' | 'SELL' | 'HOLD',
                strength: signal.confidence,
                indicators: {
                    rsi: 50,
                    macd: { macd: 0, signal: 0, histogram: 0 },
                    ema12: 0,
                    ema26: 0,
                    sma20: 0,
                    bollingerBands: { upper: 0, middle: 0, lower: 0 },
                    stochastic: { k: 50, d: 50 }
                },
                price: signal.price,
                timestamp: typeof signal.timestamp === 'number' ? signal.timestamp : (signal.timestamp as Date).getTime(),
                reasons: [`Sinal executado - ${signal.strategyId}`]
            }));

            // Sincronizar com accumulatedSignals local para manter compatibilidade
            this.accumulatedSignals = convertedSignals;

            logger.info(`📊 [SIGNALS] Retornando ${convertedSignals.length} sinais REAIS do RotativeAnalysisService`);
            return convertedSignals;
        } catch (error) {
            logger.error('❌ [SIGNALS] Erro ao buscar sinais do RotativeAnalysisService:', error);
            // Fallback para sinais locais em caso de erro
            return this.accumulatedSignals;
        }
    }

    /**
     * Clear signals and analysis history
     */
    async clearSignalsHistory(): Promise<void> {
        this.accumulatedSignals = [];
        this.lastAnalysis = null;
        logger.info('🧹 Histórico de sinais e análise limpo');
    }
}
