import { BinanceApiService } from './trigger-binance-service';
import { logger } from './trigger-logger';

interface TriggerExecution {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    buyPrice?: number;
    profitTrigger?: number;
    lossTrigger?: number;
    isSold?: boolean;
}

class TriggerMonitor {
    private binanceService: BinanceApiService;
    private isRunning: boolean = false;
    private executions: TriggerExecution[] = [];
    private prices: Record<string, number> = {};
    private triggeredExecutions: Set<string> = new Set();

    constructor() {
        this.binanceService = new BinanceApiService({
            apiKey: process.env.BINANCE_API_KEY || '',
            secretKey: process.env.BINANCE_SECRET_KEY || '',
            isTestnet: process.env.BINANCE_TESTNET === 'true'
        });
    }

    async start() {
        logger.info('🚀 [TRIGGER MONITOR] Iniciando monitor de gatilhos...');
        this.isRunning = true;

        // Loop principal de monitoramento
        while (this.isRunning) {
            try {
                await this.loadExecutions();
                await this.updatePrices();
                this.checkTriggers();

                // Aguardar 5 segundos antes da próxima verificação
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error) {
                logger.error('❌ [TRIGGER MONITOR] Erro no loop principal:', error);
                await new Promise(resolve => setTimeout(resolve, 10000)); // Aguardar 10s em caso de erro
            }
        }
    }

    async stop() {
        logger.info('🛑 [TRIGGER MONITOR] Parando monitor de gatilhos...');
        this.isRunning = false;
    }

    private async loadExecutions() {
        try {
            // Buscar execuções do backend
            const response = await fetch(`${process.env.API_URL}/binance/trades`);
            if (!response.ok) return;

            const data: any = await response.json();
            if (data.success && data.trades) {
                this.executions = data.trades.filter((exec: any) =>
                    exec.side === 'BUY' &&
                    !exec.isSold &&
                    (exec.profitTrigger > 0 || exec.lossTrigger < 0)
                );

                logger.info(`📊 [TRIGGER MONITOR] ${this.executions.length} execuções monitoradas`);
            }
        } catch (error) {
            logger.error('❌ [TRIGGER MONITOR] Erro ao carregar execuções:', error);
        }
    }

    private async updatePrices() {
        try {
            const symbols = [...new Set(this.executions.map(exec => exec.symbol))];
            if (symbols.length === 0) return;

            const prices: Record<string, number> = {};
            for (const symbol of symbols) {
                try {
                    const price = await this.binanceService.getCurrentPrice(symbol);
                    if (price !== null) {
                        prices[symbol] = price;
                    }
                } catch (error) {
                    logger.error(`❌ [TRIGGER MONITOR] Erro ao buscar preço para ${symbol}:`, error);
                }
            }
            this.prices = prices;

            logger.info(`💰 [TRIGGER MONITOR] Preços atualizados para ${Object.keys(prices).length} símbolos`);
        } catch (error) {
            logger.error('❌ [TRIGGER MONITOR] Erro ao atualizar preços:', error);
        }
    }

    private checkTriggers() {
        this.executions.forEach(execution => {
            if (this.triggeredExecutions.has(execution.id)) return;

            const currentPrice = this.prices[execution.symbol];
            if (!currentPrice) return;

            const buyPrice = execution.buyPrice || execution.price;
            const profitIfSellNow = execution.quantity * currentPrice - execution.quantity * buyPrice;

            // Verificar gatilho de lucro
            if (execution.profitTrigger && profitIfSellNow >= execution.profitTrigger) {
                logger.info(`🚀 [TRIGGER] Gatilho de LUCRO ativado para ${execution.symbol}: $${profitIfSellNow.toFixed(2)} >= $${execution.profitTrigger}`);
                this.triggerSell(execution, 'PROFIT');
                return;
            }

            // Verificar gatilho de perda
            if (execution.lossTrigger && profitIfSellNow <= execution.lossTrigger) {
                logger.info(`🛑 [TRIGGER] Gatilho de PERDA ativado para ${execution.symbol}: $${profitIfSellNow.toFixed(2)} <= $${execution.lossTrigger}`);
                this.triggerSell(execution, 'LOSS');
                return;
            }
        });
    }

    private async triggerSell(execution: TriggerExecution, triggerType: 'PROFIT' | 'LOSS') {
        try {
            this.triggeredExecutions.add(execution.id);

            logger.info(`⚡ [TRIGGER] Executando venda automática: ${execution.symbol} (${triggerType})`);

            // Executar venda via Binance
            const result = await this.binanceService.marketSell(execution.symbol, execution.quantity);

            logger.info(`✅ [TRIGGER] Venda automática concluída: ${execution.symbol}`, result);

            // Notificar o backend sobre a venda
            await this.notifyBackend(execution, result);

        } catch (error) {
            logger.error(`❌ [TRIGGER] Erro na venda automática:`, error);
            this.triggeredExecutions.delete(execution.id);
        }
    }

    private async notifyBackend(execution: TriggerExecution, sellResult: any) {
        try {
            const response = await fetch(`${process.env.API_URL}/binance/trigger-sell`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    executionId: execution.id,
                    sellResult: sellResult,
                    triggerType: 'AUTOMATIC'
                })
            });

            if (response.ok) {
                logger.info(`📡 [TRIGGER] Backend notificado sobre venda: ${execution.symbol}`);
            }
        } catch (error) {
            logger.error('❌ [TRIGGER] Erro ao notificar backend:', error);
        }
    }
}

// Inicializar o monitor
const monitor = new TriggerMonitor();

// Tratamento de sinais para parada limpa
process.on('SIGINT', async () => {
    await monitor.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await monitor.stop();
    process.exit(0);
});

// Iniciar o monitor
monitor.start().catch(error => {
    logger.error('❌ [TRIGGER MONITOR] Erro fatal:', error);
    process.exit(1);
});

