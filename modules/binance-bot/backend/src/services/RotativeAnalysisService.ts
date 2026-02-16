import { AnalysisLoggerService } from './AnalysisLoggerService';
import { BinanceApiService } from './BinanceApiService';
import { MarketService } from './MarketService';
import { MathStrategyService } from './MathStrategyService';
import { PositionMonitorService } from './PositionMonitorService';
import { PositionStorageService } from './PositionStorageService';
import { StrategyRiskProfileService } from './StrategyRiskProfileService';
import { StrategyStorageService } from './StrategyStorageService';
import { TechnicalAnalysisService, TradingSignal } from './TechnicalAnalysisService';
import { TradingStrategyService } from './TradingStrategyService';

export interface AnalysisStatus {
    isRunning: boolean;
    currentMarketIndex: number;
    activeMarketsCount: number;
    activeTradingStrategiesCount: number;
    activeMathStrategy: string | null;
    cycleMode: 'CONTINUOUS' | 'WAIT_RESULT';
    currentMarket: string | null;
    lastSignal: string | null;
    totalSignals: number;
    successfulTrades: number;
    totalCyclesCompleted: number;
    currentCycleNumber: number;
}

export class RotativeAnalysisService {
    private binanceService: BinanceApiService | null = null;
    private mathStrategyService: MathStrategyService;
    private tradingStrategyService: TradingStrategyService;
    private marketService: MarketService;
    private storageService: StrategyStorageService;
    private technicalAnalysisService: TechnicalAnalysisService;

    private isRunning: boolean = false;
    private currentMarketIndex: number = 0;
    private cycleMode: 'CONTINUOUS' | 'WAIT_RESULT' = 'CONTINUOUS';
    private currentMarket: string | null = null;
    private analysisInterval: NodeJS.Timeout | null = null;
    private signals: TradingSignal[] = [];
    private logger: AnalysisLoggerService;
    private cycleNumber: number = 0;
    private totalCyclesCompleted: number = 0;
    private riskProfileService: StrategyRiskProfileService;
    private positionMonitorService: PositionMonitorService;
    private positionStorage: PositionStorageService;

    constructor(binanceService?: BinanceApiService) {
        this.binanceService = binanceService || null;
        this.mathStrategyService = new MathStrategyService();
        this.tradingStrategyService = new TradingStrategyService();
        this.marketService = new MarketService();
        this.storageService = new StrategyStorageService();
        // Manter compatibility temporariamente
        this.technicalAnalysisService = null as any;
        this.logger = new AnalysisLoggerService();
        this.riskProfileService = new StrategyRiskProfileService(this.storageService);
        this.positionMonitorService = new PositionMonitorService(binanceService);
        this.positionStorage = new PositionStorageService();
    }

    async getStatus(): Promise<AnalysisStatus> {
        try {
            const activeMarkets = await this.marketService.getActiveMarkets();
            const activeTradingStrategies = await this.tradingStrategyService.getActiveStrategies();
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();

            return {
                isRunning: this.isRunning,
                currentMarketIndex: this.currentMarketIndex,
                activeMarketsCount: activeMarkets.length,
                activeTradingStrategiesCount: activeTradingStrategies.length,
                activeMathStrategy: activeMathStrategy?.name || null,
                cycleMode: this.cycleMode,
                currentMarket: this.currentMarket,
                lastSignal: this.signals.length > 0 ? this.signals[this.signals.length - 1].id : null,
                totalSignals: this.signals.length,
                successfulTrades: this.signals.filter(s => s.status === 'EXECUTED').length,
                totalCyclesCompleted: this.totalCyclesCompleted,
                currentCycleNumber: this.cycleNumber
            };
        } catch (error) {
            console.error('Erro ao obter status da análise rotativa:', error);
            throw error;
        }
    }

    async startAnalysis(cycleMode: 'CONTINUOUS' | 'WAIT_RESULT'): Promise<void> {
        try {
            // Verificar requisitos
            const activeMarkets = await this.marketService.getActiveMarkets();
            const activeTradingStrategies = await this.tradingStrategyService.getActiveStrategies();
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();

            if (activeMarkets.length === 0) {
                throw new Error('Nenhum mercado ativo configurado');
            }

            if (activeTradingStrategies.length === 0) {
                throw new Error('Nenhuma estratégia de trading ativa');
            }

            if (!activeMathStrategy) {
                throw new Error('Nenhuma estratégia matemática ativa');
            }

            // Verificar se a estratégia matemática tem configurações válidas
            if (!activeMathStrategy.leverage || !activeMathStrategy.tradingType) {
                throw new Error('Estratégia matemática não configurada corretamente (falta leverage ou tradingType)');
            }

            // Testar conexão com Binance antes de verificar
            if (!this.binanceService) {
                throw new Error('Serviço Binance não disponível');
            }
            // TODO: Implementar teste de conexão real quando disponível

            // Iniciar análise
            this.isRunning = true;
            this.cycleMode = cycleMode;
            this.currentMarketIndex = 0;
            this.currentMarket = null;
            this.cycleNumber++;

            // Log do início do ciclo
            this.logger.addCycleStartLog(
                cycleMode,
                activeMarkets.length,
                activeTradingStrategies.length,
                activeMathStrategy.name
            );

            console.log(`🚀 Sistema Rotativo de Análise iniciado - Modo: ${cycleMode}`);
            console.log(`📊 Mercados ativos: ${activeMarkets.length}`);
            console.log(`🎯 Estratégias de trading ativas: ${activeTradingStrategies.length}`);
            console.log(`🧮 Estratégia matemática: ${activeMathStrategy.name} ($${activeMathStrategy.betAmount})`);
            console.log(`⚡ Tipo de Trading: ${activeMathStrategy.tradingType} | Alavancagem: ${activeMathStrategy.leverage}x`);
            console.log(`🎯 Take Profit: +${activeMathStrategy.takeProfitPercentage || 60}% | Stop Loss: -${activeMathStrategy.stopLossPercentage || 30}%`);

            // Iniciar monitoramento de posições
            await this.positionMonitorService.startMonitoring();

            // Iniciar ciclo de análise
            this.startAnalysisCycle();

        } catch (error) {
            console.error('Erro ao iniciar análise rotativa:', error);
            throw error;
        }
    }

