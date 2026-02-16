import { BinanceApiService } from './BinanceApiService';
import { StrategyStorageService, TradingSignal } from './StrategyStorageService';

interface PositionStatus {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    stopLoss: number;
    takeProfit: number;
    pnl: number;
    pnlPercentage: number;
    shouldClose: boolean;
    closeReason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL' | null;
}

export class PositionMonitorService {
    private binanceService: BinanceApiService | null = null;
    private storageService: StrategyStorageService;
    private isMonitoring: boolean = false;
    private monitoringInterval: NodeJS.Timeout | null = null;
    private openPositions: Map<string, TradingSignal> = new Map();

    constructor(binanceService?: BinanceApiService) {
        this.binanceService = binanceService || null;
        this.storageService = new StrategyStorageService();
    }

    /**
     * Inicia o monitoramento de posições abertas
     */
    async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            console.log('⚠️ Monitoramento já está ativo');
            return;
        }

        try {
            this.isMonitoring = true;
            console.log('🔍 Iniciando monitoramento de posições abertas...');

            // Carregar posições abertas do storage
            await this.loadOpenPositions();

            // Iniciar intervalo de monitoramento (a cada 10 segundos)
            this.monitoringInterval = setInterval(async () => {
                await this.checkPositions();
            }, 10000);

            console.log('✅ Monitoramento de posições iniciado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao iniciar monitoramento:', error);
            this.isMonitoring = false;
        }
    }

    /**
     * Para o monitoramento
     */
    async stopMonitoring(): Promise<void> {
        if (!this.isMonitoring) {
            return;
        }

        try {
            this.isMonitoring = false;

            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }

            console.log('🛑 Monitoramento de posições parado');

        } catch (error) {
            console.error('❌ Erro ao parar monitoramento:', error);
        }
    }

    /**
     * Carrega posições abertas do storage
     */
    private async loadOpenPositions(): Promise<void> {
        try {
            const positionHistory = await this.storageService.getData('position_history') as any[] || [];

            // Filtrar apenas posições abertas (status OPEN)
            const openPositions = positionHistory.filter((pos: any) => pos.status === 'OPEN');

            this.openPositions.clear();

            for (const position of openPositions) {
                const signal: TradingSignal = {
                    id: position.id,
                    strategyId: position.strategyId,
                    symbol: position.symbol,
                    signal: position.side as 'BUY' | 'SELL',
                    side: position.side,
                    strength: 0,
                    price: position.openPrice,
                    quantity: position.quantity,
                    timestamp: new Date(position.openTime).getTime(),
                    confidence: 0,
                    status: 'EXECUTED',
                    reason: position.reason || '',
                    reasons: [position.reason || 'Posição executada'],
                    stopLoss: position.stopLoss,
                    takeProfit: position.takeProfit,
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

                this.openPositions.set(position.id, signal);
            }

            console.log(`📊 Carregadas ${this.openPositions.size} posições abertas para monitoramento`);

        } catch (error) {
            console.error('❌ Erro ao carregar posições abertas:', error);
        }
    }

    /**
     * Verifica todas as posições abertas
     */
    private async checkPositions(): Promise<void> {
        if (!this.isMonitoring || this.openPositions.size === 0) {
            return;
        }

        try {
            console.log(`🔍 Verificando ${this.openPositions.size} posições abertas...`);

            for (const [positionId, signal] of this.openPositions) {
                await this.checkPosition(signal);
            }

        } catch (error) {
            console.error('❌ Erro ao verificar posições:', error);
        }
    }

    /**
     * Verifica uma posição específica
     */
    private async checkPosition(signal: TradingSignal): Promise<void> {
        try {
            // Obter preço atual
            const currentPrice = await this.getCurrentPrice(signal.symbol);
            if (!currentPrice) {
                console.warn(`⚠️ Não foi possível obter preço atual para ${signal.symbol}`);
                return;
            }

            // Calcular P&L
            const pnl = this.calculatePnL(signal, currentPrice);

            // Verificar se deve fechar a posição
            const shouldClose = this.shouldClosePosition(signal, currentPrice);

            if (shouldClose.shouldClose) {
                console.log(`🎯 Fechando posição ${signal.symbol}: ${shouldClose.closeReason}`);
                await this.closePosition(signal, currentPrice, shouldClose.closeReason!);
            } else {
                // Log do status da posição (a cada 5 verificações para não spam)
                if (Math.random() < 0.2) { // 20% de chance de logar
                    console.log(`📊 Posição ${signal.symbol}: P&L ${pnl.percentage.toFixed(2)}% (${pnl.absolute.toFixed(2)} USDT)`);
                }
            }

        } catch (error) {
            console.error(`❌ Erro ao verificar posição ${signal.symbol}:`, error);
        }
    }

    /**
     * Obtém preço atual de um símbolo
     */
    private async getCurrentPrice(symbol: string): Promise<number | null> {
        try {
            console.log(`💰 [POSITION_MONITOR] Buscando preço REAL para ${symbol}...`);

            // Se temos BinanceApiService, usar ele
            if (this.binanceService) {
                const price = await this.binanceService.getCurrentPrice(symbol);
                if (price && price > 0) {
                    console.log(`✅ [POSITION_MONITOR] Preço REAL obtido para ${symbol}: $${price}`);
                    return price;
                }
            }

            console.log(`⚠️ [POSITION_MONITOR] Fallback: tentando API pública para ${symbol}...`);

            // Fallback: API pública da Binance (sem auth)
            const axios = require('axios');
            const response = await axios.get(`https://testnet.binance.vision/api/v3/ticker/price?symbol=${symbol}`);

            if (response.data && response.data.price) {
                const price = parseFloat(response.data.price);
                console.log(`✅ [POSITION_MONITOR] Preço via API pública para ${symbol}: $${price}`);
                return price;
            }

            console.log(`❌ [POSITION_MONITOR] Não foi possível obter preço para ${symbol}`);
            return null;
        } catch (error) {
            console.error(`❌ [POSITION_MONITOR] Erro ao obter preço de ${symbol}:`, error);
            return null;
        }
    }

    /**
     * Calcula P&L de uma posição
     */
    private calculatePnL(signal: TradingSignal, currentPrice: number): { absolute: number; percentage: number } {
        const isLong = signal.side === 'BUY';
        const priceDiff = currentPrice - signal.price;
        const pnl = isLong ? priceDiff : -priceDiff;
        const pnlValue = pnl * signal.quantity;
        const pnlPercentage = (pnl / signal.price) * 100;

        return {
            absolute: pnlValue,
            percentage: pnlPercentage
        };
    }

    /**
     * Verifica se uma posição deve ser fechada
     */
    private shouldClosePosition(signal: TradingSignal, currentPrice: number): { shouldClose: boolean; closeReason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL' | null } {
        if (!signal.stopLoss || !signal.takeProfit) {
            return { shouldClose: false, closeReason: null };
        }

        const pnl = this.calculatePnL(signal, currentPrice);
        const isLong = signal.side === 'BUY';

        // Verificar Stop Loss
        if (isLong && pnl.percentage <= -signal.stopLoss) {
            return { shouldClose: true, closeReason: 'STOP_LOSS' };
        }
        if (!isLong && pnl.percentage <= -signal.stopLoss) {
            return { shouldClose: true, closeReason: 'STOP_LOSS' };
        }

        // Verificar Take Profit
        if (isLong && pnl.percentage >= signal.takeProfit) {
            return { shouldClose: true, closeReason: 'TAKE_PROFIT' };
        }
        if (!isLong && pnl.percentage >= signal.takeProfit) {
            return { shouldClose: true, closeReason: 'TAKE_PROFIT' };
        }

        return { shouldClose: false, closeReason: null };
    }

    /**
     * Fecha uma posição
     */
    private async closePosition(signal: TradingSignal, closePrice: number, reason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL'): Promise<void> {
        try {
            console.log(`🔒 Fechando posição ${signal.symbol} por ${reason}:`, {
                entryPrice: signal.price,
                closePrice: closePrice,
                side: signal.side,
                quantity: signal.quantity
            });

            // Executar ordem de fechamento
            const closeSide = signal.side === 'BUY' ? 'SELL' : 'BUY';
            console.log(`📊 Ordem de fechamento preparada: ${closeSide} ${signal.quantity} ${signal.symbol}`);

            // Executar ordem de fechamento REAL na Binance
            let orderResult = { success: false, message: 'Serviço de negociação não disponível' };

            if (this.binanceService) {
                try {
                    console.log(`🚀 [CLOSE_ORDER] Executando ordem de fechamento REAL: ${closeSide} ${signal.quantity} ${signal.symbol}`);

                    // Ajustar precisão da quantidade para evitar erro "too much precision"
                    const adjustedQuantity = parseFloat(signal.quantity.toFixed(8));

                    const closeOrderData = {
                        symbol: signal.symbol,
                        side: closeSide as 'BUY' | 'SELL',
                        type: 'MARKET' as const,
                        quantity: adjustedQuantity.toString()
                    };

                    const binanceResponse = await this.binanceService.placeOrder(closeOrderData);

                    if (binanceResponse) {
                        orderResult = {
                            success: true,
                            message: `Posição fechada com sucesso via ${reason} (ID: ${binanceResponse.orderId || 'N/A'})`
                        };
                        console.log(`✅ [CLOSE_SUCCESS] Posição ${signal.symbol} fechada com sucesso!`, binanceResponse);
                    }
                } catch (closeError: any) {
                    console.error(`❌ [CLOSE_ERROR] Erro ao fechar posição ${signal.symbol}:`, closeError);
                    orderResult = {
                        success: false,
                        message: `Erro ao fechar: ${closeError.message || 'Erro desconhecido'}`
                    };
                }
            }

            if (orderResult?.success) {
                // Calcular P&L final
                const finalPnl = this.calculatePnL(signal, closePrice);

                console.log(`✅ Posição ${signal.symbol} fechada com sucesso:`, {
                    reason: reason,
                    pnl: finalPnl.absolute.toFixed(2),
                    pnlPercentage: finalPnl.percentage.toFixed(2) + '%',
                    result: finalPnl.absolute > 0 ? 'WIN' : finalPnl.absolute < 0 ? 'LOSS' : 'BREAKEVEN'
                });

                // Atualizar histórico
                await this.updatePositionHistory(signal, closePrice, reason, finalPnl);

                // Remover da lista de posições abertas
                this.openPositions.delete(signal.id);

            } else {
                console.error(`❌ Falha ao fechar posição ${signal.symbol}:`, orderResult?.message);
            }

        } catch (error) {
            console.error(`❌ Erro ao fechar posição ${signal.symbol}:`, error);
        }
    }

    /**
     * Atualiza o histórico de posições
     */
    private async updatePositionHistory(signal: TradingSignal, closePrice: number, reason: string, pnl: { absolute: number; percentage: number }): Promise<void> {
        try {
            const positionHistory = await this.storageService.getData('position_history') as any[] || [];

            // Encontrar a posição no histórico
            const positionIndex = positionHistory.findIndex((pos: any) => pos.id === signal.id);

            if (positionIndex !== -1) {
                // Atualizar posição
                positionHistory[positionIndex] = {
                    ...positionHistory[positionIndex],
                    status: 'CLOSED',
                    closePrice: closePrice,
                    closeTime: new Date().toISOString(),
                    pnl: pnl.absolute,
                    pnlPercentage: pnl.percentage,
                    result: pnl.absolute > 0 ? 'WIN' : pnl.absolute < 0 ? 'LOSS' : 'BREAKEVEN',
                    closeReason: reason,
                    updatedAt: new Date().toISOString()
                };

                // Salvar histórico atualizado
                await this.storageService.saveData('position_history', positionHistory);

                console.log(`📊 Histórico atualizado para posição ${signal.symbol}`);
            }

        } catch (error) {
            console.error('❌ Erro ao atualizar histórico:', error);
        }
    }

    /**
     * Adiciona uma nova posição para monitoramento
     */
    addPosition(signal: TradingSignal): void {
        this.openPositions.set(signal.id, signal);
        console.log(`📊 Nova posição adicionada ao monitoramento: ${signal.symbol}`);
    }

    /**
     * Remove uma posição do monitoramento
     */
    removePosition(positionId: string): void {
        this.openPositions.delete(positionId);
        console.log(`📊 Posição removida do monitoramento: ${positionId}`);
    }

    /**
     * Obtém status do monitoramento
     */
    getStatus(): { isMonitoring: boolean; openPositionsCount: number } {
        return {
            isMonitoring: this.isMonitoring,
            openPositionsCount: this.openPositions.size
        };
    }

    /**
     * Obtém lista de posições abertas
     */
    getOpenPositions(): TradingSignal[] {
        return Array.from(this.openPositions.values());
    }
}
