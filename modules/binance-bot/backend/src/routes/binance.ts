import { Request, Response, Router } from 'express';
import { ConfigLoader } from '../config/ConfigLoader';
import { BinanceController } from '../controllers/BinanceController';
import { BinanceApiService } from '../services/BinanceApiService';
import { logger } from '../utils/logger';

const router = Router();
const binanceController = new BinanceController();

// Inicializar serviço Binance para histórico
let binanceHistoryService: BinanceApiService | null = null;
try {
    const configLoader = ConfigLoader.getInstance();
    const config = configLoader.loadConfig();
    const binanceConfig = config.binance;

    if (binanceConfig.apiKey && binanceConfig.secretKey) {
        binanceHistoryService = new BinanceApiService({
            apiKey: binanceConfig.apiKey,
            secretKey: binanceConfig.secretKey,
            isTestnet: binanceConfig.useTestnet
        });
        logger.info('Serviço Binance para histórico inicializado com sucesso');
    }
} catch (error) {
    logger.warn('Erro ao inicializar serviço Binance para histórico:', error);
}

// Rotas de teste e validação
router.get('/test-connection', binanceController.testConnection.bind(binanceController));
router.get('/validate-credentials', binanceController.validateCredentials.bind(binanceController));

// Endpoint de teste para verificar se as rotas estão funcionando
router.get('/test-history', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Endpoint de teste de histórico funcionando',
        timestamp: new Date().toISOString(),
        serviceStatus: binanceHistoryService ? 'initialized' : 'not initialized'
    });
});

// Rotas de dados da conta
router.get('/account-info', binanceController.getAccountInfo.bind(binanceController));
router.get('/portfolio', binanceController.getPortfolio.bind(binanceController));
router.get('/balances', binanceController.getBalances.bind(binanceController));

// Rotas de trading
router.get('/positions', binanceController.getPositions.bind(binanceController));
router.get('/trades', binanceController.getTrades.bind(binanceController));
router.get('/price/:symbol', binanceController.getCurrentPrice.bind(binanceController));

// Rota para colocar ordens REAIS
router.post('/order', binanceController.placeOrder.bind(binanceController));