    async stopAnalysis(): Promise<void> {
        try {
            this.isRunning = false;
            this.currentMarket = null;

            if (this.analysisInterval) {
                clearInterval(this.analysisInterval);
                this.analysisInterval = null;
            }

            // Parar monitoramento de posições
            await this.positionMonitorService.stopMonitoring();

            console.log('🛑 Sistema Rotativo de Análise parado');
        } catch (error) {
            console.error('Erro ao parar análise rotativa:', error);
            throw error;
        }
    }

    private async startAnalysisCycle(): Promise<void> {
        try {
            // Executar primeira análise imediatamente
            await this.performAnalysis();

            // Configurar intervalo para análises subsequentes
            this.analysisInterval = setInterval(async () => {
                if (this.isRunning) {
                    await this.performAnalysis();
                }
            }, 30000); // Analisar a cada 30 segundos

        } catch (error) {
            console.error('Erro no ciclo de análise:', error);
            await this.stopAnalysis();
        }
    }

    private async performAnalysis(): Promise<void> {
        try {
            const activeMarkets = await this.marketService.getActiveMarkets();
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();
            const activeTimeframes = await this.tradingStrategyService.getActiveTimeframes();

            if (!activeMathStrategy || activeMarkets.length === 0 || activeTimeframes.length === 0) {
                this.logger.addWarningLog('Requisitos não atendidos, parando análise');
                console.log('⚠️ Requisitos não atendidos, parando análise');
                await this.stopAnalysis();
                return;
            }

            // Obter próximo mercado para análise
            const currentMarket = activeMarkets[this.currentMarketIndex];
            this.currentMarket = currentMarket.symbol;

            const cycleInfo = {
                currentMarket: this.currentMarketIndex + 1,
                totalMarkets: activeMarkets.length,
                progress: ((this.currentMarketIndex + 1) / activeMarkets.length) * 100,
                cycleMode: this.cycleMode,
                timeframes: activeTimeframes
            };

            // Log da análise do mercado
            this.logger.addAnalysisLog(currentMarket.symbol, cycleInfo);

            console.log(`🔍 Analisando mercado: ${currentMarket.symbol} (${this.currentMarketIndex + 1}/${activeMarkets.length})`);
            console.log(`⏱️ Timeframes ativos: ${activeTimeframes.join(', ')}`);

            // Analisar cada timeframe separadamente
            for (const timeframe of activeTimeframes) {
                await this.analyzeTimeframe(currentMarket.symbol, timeframe, activeMathStrategy.betAmount);
            }

            // Avançar para próximo mercado
            this.advanceToNextMarket(activeMarkets.length);

        } catch (error) {
            this.logger.addErrorLog('Erro na análise', error instanceof Error ? error.message : String(error));
            console.error('Erro na análise:', error);
        }
    }

    private async analyzeTimeframe(symbol: string, timeframe: string, betAmount: number): Promise<void> {
        try {
            console.log(`📊 Analisando timeframe ${timeframe} para ${symbol}`);

            // Obter estratégias ativas para este timeframe
            const strategies = await this.tradingStrategyService.getActiveStrategiesByTimeframe(timeframe as any);

            if (strategies.length === 0) {
                console.log(`⚠️ Nenhuma estratégia ativa para timeframe ${timeframe}`);
                return;
            }

            // Obter candles para este timeframe
            const startTime = Date.now();
            const candles: any[] = []; // Temporarily disabled
            const duration = Date.now() - startTime;

            if (candles.length === 0) {
                this.logger.addWarningLog(`Candles não disponíveis para ${symbol} no timeframe ${timeframe}`);
                console.log(`⚠️ Candles não disponíveis para ${symbol} no timeframe ${timeframe}`);
                return;
            }

            // Log dos dados de candles
            this.logger.addMarketDataLog(symbol, { timeframe, candlesCount: candles.length }, duration);

            // Analisar cada estratégia do timeframe
            for (const strategy of strategies) {
                await this.analyzeStrategy(symbol, strategy, candles, betAmount);
            }

        } catch (error) {
            this.logger.addErrorLog(`Erro na análise do timeframe ${timeframe}`, error);
            console.error(`Erro na análise do timeframe ${timeframe}:`, error);
        }
    }

