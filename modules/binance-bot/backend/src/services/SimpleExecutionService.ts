import { logger } from '../utils/logger';
import { BinanceApiService } from './BinanceApiService';
import { PositionStorageService } from './PositionStorageService';

export interface SimpleTradeSignal {
    symbol: string;
    side: 'BUY' | 'SELL';
    amount: number;
    strategy: string;
    confidence: number;
}

export interface SimpleExecutionResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

export class SimpleExecutionService {
    private positionStorage: PositionStorageService;
    private binanceService: BinanceApiService;

    constructor(binanceService: BinanceApiService) {
        this.positionStorage = new PositionStorageService();
        this.binanceService = binanceService;
        logger.info('🚀 SimpleExecutionService initialized for REAL Binance Testnet execution');
    }

    /**
     * Find the best trading pair for a symbol
     * Try FDUSD first, then USDT, then keep original if neither works
     */
    private async findBestTradingPair(symbol: string): Promise<string> {
        try {
            // Lista de símbolos que têm par FDUSD disponível
            const fdusdSymbols = [
                'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT',
                'XRPUSDT', 'LTCUSDT', 'BCHUSDT', 'LINKUSDT', 'UNIUSDT',
                'AVAXUSDT', 'DOTUSDT', 'MATICUSDT', 'ATOMUSDT', 'FILUSDT'
            ];

            // Se é USDT e tem par FDUSD, tentar FDUSD primeiro
            if (symbol.endsWith('USDT') && fdusdSymbols.includes(symbol)) {
                const fdusdSymbol = symbol.replace('USDT', 'FDUSD');
                try {
                    // Testar se o par FDUSD existe verificando o preço
                    await this.binanceService.getCurrentPrice(fdusdSymbol);
                    logger.info(`✅ Usando par FDUSD: ${fdusdSymbol}`);
                    return fdusdSymbol;
                } catch (error) {
                    logger.warn(`⚠️ Par FDUSD não disponível para ${symbol}, usando USDT`);
                }
            }

            // Se não tem par FDUSD ou falhou, usar o símbolo original
            logger.info(`✅ Usando símbolo original: ${symbol}`);
            return symbol;

        } catch (error) {
            logger.warn(`⚠️ Erro ao encontrar par para ${symbol}, usando original:`, error);
            return symbol;
        }
    }

