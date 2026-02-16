import express from 'express';
import MarketService from '../services/MarketService';

const router = express.Router();
const marketService = new MarketService();

// GET /api/markets - Listar todos os mercados
router.get('/', async (req, res) => {
    try {
        const markets = await marketService.getMarketsWithTradingInfo();
        res.json({
            success: true,
            data: markets,
            message: 'Mercados obtidos com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/markets/active - Listar mercados ativos
router.get('/active', (req, res) => {
    try {
        const markets = marketService.getActiveMarkets();
        res.json({
            success: true,
            data: markets,
            message: 'Mercados ativos obtidos com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/markets/:id - Obter mercado específico
router.get('/:id', (req, res) => {
    try {
        const market = marketService.getMarket(req.params.id);
        if (!market) {
            return res.status(404).json({
                success: false,
                message: 'Mercado não encontrado'
            });
        }
        return res.json({
            success: true,
            data: market,
            message: 'Mercado obtido com sucesso'
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/markets - Adicionar novo mercado
router.post('/', (req, res) => {
    try {
        const result = marketService.addMarket(req.body);
        if (result.success) {
            return res.status(201).json({
                success: true,
                data: result.market,
                message: result.message
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// PUT /api/markets/:id - Atualizar mercado
router.put('/:id', (req, res) => {
    try {
        const result = marketService.updateMarket(req.params.id, req.body);
        if (result.success) {
            return res.json({
                success: true,
                data: result.market,
                message: result.message
            });
        } else {
            return res.status(404).json({
                success: false,
                message: result.message
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/markets/:id - Remover mercado
router.delete('/:id', (req, res) => {
    try {
        const result = marketService.removeMarket(req.params.id);
        if (result.success) {
            return res.json({
                success: true,
                message: result.message
            });
        } else {
            return res.status(404).json({
                success: false,
                message: result.message
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/markets/:id/toggle - Ativar/desativar mercado
router.post('/:id/toggle', (req, res) => {
    try {
        const result = marketService.toggleMarket(req.params.id);
        if (result.success) {
            return res.json({
                success: true,
                message: result.message
            });
        } else {
            return res.status(404).json({
                success: false,
                message: result.message
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