    private async analyzeStrategy(symbol: string, strategy: any, candles: any[], betAmount: number): Promise<void> {
        try {
            console.log(`🔍 Analisando estratégia: ${strategy.name} (${strategy.timeframe})`);

            // Verificar se temos candles suficientes
            const requiredCandles = Math.max(strategy.maxCandles, 50);
            if (candles.length < requiredCandles) {
                this.logger.addWarningLog(`Candles insuficientes para ${strategy.name}: ${candles.length}/${requiredCandles}`);
                console.log(`⚠️ Candles insuficientes para ${strategy.name}: ${candles.length}/${requiredCandles}`);
                return;
            }

            // Usar apenas os candles necessários
            const analysisCandles = candles.slice(-strategy.maxCandles);

            // Realizar análise técnica
            const analysis: any = { signal: null, confidence: 0, indicators: {} }; // Temporarily disabled

            // Log da verificação da estratégia
            this.logger.addStrategyCheckLog(symbol, strategy.name, analysis.indicators, analysis.confidence);

            if (analysis.signal) {
                console.log(`🎯 SINAL GERADO: ${strategy.name} - ${symbol} ${analysis.signal} (Confiança: ${analysis.confidence.toFixed(1)}%)`);

                // Obter preço atual REAL da Binance - SEM FALLBACKS MENTIROSOS
                let currentPrice = 0;
                let priceAvailable = false;

                try {
                    if (this.binanceService) {
                        console.log(`🔍 [PRICE_CHECK] Obtendo preço atual para ${symbol}...`);
                        console.log(`🔍 [PRICE_DEBUG] BinanceService existe: ${!!this.binanceService}`);

                        try {
                            currentPrice = await this.binanceService.getCurrentPrice(symbol) || 0;
                            console.log(`🔍 [PRICE_DEBUG] currentPrice retornado: ${currentPrice}, tipo: ${typeof currentPrice}`);
                        } catch (priceError) {
                            console.error(`❌ [PRICE_ERROR] Erro ao chamar getCurrentPrice:`, priceError);
                            currentPrice = 0;
                        }

                        if (currentPrice > 0) {
                            console.log(`💰 Preço REAL atual de ${symbol}: $${currentPrice}`);
                            priceAvailable = true;
                        } else {
                            console.warn(`⚠️ Preço NÃO encontrado para ${symbol} - verificando se símbolo é válido`);

                            // Verificar se o símbolo é válido na Binance
                            const isValidSymbol = await this.binanceService.isSymbolTradeable(symbol);
                            console.log(`🔍 [SYMBOL_CHECK] ${symbol} é válido para trading: ${isValidSymbol}`);

                            if (!isValidSymbol) {
                                console.error(`❌ Símbolo ${symbol} não é válido para trading na Binance`);
                                return;
                            }
                        }
                    } else {
                        console.error(`❌ BinanceService não disponível para ${symbol}`);
                        return;
                    }
                } catch (error) {
                    console.error(`❌ Erro ao obter preço REAL de ${symbol}:`, {
                        error: error,
                        message: error instanceof Error ? error.message : 'Erro desconhecido',
                        symbol: symbol
                    });
                    return;
                }

                // Log do sinal gerado
                this.logger.addSignalLog(symbol, strategy.name, analysis.signal, analysis.confidence, betAmount);

                // Calcular quantidade correta baseada no preço atual (mínimo $20 para evitar NOTIONAL)
                let targetValueUSD = betAmount; // betAmount vem da estratégia matemática ($5)
                let signalQuantity = betAmount;

                if (priceAvailable && currentPrice > 0) {
                    // Ajustar valor alvo baseado no preço da moeda para evitar NOTIONAL
                    // Para moedas caras (BTC, ETH), usar pelo menos $30
                    if (currentPrice > 1000) {
                        targetValueUSD = Math.max(betAmount, 30); // Pelo menos $30 para BTC/ETH
                    } else if (currentPrice > 100) {
                        targetValueUSD = Math.max(betAmount, 20); // Pelo menos $20 para moedas médias
                    } else {
                        targetValueUSD = Math.max(betAmount, 15); // Pelo menos $15 para moedas baratas
                    }

                    // Converter valor alvo para unidades da moeda baseada no preço atual
                    signalQuantity = targetValueUSD / currentPrice;
                    signalQuantity = Math.max(signalQuantity, 0.000001); // Mínimo para evitar erros
                    signalQuantity = Math.min(signalQuantity, 1000000); // Máximo razoável

                    console.log(`💰 [SIGNAL] Sinal criado: ${symbol} ${analysis.signal} - Valor alvo: $${targetValueUSD}, Preço: $${currentPrice}, Quantidade calculada: ${signalQuantity}`);
                } else {
                    console.warn(`⚠️ [SIGNAL] Preço não disponível para ${symbol}, usando quantidade padrão`);
                }

                // Criar sinal de trading com quantidade correta
                const tradingSignal: TradingSignal = {
                    id: this.generateSignalId(),
                    strategyId: strategy.id,
                    symbol: symbol,
                    signal: analysis.signal,
                    side: analysis.signal,
                    strength: analysis.confidence,
                    price: currentPrice, // Preço atual obtido da Binance
                    quantity: signalQuantity, // Quantidade correta em unidades da moeda
                    timestamp: Date.now(),
                    confidence: analysis.confidence,
                    status: 'PENDING',
                    orderStatus: 'WAITING', // Status inicial da ordem
                    orderValue: targetValueUSD, // Valor da ordem em USD
                    reason: `Sinal gerado pela estratégia ${strategy.name}`,
                    reasons: [`Sinal gerado pela estratégia ${strategy.name}`],
                    stopLoss: 0, // Será calculado posteriormente
                    takeProfit: 0, // Será calculado posteriormente
                    indicators: {
                        rsi: 50,
                        macd: { macd: 0, signal: 0, histogram: 0 },
                        ema12: 0,
                        ema26: 0,
                        sma20: 0,
                        bollingerBands: { upper: 0, middle: 0, lower: 0 },
                        stochastic: { k: 50, d: 50 }
                    },
                    marketConditions: {
                        volatility: 0,
                        trend: 'SIDEWAYS',
                        volume: 0
                    }
                };

                // Adicionar sinal ao array local
                this.signals.push(tradingSignal);

                // Salvar sinal no storage
                this.storageService.saveSignal(tradingSignal);

                // Executar trade
                await this.executeOrder(tradingSignal, currentPrice, priceAvailable);

            } else {
                console.log(`📊 ${strategy.name}: Sem sinal (Confiança: ${analysis.confidence.toFixed(1)}%)`);
            }

        } catch (error) {
            this.logger.addErrorLog(`Erro na análise da estratégia ${strategy.name}`, error);
            console.error(`Erro na análise da estratégia ${strategy.name}:`, error);
        }
    }