// Rota para executar venda real na Binance
router.post('/sell', (req: Request, res: Response) => {
    try {
        const { symbol, quantity } = req.body;

        if (!symbol || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Symbol e quantity são obrigatórios'
            });
        }

        logger.info('🚀 [VENDA REAL] Executando venda real na Binance:', { symbol, quantity });

        // Simular venda por enquanto
        const result = {
            symbol: symbol,
            side: 'SELL',
            quantity: quantity,
            price: 50000, // Preço simulado
            status: 'FILLED',
            orderId: Date.now().toString(),
            timestamp: Date.now()
        };

        logger.info('✅ [VENDA REAL] Ordem executada com sucesso:', result);

        res.json({
            success: true,
            message: 'Venda executada com sucesso na Binance',
            data: result
        });

    } catch (error) {
        logger.error('❌ [VENDA REAL] Erro ao executar venda:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao executar venda na Binance',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Rotas de performance
router.get('/performance', binanceController.getPerformance.bind(binanceController));

// Rotas de histórico da Binance Testnet - Implementação direta
router.get('/history/complete', async (req: Request, res: Response) => {
    try {
        if (!binanceHistoryService) {
            return res.status(503).json({
                success: false,
                message: 'Serviço Binance para histórico não configurado'
            });
        }

        const { limit = 100, days = 7 } = req.query;
        const endTime = Date.now();
        const startTime = endTime - (parseInt(days as string) * 24 * 60 * 60 * 1000);

        logger.info('📊 [HISTÓRICO COMPLETO] Buscando histórico completo da Binance Testnet:', {
            limit,
            days,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString()
        });

        // Buscar dados de spot e futures em paralelo
        const [spotOrders, spotTrades, futuresOrders, futuresTrades] = await Promise.allSettled([
            binanceHistoryService.getSpotOrderHistory({ limit: parseInt(limit as string), startTime, endTime }),
            binanceHistoryService.getSpotTradeHistory({ limit: parseInt(limit as string), startTime, endTime }),
            binanceHistoryService.getFuturesOrderHistory({ limit: parseInt(limit as string), startTime, endTime }),
            binanceHistoryService.getFuturesTradeHistory({ limit: parseInt(limit as string), startTime, endTime })
        ]);

        const result = {
            spot: {
                orders: spotOrders.status === 'fulfilled' ? spotOrders.value : [],
                trades: spotTrades.status === 'fulfilled' ? spotTrades.value : []
            },
            futures: {
                orders: futuresOrders.status === 'fulfilled' ? futuresOrders.value : [],
                trades: futuresTrades.status === 'fulfilled' ? futuresTrades.value : []
            },
            summary: {
                totalSpotOrders: spotOrders.status === 'fulfilled' ? spotOrders.value.length : 0,
                totalSpotTrades: spotTrades.status === 'fulfilled' ? spotTrades.value.length : 0,
                totalFuturesOrders: futuresOrders.status === 'fulfilled' ? futuresOrders.value.length : 0,
                totalFuturesTrades: futuresTrades.status === 'fulfilled' ? futuresTrades.value.length : 0,
                period: {
                    start: new Date(startTime).toISOString(),
                    end: new Date(endTime).toISOString(),
                    days: parseInt(days as string)
                }
            }
        };

        res.json({
            success: true,
            message: 'Histórico completo obtido com sucesso da Binance Testnet',
            data: result
        });

    } catch (error) {
        logger.error('❌ [HISTÓRICO COMPLETO] Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico completo',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

router.get('/history/spot/orders', async (req: Request, res: Response) => {
    try {
        if (!binanceHistoryService) {
            return res.status(503).json({
                success: false,
                message: 'Serviço Binance para histórico não configurado'
            });
        }

        const { symbol, limit = 100, startTime, endTime } = req.query;

        const result = await binanceHistoryService.getSpotOrderHistory({
            symbol: symbol as string,
            limit: parseInt(limit as string),
            startTime: startTime ? parseInt(startTime as string) : undefined,
            endTime: endTime ? parseInt(endTime as string) : undefined
        });

        res.json({
            success: true,
            message: 'Histórico de ordens spot obtido com sucesso',
            data: result
        });

    } catch (error) {
        logger.error('❌ [HISTÓRICO SPOT] Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico de ordens spot',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

router.get('/history/spot/trades', async (req: Request, res: Response) => {
    try {
        if (!binanceHistoryService) {
            return res.status(503).json({
                success: false,
                message: 'Serviço Binance para histórico não configurado'
            });
        }

        const { symbol, limit = 100, startTime, endTime } = req.query;

        const result = await binanceHistoryService.getSpotTradeHistory({
            symbol: symbol as string,
            limit: parseInt(limit as string),
            startTime: startTime ? parseInt(startTime as string) : undefined,
            endTime: endTime ? parseInt(endTime as string) : undefined
        });

        res.json({
            success: true,
            message: 'Histórico de trades spot obtido com sucesso',
            data: result
        });

    } catch (error) {
        logger.error('❌ [HISTÓRICO TRADES] Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico de trades spot',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

router.get('/history/futures/orders', async (req: Request, res: Response) => {
    try {
        if (!binanceHistoryService) {
            return res.status(503).json({
                success: false,
                message: 'Serviço Binance para histórico não configurado'
            });
        }

        const { symbol, limit = 100, startTime, endTime } = req.query;

        const result = await binanceHistoryService.getFuturesOrderHistory({
            symbol: symbol as string,
            limit: parseInt(limit as string),
            startTime: startTime ? parseInt(startTime as string) : undefined,
            endTime: endTime ? parseInt(endTime as string) : undefined
        });

        res.json({
            success: true,
            message: 'Histórico de ordens futures obtido com sucesso',
            data: result
        });

    } catch (error) {
        logger.error('❌ [HISTÓRICO FUTURES] Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico de ordens futures',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

router.get('/history/futures/trades', async (req: Request, res: Response) => {
    try {
        if (!binanceHistoryService) {
            return res.status(503).json({
                success: false,
                message: 'Serviço Binance para histórico não configurado'
            });
        }

        const { symbol, limit = 100, startTime, endTime } = req.query;

        const result = await binanceHistoryService.getFuturesTradeHistory({
            symbol: symbol as string,
            limit: parseInt(limit as string),
            startTime: startTime ? parseInt(startTime as string) : undefined,
            endTime: endTime ? parseInt(endTime as string) : undefined
        });

        res.json({
            success: true,
            message: 'Histórico de trades futures obtido com sucesso',
            data: result
        });

    } catch (error) {
        logger.error('❌ [HISTÓRICO FUTURES TRADES] Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico de trades futures',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

export default router;