    /**
     * Execute a trading signal (for now, just logs the execution)
     */
    async executeOrder(signal: SimpleTradeSignal): Promise<SimpleExecutionResult> {
        try {
            logger.info(`🚀 EXECUTANDO ORDEM REAL NA BINANCE TESTNET: ${signal.side} ${signal.symbol}`);
            logger.info(`💰 Quantidade: ${signal.amount}, Estratégia: ${signal.strategy}`);
            logger.info(`📊 Confiança: ${signal.confidence}%`);

            // 1. EXECUTAR ORDEM REAL NA BINANCE TESTNET
            let binanceOrderResult;
            try {
                // Encontrar o melhor par de trading disponível
                const tradingSymbol = await this.findBestTradingPair(signal.symbol);
                logger.info(`🔄 Usando par de trading: ${signal.symbol} → ${tradingSymbol}`);

                // Obter preço atual real do símbolo
                const currentPrice = await this.binanceService.getCurrentPrice(tradingSymbol);
                logger.info(`💹 Preço atual REAL da Binance (${tradingSymbol}): ${currentPrice}`);

                // Converter valor em dólares para quantidade real da moeda
                const realQuantity = signal.amount / currentPrice;
                logger.info(`💰 Conversão: $${signal.amount} ÷ $${currentPrice} = ${realQuantity} ${tradingSymbol}`);

                // Buscar regras de trading dinamicamente
                const exchangeInfo = await this.binanceService.getExchangeInfo();
                const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === tradingSymbol);

                if (!symbolInfo) {
                    throw new Error(`Símbolo ${tradingSymbol} não encontrado`);
                }

                const lotSizeFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
                const minNotionalFilter = symbolInfo.filters.find(f => f.filterType === 'NOTIONAL');

                if (!lotSizeFilter || !minNotionalFilter) {
                    throw new Error(`Regras de trading não encontradas para ${tradingSymbol}`);
                }

                const minQuantity = parseFloat(lotSizeFilter.minQty);
                const stepSize = parseFloat(lotSizeFilter.stepSize);
                const minNotional = parseFloat(minNotionalFilter.minNotional);

                logger.info(`📋 Regras de trading para ${tradingSymbol}: minQty=${minQuantity}, stepSize=${stepSize}, minNotional=$${minNotional}`);

                let adjustedQuantity = realQuantity;
                let adjustedValue = adjustedQuantity * currentPrice;

                // Se a quantidade for muito pequena, ajustar para o mínimo
                if (adjustedQuantity < minQuantity) {
                    adjustedQuantity = minQuantity;
                    adjustedValue = adjustedQuantity * currentPrice;
                    logger.info(`⚠️ Quantidade muito pequena, ajustando para mínimo: ${adjustedQuantity} ${tradingSymbol}`);
                }

                // Se o valor ainda for menor que o mínimo, ajustar para o mínimo
                if (adjustedValue < minNotional) {
                    adjustedQuantity = minNotional / currentPrice;
                    adjustedValue = minNotional;
                    logger.info(`⚠️ Valor muito pequeno, ajustando para $${minNotional}: ${adjustedQuantity} ${tradingSymbol}`);
                }

                // Ajustar quantidade para o stepSize correto
                const steps = Math.ceil(adjustedQuantity / stepSize);
                adjustedQuantity = steps * stepSize;
                adjustedValue = adjustedQuantity * currentPrice;

                logger.info(`🔧 Ajustando para stepSize: ${adjustedQuantity} ${tradingSymbol} (${steps} steps de ${stepSize})`);

                logger.info(`✅ Quantidade final: ${adjustedQuantity} ${tradingSymbol} (valor: $${adjustedValue.toFixed(2)})`);

                // Executar ordem REAL na Binance Testnet
                const orderParams = {
                    symbol: tradingSymbol,
                    side: signal.side,
                    type: 'MARKET' as const,
                    quantity: adjustedQuantity.toFixed(8) // Convert to string with 8 decimal places
                };

                logger.info(`📋 Enviando ordem REAL para Binance Testnet:`, orderParams);
                binanceOrderResult = await this.binanceService.placeOrder(orderParams);

                if (!binanceOrderResult.success) {
                    throw new Error(`Falha na execução Binance: ${binanceOrderResult.message}`);
                }

                logger.info(`✅ ORDEM REAL EXECUTADA NA BINANCE: ${binanceOrderResult.data?.orderId}`);

                // 2. ARMAZENAR POSIÇÃO REAL LOCALMENTE
                const positionData = {
                    symbol: tradingSymbol, // Usar símbolo de trading encontrado
                    side: signal.side,
                    quantity: adjustedQuantity, // Usar quantidade ajustada
                    openPrice: currentPrice,
                    status: 'OPEN' as const,
                    strategyName: signal.strategy,
                    orderId: binanceOrderResult.data?.orderId || `REAL_${Date.now()}`,
                    notes: `✅ REAL: Ordem executada na Binance Testnet (${tradingSymbol}) - OrderId: ${binanceOrderResult.data?.orderId} - Valor: $${adjustedValue.toFixed(2)}`,
                    realValueInvested: adjustedValue, // Valor real investido
                    openTime: binanceOrderResult.data?.transactTime ? new Date(binanceOrderResult.data.transactTime).toISOString() : new Date().toISOString()
                };

                // Armazenar no storage local REAL
                const storedPosition = await this.positionStorage.addRealBinancePosition(positionData);
                logger.info(`💾 Posição REAL armazenada localmente:`, {
                    id: storedPosition.id,
                    orderId: storedPosition.orderId,
                    symbol: storedPosition.symbol
                });

                return {
                    success: true,
                    orderId: binanceOrderResult.data?.orderId
                };

            } catch (binanceError: any) {
                logger.error(`❌ ERRO na execução REAL Binance:`, {
                    message: binanceError.message,
                    signal: signal
                });

                // Se falha na Binance, não criar posição local
                return {
                    success: false,
                    error: `Falha na execução Binance: ${binanceError.message}`
                };
            }

        } catch (error: any) {
            logger.error(`❌ Erro geral na execução de ordem:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get execution stats
     */
    getStats() {
        return {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            status: 'ready'
        };
    }
}