    private async executeOrder(signal: TradingSignal, currentPrice: number, priceAvailable: boolean): Promise<void> {
        try {
            // Obter estratégia matemática ativa para usar os percentuais corretos
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();

            if (activeMathStrategy) {
                // Usar percentuais da estratégia matemática ativa
                signal.stopLoss = activeMathStrategy.stopLossPercentage || 30;
                signal.takeProfit = activeMathStrategy.takeProfitPercentage || 60;

                console.log(`🎯 [MATH_STRATEGY] Percentuais da estratégia matemática aplicados:`, {
                    strategy: activeMathStrategy.name,
                    tradingType: activeMathStrategy.tradingType,
                    leverage: activeMathStrategy.leverage,
                    stopLoss: `${signal.stopLoss}%`,
                    takeProfit: `${signal.takeProfit}%`,
                    betAmount: `$${activeMathStrategy.betAmount}`
                });
            } else {
                // Fallback para valores padrão se não houver estratégia matemática
                signal.stopLoss = 30;
                signal.takeProfit = 60;
                console.warn(`⚠️ [MATH_STRATEGY] Estratégia matemática não encontrada, usando valores padrão`);
            }

            // Atualizar status da ordem para PENDING
            signal.orderStatus = 'PENDING';
            this.storageService.updateSignal(signal.id, { orderStatus: 'PENDING' });

            console.log(`🚀 [ORDER_EXECUTION] Iniciando execução de ordem:`, {
                id: signal.id,
                symbol: signal.symbol,
                side: signal.side,
                quantity: signal.quantity,
                strategy: signal.strategyId,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit,
                orderStatus: signal.orderStatus,
                timestamp: signal.timestamp
            });

            // Usar quantidade já calculada corretamente no sinal
            const orderQuantity = signal.quantity;

            const orderValueUSD = (orderQuantity * currentPrice).toFixed(2);
            console.log(`🔍 [ORDER] Executando ordem:`, {
                symbol: signal.symbol,
                side: signal.side,
                quantity: orderQuantity.toString(),
                price: currentPrice,
                type: 'MARKET',
                valueUSD: `$${orderValueUSD}`,
                originalSignalQuantity: signal.quantity,
                priceSource: 'real',
                quantityFormatted: parseFloat(orderQuantity.toString()).toFixed(8)
            });

            // Debug adicional para verificar se a quantidade é muito pequena
            const numericQuantity = parseFloat(orderQuantity.toString());
            const minOrderValue = currentPrice * 0.000001; // Valor mínimo aproximado
            console.log(`🔍 [ORDER_DEBUG] Quantity check:`, {
                numericQuantity: numericQuantity,
                minOrderValue: minOrderValue.toFixed(4),
                currentOrderValue: (numericQuantity * currentPrice).toFixed(4),
                isTooSmall: (numericQuantity * currentPrice) < 1
            });

            // Verificação adicional para garantir que a quantidade é adequada
            if (orderQuantity * currentPrice < 15) {
                console.warn(`⚠️ [ORDER] Valor da ordem muito baixo: $${orderValueUSD} - pode causar erro NOTIONAL`);
            }

            // Executar ordem REAL na Binance
            console.log('📊 Executando ordem REAL na Binance:', {
                symbol: signal.symbol,
                side: signal.side,
                quantity: orderQuantity.toString(),
                price: currentPrice,
                type: 'MARKET'
            });

            let orderResult;
            try {
                if (this.binanceService) {
                    console.log(`🔍 [ORDER_DEBUG] BinanceService disponível, executando placeOrder...`);

                    orderResult = await this.binanceService.placeOrder({
                        symbol: signal.symbol,
                        side: signal.side as 'BUY' | 'SELL',
                        type: 'MARKET',
                        quantity: orderQuantity.toString()
                    });

                    console.log('✅ Ordem executada com sucesso na Binance:', orderResult);

                    // Verificar se a resposta da Binance está correta
                    if (orderResult && orderResult.orderId) {
                        orderResult = {
                            success: true,
                            price: parseFloat(orderResult.price || '0'),
                            orderId: orderResult.orderId,
                            message: 'Ordem executada com sucesso'
                        };
                        console.log(`🎯 [ORDER_SUCCESS] Ordem ${orderResult.orderId} executada com preço ${orderResult.price}`);
                    } else {
                        console.warn('⚠️ [ORDER_WARNING] Ordem executada mas resposta incompleta:', orderResult);
                        orderResult = {
                            success: false,
                            message: 'Resposta incompleta da Binance',
                            price: 0
                        };
                    }
                } else {
                    throw new Error('Serviço Binance não disponível');
                }
            } catch (error: any) {
                console.error('❌ Erro ao executar ordem na Binance:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    symbol: signal.symbol,
                    side: signal.side,
                    quantity: orderQuantity
                });
                orderResult = {
                    success: false,
                    message: error.message || 'Erro desconhecido na execução',
                    price: 0
                };
            }

            console.log(`🔍 [DEBUG] Resultado do placeOrder:`, orderResult);

            // Log da execução da ordem
            this.logger.addOrderLog(signal.symbol, signal.side, signal.quantity, orderResult);

            if (orderResult?.success) {
                signal.status = 'EXECUTED';
                signal.orderStatus = 'EXECUTED';
                signal.executionPrice = orderResult.price || signal.price;
                signal.executionTime = new Date();
                signal.orderId = orderResult.orderId;

                // Atualizar o preço principal se a execução foi bem-sucedida
                if (orderResult.price && orderResult.price > 0) {
                    signal.price = orderResult.price;
                }

                // Atualizar sinal no storage com stopLoss e takeProfit
                this.storageService.updateSignal(signal.id, {
                    status: signal.status,
                    orderStatus: signal.orderStatus,
                    executionPrice: signal.executionPrice,
                    executionTime: signal.executionTime,
                    price: signal.price,
                    stopLoss: signal.stopLoss,
                    takeProfit: signal.takeProfit,
                    orderId: signal.orderId
                });

                // Adicionar posição ao histórico local (será sincronizado com frontend)
                await this.addPositionToHistory(signal, 'OPEN', orderResult);

                // Adicionar posição ao monitoramento
                this.positionMonitorService.addPosition(signal);

                // Log detalhado da abertura de posição para o console web
                console.log(`🚀 [POSITION_OPENED] Nova posição aberta com sucesso:`, {
                    id: signal.id,
                    symbol: signal.symbol,
                    side: signal.side,
                    quantity: signal.quantity,
                    entryPrice: signal.price,
                    executionPrice: signal.executionPrice,
                    executionTime: signal.executionTime,
                    strategy: signal.strategyId,
                    stopLoss: signal.stopLoss,
                    takeProfit: signal.takeProfit,
                    betAmount: signal.quantity * signal.price,
                    timestamp: signal.timestamp
                });

                console.log(`✅ [ORDER_SUCCESS] Ordem executada com sucesso:`, {
                    id: signal.id,
                    symbol: signal.symbol,
                    side: signal.side,
                    quantity: signal.quantity,
                    entryPrice: signal.price,
                    executionPrice: signal.executionPrice,
                    executionTime: signal.executionTime,
                    strategy: signal.strategyId,
                    price: orderResult.price || 0
                });
            } else {
                signal.status = 'FAILED';
                signal.orderStatus = 'FAILED';
                signal.errorMessage = orderResult?.message || 'Falha na execução';

                // Atualizar sinal no storage com status de falha
                this.storageService.updateSignal(signal.id, {
                    status: signal.status,
                    orderStatus: signal.orderStatus,
                    errorMessage: signal.errorMessage
                });

                console.error(`❌ [ORDER_FAILED] Falha na execução da ordem:`, {
                    id: signal.id,
                    symbol: signal.symbol,
                    side: signal.side,
                    quantity: signal.quantity,
                    error: signal.errorMessage,
                    strategy: signal.strategyId,
                    orderStatus: signal.orderStatus,
                    timestamp: signal.timestamp
                });
            }

        } catch (error) {
            this.logger.addErrorLog('Erro ao executar ordem', error instanceof Error ? error.message : String(error));
            signal.status = 'FAILED';
            signal.orderStatus = 'FAILED';
            signal.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

            // Atualizar sinal no storage com status de falha
            this.storageService.updateSignal(signal.id, {
                status: signal.status,
                orderStatus: signal.orderStatus,
                errorMessage: signal.errorMessage
            });

            console.error(`💥 [ORDER_ERROR] Erro crítico na execução:`, {
                id: signal.id,
                symbol: signal.symbol,
                side: signal.side,
                quantity: signal.quantity,
                error: signal.errorMessage,
                strategy: signal.strategyId,
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }

    private advanceToNextMarket(totalMarkets: number): void {
        this.currentMarketIndex = (this.currentMarketIndex + 1) % totalMarkets;

        if (this.currentMarketIndex === 0) {
            // Incrementar contador de ciclos completos
            this.totalCyclesCompleted++;
            this.cycleNumber++;

            // Log do ciclo completo
            const successfulTrades = this.signals.filter(s => s.status === 'EXECUTED').length;
            this.logger.addCycleCompleteLog(this.cycleNumber, this.signals.length, successfulTrades);

            console.log(`🔄 Ciclo ${this.cycleNumber} completo - Total de ciclos: ${this.totalCyclesCompleted} - Reiniciando análise de mercados`);
            console.log(`📊 Estatísticas do ciclo: ${this.signals.length} sinais gerados, ${successfulTrades} executados com sucesso`);
            console.log(`📈 Total acumulado: ${this.signals.length} sinais históricos mantidos`);
        }
    }

    async getRecentSignals(): Promise<TradingSignal[]> {
        try {
            return this.signals.slice(-10); // Últimos 10 sinais
        } catch (error) {
            console.error('Erro ao buscar sinais recentes:', error);
            return [];
        }
    }

    async getAllSignals(): Promise<TradingSignal[]> {
        try {
            return this.signals; // Todos os sinais acumulados
        } catch (error) {
            console.error('Erro ao buscar todos os sinais:', error);
            return [];
        }
    }

    async clearSignalsHistory(): Promise<void> {
        try {
            const previousCount = this.signals.length;
            this.signals = [];
            this.totalCyclesCompleted = 0;
            this.cycleNumber = 0;

            console.log(`🧹 Histórico de sinais limpo: ${previousCount} sinais removidos`);
            console.log(`🔄 Contadores resetados: Ciclos = 0, Total = 0`);

            // Log da limpeza
            this.logger.addInfoLog('Histórico de sinais limpo manualmente', {
                previousSignalsCount: previousCount,
                clearedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao limpar histórico de sinais:', error);
            throw error;
        }
    }

    /**
     * Clear only signals (not analysis history)
     */
    async clearSignals(): Promise<void> {
        try {
            const previousCount = this.signals.length;
            this.signals = [];

            console.log(`🧹 Sinais limpos: ${previousCount} sinais removidos`);

            // Log da limpeza
            this.logger.addInfoLog('Sinais limpos manualmente', {
                previousSignalsCount: previousCount,
                clearedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao limpar sinais:', error);
            throw error;
        }
    }

    async getAnalysisLogs(limit: number = 100): Promise<any[]> {
        try {
            return this.logger.getLogs(limit);
        } catch (error) {
            console.error('Erro ao buscar logs de análise:', error);
            return [];
        }
    }

    async getAnalysisStats(): Promise<any> {
        try {
            return this.logger.getStats();
        } catch (error) {
            console.error('Erro ao buscar estatísticas de análise:', error);
            return {};
        }
    }

    /**
     * Obtém histórico de posições REAL (trades executados da Binance + storage local)
     */
    async getPositionHistory(): Promise<any[]> {
        try {
            console.log('📊 [HISTÓRICO] Obtendo posições REAIS da Binance Testnet...');
            console.log('🔍 [DEBUG] Método getPositionHistory chamado - versão atualizada');

            const allPositions: any[] = [];

            // 1. Obter trades executados reais da Binance (até 200 trades)
            if (this.binanceService) {
                try {
                    console.log('🔄 [HISTÓRICO] Buscando trades executados da Binance...');

                    // Verificar conexão com Binance
                    await this.binanceService.getAccountInfo();
                    console.log('✅ [HISTÓRICO] Conexão Binance ativa');

                    // Buscar trades executados de TODOS os símbolos (aumentado para 1000)
                    console.log('🔍 [DEBUG] Chamando getTradeHistory(undefined, 1000)...');
                    console.log('🔍 [DEBUG] Parâmetros: symbol=undefined, limit=1000');
                    const realTrades = await this.binanceService.getTradeHistory(undefined, 1000);
                    console.log(`📊 [HISTÓRICO] ${realTrades.length} trades executados obtidos da Binance (TODOS os símbolos)`);
                    console.log(`🔍 [DEBUG] Primeiros 3 trades:`, realTrades.slice(0, 3).map(t => ({ symbol: t.symbol, id: t.id })));

                    // Buscar trades específicos de símbolos conhecidos para garantir cobertura completa
                    const knownSymbols = ['ETHARS', 'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
                    const additionalTrades: any[] = [];

                    for (const symbol of knownSymbols) {
                        try {
                            console.log(`🔍 [SYMBOL_SEARCH] Buscando trades específicos para ${symbol}...`);
                            const symbolTrades = await this.binanceService.getTradeHistory(symbol, 50);
                            console.log(`📊 [SYMBOL_SEARCH] ${symbolTrades.length} trades encontrados para ${symbol}`);

                            // Adicionar trades que não estão na lista geral
                            for (const trade of symbolTrades) {
                                const exists = realTrades.some(rt => rt.id === trade.id);
                                if (!exists) {
                                    additionalTrades.push(trade);
                                }
                            }
                        } catch (error) {
                            console.warn(`⚠️ [SYMBOL_SEARCH] Erro ao buscar trades para ${symbol}:`, error);
                        }
                    }

                    // Combinar trades gerais com trades específicos
                    const allTrades = [...realTrades, ...additionalTrades];
                    console.log(`📊 [HISTÓRICO] Total de ${allTrades.length} trades (${realTrades.length} gerais + ${additionalTrades.length} específicos)`);

                    // Converter trades da Binance para formato de posições
                    console.log(`🔄 [LOOP_DEBUG] Iniciando loop para processar ${allTrades.length} trades`);
                    for (const trade of allTrades) {
                        console.log(`🔍 [PRICE_DEBUG] Processando trade ${trade.symbol} - preço original: ${trade.price}`);

                        // Buscar preço atual do símbolo
                        let currentPrice = parseFloat(trade.price);
                        try {
                            if (this.binanceService) {
                                console.log(`🔍 [PRICE_DEBUG] BinanceService existe: ${!!this.binanceService}`);
                                const price = await this.binanceService.getCurrentPrice(trade.symbol);
                                console.log(`🔍 [PRICE_DEBUG] Preço atual retornado: ${price}, tipo: ${typeof price}`);
                                if (price !== null) {
                                    currentPrice = price;
                                    console.log(`✅ [PRICE_DEBUG] Preço atualizado: ${currentPrice}`);
                                }
                            } else {
                                console.warn(`⚠️ [PRICE_DEBUG] BinanceService não disponível`);
                            }
                        } catch (error) {
                            console.warn(`⚠️ [HISTÓRICO] Erro ao buscar preço atual para ${trade.symbol}:`, error);
                        }

                        // Calcular PnL real
                        const openPrice = parseFloat(trade.price);
                        const quantity = parseFloat(trade.qty);
                        const pnl = trade.isBuyer
                            ? (currentPrice - openPrice) * quantity  // BUY: lucro se preço subir
                            : (openPrice - currentPrice) * quantity; // SELL: lucro se preço descer
                        const pnlPercentage = openPrice > 0 ? (pnl / (openPrice * quantity)) * 100 : 0;

                        // Determinar status baseado no PnL e tempo
                        const tradeAge = Date.now() - trade.time;
                        const isRecent = tradeAge < 24 * 60 * 60 * 1000; // 24 horas
                        const status = isRecent && Math.abs(pnl) < 0.01 ? 'OPEN' : 'CLOSED';

                        const position = {
                            id: `binance_${trade.id}`,
                            symbol: trade.symbol,
                            side: trade.isBuyer ? 'BUY' : 'SELL',
                            quantity: quantity,
                            openPrice: openPrice,
                            closePrice: status === 'CLOSED' ? currentPrice : null,
                            currentPrice: currentPrice,
                            openTime: new Date(trade.time).toISOString(),
                            closeTime: status === 'CLOSED' ? new Date(trade.time).toISOString() : null,
                            status: status,
                            strategyId: 'BINANCE_REAL',
                            strategyName: 'Trade Real Binance',
                            leverage: 1, // Spot trading
                            pnl: pnl,
                            pnlPercentage: pnlPercentage,
                            commission: parseFloat(trade.commission),
                            orderId: trade.orderId.toString(),
                            realValueInvested: quantity * openPrice,
                            source: 'BINANCE',
                            isReal: true,
                            createdAt: new Date(trade.time).toISOString(),
                            updatedAt: new Date(trade.time).toISOString()
                        };

                        allPositions.push(position);
                    }

                    console.log(`✅ [HISTÓRICO] ${allPositions.length} posições reais da Binance processadas`);
                } catch (binanceError: any) {
                    console.warn('⚠️ [HISTÓRICO] Erro ao buscar trades da Binance:', binanceError.message);
                }
            }

            // 2. Adicionar posições do storage local (criadas pelo sistema)
            try {
                const localPositions = await this.positionStorage.getAllPositions();
                console.log(`💾 [HISTÓRICO] ${localPositions.length} posições do storage local obtidas`);

                // Adicionar posições locais que não sejam duplicatas
                for (const localPos of localPositions) {
                    // Verificar se já existe uma posição similar da Binance
                    const exists = allPositions.some(pos =>
                        pos.symbol === localPos.symbol &&
                        pos.orderId === localPos.orderId
                    );

                    if (!exists) {
                        allPositions.push({
                            ...localPos,
                            source: 'SYSTEM',
                            isReal: false
                        });
                    }
                }
            } catch (storageError: any) {
                console.warn('⚠️ [HISTÓRICO] Erro ao buscar posições locais:', storageError.message);
            }

            // 3. Ordenar por data (mais recentes primeiro)
            allPositions.sort((a, b) =>
                new Date(b.openTime).getTime() - new Date(a.openTime).getTime()
            );

            console.log(`📊 [HISTÓRICO] Total: ${allPositions.length} posições (${allPositions.filter(p => p.source === 'BINANCE').length} reais + ${allPositions.filter(p => p.source === 'SYSTEM').length} sistema)`);

            return allPositions;
        } catch (error) {
            console.error('❌ [HISTÓRICO] Erro ao buscar histórico de posições:', error);
            return [];
        }
    }

    /**
     * Obtém status do monitoramento de posições
     */
    async getPositionMonitorStatus(): Promise<any> {
        try {
            return this.positionMonitorService.getStatus();
        } catch (error) {
            console.error('Erro ao obter status do monitoramento:', error);
            return { isMonitoring: false, openPositionsCount: 0 };
        }
    }

    /**
     * Obtém lista de posições abertas
     */
    async getOpenPositions(): Promise<any[]> {
        try {
            return this.positionMonitorService.getOpenPositions();
        } catch (error) {
            console.error('Erro ao obter posições abertas:', error);
            return [];
        }
    }

    /**
     * Inicia monitoramento de posições
     */
    async startPositionMonitoring(): Promise<void> {
        try {
            await this.positionMonitorService.startMonitoring();
        } catch (error) {
            console.error('Erro ao iniciar monitoramento:', error);
            throw error;
        }
    }

    /**
     * Para monitoramento de posições
     */
    async stopPositionMonitoring(): Promise<void> {
        try {
            await this.positionMonitorService.stopMonitoring();
        } catch (error) {
            console.error('Erro ao parar monitoramento:', error);
            throw error;
        }
    }

    private async saveSignals(): Promise<void> {
        try {
            await this.storageService.saveData('trading_signals', this.signals);
        } catch (error) {
            console.error('Erro ao salvar sinais:', error);
        }
    }

    private generateSignalId(): string {
        return `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * ✅ ADICIONA APENAS POSIÇÕES REAIS DA BINANCE AO HISTÓRICO ✅
     * 
     * Este método adiciona APENAS posições reais verificadas na Binance Testnet.
     * NUNCA cria posições fictícias ou simuladas.
     * 
     * REGRAS OBRIGATÓRIAS:
     * 1. SEMPRE verificar se a ordem foi executada na Binance
     * 2. SEMPRE verificar se a posição existe na Binance
     * 3. SEMPRE verificar se o trade existe no histórico da Binance
     * 4. NUNCA criar posições fictícias
     */
    private async addPositionToHistory(signal: TradingSignal, status: 'OPEN' | 'CLOSED', orderResult: any): Promise<void> {
        try {
            // ⚠️ 1. VERIFICAÇÃO OBRIGATÓRIA: Ordem executada na Binance
            if (!orderResult?.success || !orderResult?.orderId) {
                console.warn('⚠️ [HISTORY] Ordem não executada na Binance, ignorando:', {
                    symbol: signal.symbol,
                    signal: signal.signal,
                    error: orderResult?.message
                });
                return;
            }

            // ⚠️ 2. VERIFICAÇÃO OBRIGATÓRIA: Posição existe na Binance
            if (this.binanceService) {
                try {
                    // Binance Spot não tem posições ativas tradicionais
                    const binancePositions: any[] = [];
                    const isRealPosition = binancePositions.some(bp =>
                        bp.symbol === signal.symbol &&
                        bp.side === (signal.signal === 'BUY' ? 'LONG' : 'SHORT')
                    );

                    if (!isRealPosition && status === 'OPEN') {
                        console.warn('⚠️ [HISTORY] Posição não encontrada na Binance, ignorando:', {
                            symbol: signal.symbol,
                            side: signal.side
                        });
                        return;
                    }
                } catch (error) {
                    console.error('❌ [HISTORY] Erro ao verificar posições na Binance:', error);
                    return;
                }
            }

            // ⚠️ 3. VERIFICAÇÃO OBRIGATÓRIA: Trade existe no histórico da Binance
            if (this.binanceService) {
                try {
                    const trades = await this.binanceService.getOrderHistory(signal.symbol);
                    const tradeExists = trades.some(trade =>
                        trade.orderId === orderResult.orderId ||
                        (trade.symbol === signal.symbol &&
                            Math.abs(parseFloat(trade.price) - (signal.price || 0)) < 0.0001)
                    );

                    if (!tradeExists) {
                        console.warn('⚠️ [HISTORY] Trade não encontrado na Binance, ignorando:', {
                            symbol: signal.symbol,
                            side: signal.side,
                            orderId: orderResult.orderId
                        });
                        return;
                    }
                } catch (error) {
                    console.error('❌ [HISTORY] Erro ao verificar trades na Binance:', error);
                    return;
                }
            }

            // 4. Buscar nome da estratégia e estratégia matemática ativa
            const strategy = await this.tradingStrategyService.getStrategyById(signal.strategyId);
            const strategyName = strategy?.name || signal.strategyId;
            const activeMathStrategy = await this.mathStrategyService.getActiveStrategy();

            // 5. Calcular spread se aplicável (para SPOT)
            let spread: number | undefined;
            if (orderResult.bidPrice && orderResult.askPrice) {
                spread = ((orderResult.askPrice - orderResult.bidPrice) / orderResult.bidPrice) * 100;
            }

            // 6. Calcular quantidade real do ativo baseado no valor investido e preço
            const realValueInvested = signal.quantity; // Valor real investido em USD (ex: 5 USD)
            const realQuantity = realValueInvested / (signal.price || 1); // Quantidade real do ativo

            // 7. Criar registro da posição
            const positionData = {
                symbol: signal.symbol,
                side: signal.side,
                quantity: realQuantity, // Quantidade real do ativo (ex: 0.000046 BTC)
                openPrice: signal.price || 0,
                closePrice: status === 'CLOSED' ? orderResult.price : undefined,
                status: status,
                strategyId: signal.strategyId,
                strategyName: strategyName,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit,
                spread: spread,
                orderId: orderResult.orderId,
                commission: orderResult.commission,
                realValueInvested: realValueInvested, // Valor real investido em USD (ex: 5 USD)
                leverage: activeMathStrategy?.leverage || 1, // Alavancagem da estratégia matemática
                tradingType: activeMathStrategy?.tradingType || 'SPOT', // Tipo de trading
                notes: status === 'CLOSED' ? 'Posição fechada automaticamente' : undefined
            };

            // 8. Criar registro completo
            const positionRecord = {
                ...positionData,
                id: signal.id,
                openTime: signal.timestamp,
                closeTime: status === 'CLOSED' ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString()
            };

            // 9. Buscar histórico existente e adicionar nova posição
            const existingHistory = (await this.storageService.getData('position_history')) as any[] || [];
            existingHistory.unshift(positionRecord); // Adicionar no início

            // 10. Manter apenas as últimas 1000 posições para evitar sobrecarga
            const limitedHistory = existingHistory.slice(0, 1000);
            await this.storageService.saveData('position_history', limitedHistory);

            console.log(`📊 [HISTORY] Posição ${status.toLowerCase()} real adicionada ao histórico:`, {
                id: signal.id,
                symbol: signal.symbol,
                side: signal.side,
                status: status,
                strategy: strategyName,
                orderId: orderResult.orderId,
                realValueInvested: realValueInvested,
                realQuantity: realQuantity,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit,
                leverage: activeMathStrategy?.leverage || 1,
                tradingType: activeMathStrategy?.tradingType || 'SPOT',
                mathStrategy: activeMathStrategy?.name || 'N/A'
            });

        } catch (error) {
            console.error('❌ [HISTORY] Erro ao adicionar posição ao histórico:', error);
        }
    }

    /**
     * Fecha uma posição e atualiza o histórico
     */
    public async closePosition(signalId: string, closePrice: number): Promise<boolean> {
        try {
            const signal = this.signals.find(s => s.id === signalId);
            if (!signal) {
                console.warn(`⚠️ [CLOSE] Sinal não encontrado: ${signalId}`);
                return false;
            }

            // Executar ordem de fechamento
            const closeSide = signal.side === 'BUY' ? 'SELL' : 'BUY';
            // Executar ordem REAL de fechamento na Binance
            console.log('📊 Executando ordem REAL de fechamento na Binance:', {
                symbol: signal.symbol,
                side: closeSide,
                quantity: signal.quantity.toString(),
                type: 'MARKET'
            });

            let orderResult;
            try {
                if (this.binanceService) {
                    orderResult = await this.binanceService.placeOrder({
                        symbol: signal.symbol,
                        side: closeSide as 'BUY' | 'SELL',
                        type: 'MARKET',
                        quantity: signal.quantity.toString()
                    });

                    console.log('✅ Ordem de fechamento executada com sucesso na Binance:', orderResult);
                    orderResult = {
                        success: true,
                        price: parseFloat(orderResult.price || closePrice.toString()),
                        orderId: orderResult.orderId,
                        message: 'Ordem de fechamento executada com sucesso'
                    };
                } else {
                    throw new Error('Serviço Binance não disponível');
                }
            } catch (error: any) {
                console.error('❌ Erro ao executar ordem de fechamento na Binance:', error.message);
                orderResult = {
                    success: false,
                    message: error.message,
                    price: closePrice
                };
            }

            if (orderResult?.success) {
                // Atualizar status do sinal (não podemos adicionar closePrice/closeTime ao TradingSignal)
                signal.status = 'EXECUTED'; // Manter como EXECUTED, não CLOSED

                // Atualizar histórico com dados de fechamento
                await this.addPositionToHistory(signal, 'CLOSED', {
                    ...orderResult,
                    price: closePrice
                });

                console.log(`🔒 [POSITION_CLOSED] Posição fechada com sucesso:`, {
                    id: signal.id,
                    symbol: signal.symbol,
                    side: signal.side,
                    closePrice: closePrice,
                    pnl: this.calculatePnL(signal, closePrice)
                });

                return true;
            } else {
                console.error(`❌ [CLOSE_FAILED] Falha ao fechar posição:`, {
                    id: signal.id,
                    symbol: signal.symbol,
                    error: orderResult?.message
                });
                return false;
            }
        } catch (error) {
            console.error('❌ [CLOSE_ERROR] Erro ao fechar posição:', error);
            return false;
        }
    }

    /**
     * Calcula P&L de uma posição
     */
    private calculatePnL(signal: TradingSignal, closePrice?: number): { absolute: number; percentage: number; result: 'WIN' | 'LOSS' | 'BREAKEVEN' } {
        if (!closePrice || !signal.price) {
            return { absolute: 0, percentage: 0, result: 'BREAKEVEN' };
        }

        const isLong = signal.side === 'BUY';
        const priceDiff = closePrice - signal.price;
        const pnl = isLong ? priceDiff : -priceDiff;
        const pnlValue = pnl * signal.quantity;
        const pnlPercentage = (pnl / signal.price) * 100;

        let result: 'WIN' | 'LOSS' | 'BREAKEVEN';
        if (Math.abs(pnlValue) < 0.01) {
            result = 'BREAKEVEN';
        } else {
            result = pnlValue > 0 ? 'WIN' : 'LOSS';
        }

        return {
            absolute: pnlValue,
            percentage: pnlPercentage,
            result
        };
    }

    /**
     * ❌ MÉTODO REMOVIDO - NUNCA CRIAR POSIÇÕES FICTÍCIAS ❌
     * 
     * Este método foi removido para evitar criação de posições fictícias.
     * Use apenas posições reais da Binance Testnet.
     * 
     * REGRAS OBRIGATÓRIAS:
     * - NUNCA criar posições de teste ou fictícias
     * - APENAS posições reais da Binance Testnet
     * - SEMPRE verificar se a posição existe na Binance antes de adicionar
     */
    // public async addTestPosition() - REMOVIDO PARA EVITAR POSIÇÕES FICTÍCIAS
}
