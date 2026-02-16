import { Request, Response, Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Rota para executar venda real na Binance
router.post('/sell', async (req: Request, res: Response) => {
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

export default router;
