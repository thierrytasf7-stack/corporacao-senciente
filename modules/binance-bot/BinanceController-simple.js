const logger = require('../utils/logger');

class BinanceController {
    constructor() {
        try {
            const { BinanceApiService } = require('../services/BinanceApiService');
            this.binanceService = new BinanceApiService();
            logger.info('🚀 BinanceController inicializado com sucesso');
        } catch (error) {
            logger.warn('Erro ao inicializar serviço Binance:', error?.message || error);
            this.binanceService = null;
        }
    }

    /**
     * Testa conexão com a API da Binance
     */
    async testConnection(req, res) {
        try {
            logger.info('Testando conexão com API da Binance...');

            if (!this.binanceService) {
                return res.status(500).json({
                    success: false,
                    message: 'Serviço Binance não inicializado'
                });
            }

            const result = await this.binanceService.testConnection();

            if (result.success) {
                logger.info('✅ Conexão com Binance API estabelecida');
                res.json({
                    success: true,
                    message: 'Conexão com Binance API estabelecida',
                    data: result.data
                });
            } else {
                logger.error('Falha na conexão com Binance API:', result.error);
                res.status(500).json({
                    success: false,
                    message: 'Falha na conexão com Binance API',
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Erro ao testar conexão com Binance:', error?.message || error);
            res.status(500).json({
                success: false,
                message: 'Erro interno ao testar conexão',
                error: error?.message || 'Erro desconhecido'
            });
        }
    }

    /**
     * Coloca ordem REAL na Binance
     */
    async placeOrder(req, res) {
        try {
            const { symbol, side, type, quantity, price, timeInForce } = req.body;

            logger.info('🚀 [ORDEM REAL] Colocando ordem na Binance:', {
                symbol,
                side,
                type,
                quantity,
                price,
                timeInForce
            });

            // Validar parâmetros obrigatórios
            if (!symbol || !side || !type || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Parâmetros obrigatórios: symbol, side, type, quantity'
                });
            }

            if (!this.binanceService) {
                return res.status(500).json({
                    success: false,
                    message: 'Serviço Binance não inicializado'
                });
            }

            // Preparar dados da ordem
            const orderData = {
                symbol,
                side: side.toUpperCase(),
                type: type.toUpperCase(),
                quantity: quantity.toString()
            };

            if (price) orderData.price = price.toString();
            if (timeInForce) orderData.timeInForce = timeInForce;

            // Executar ordem REAL na Binance
            const result = await this.binanceService.placeOrder(orderData);

            logger.info('✅ [ORDEM SUCESSO] Ordem executada com sucesso:', result);

            res.json({
                success: true,
                message: 'Ordem executada com sucesso na Binance',
                data: result
            });

        } catch (error) {
            logger.error('❌ [ORDEM ERRO] Erro ao executar ordem:', error?.message || error);
            res.status(500).json({
                success: false,
                message: 'Erro ao executar ordem na Binance',
                error: error?.message || 'Erro desconhecido'
            });
        }
    }

    /**
     * Obtém preço atual de um símbolo
     */
    async getCurrentPrice(req, res) {
        try {
            const { symbol } = req.params;

            if (!symbol) {
                return res.status(400).json({
                    success: false,
                    message: 'Símbolo é obrigatório'
                });
            }

            if (!this.binanceService) {
                return res.status(500).json({
                    success: false,
                    message: 'Serviço Binance não inicializado'
                });
            }

            logger.info(`Obtendo preço atual de ${symbol}`);

            const price = await this.binanceService.getCurrentPrice(symbol);

            if (price && price > 0) {
                res.json({
                    success: true,
                    symbol,
                    price: price.toString(),
                    timestamp: Date.now()
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Não foi possível obter o preço do símbolo'
                });
            }
        } catch (error) {
            logger.error('Erro ao obter preço atual:', error?.message || error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter preço atual',
                error: error?.message || 'Erro desconhecido'
            });
        }
    }
}

module.exports = { BinanceController };

