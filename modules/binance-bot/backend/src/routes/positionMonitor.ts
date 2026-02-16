import express from 'express';
import { RotativeAnalysisService } from '../services/RotativeAnalysisService';

const router = express.Router();

// Middleware para injetar binanceService
let injectedBinanceService: any = null;

export function injectBinanceService(binanceService: any) {
    injectedBinanceService = binanceService;
}

// Função para obter o analysisService com binanceService injetado
function getAnalysisService() {
    return new RotativeAnalysisService(injectedBinanceService);
}

/**
 * GET /api/v1/position-monitor/status
 * Obtém status do monitoramento de posições
 */
router.get('/status', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const status = await analysisService.getPositionMonitorStatus();
        return res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Erro ao obter status do monitoramento:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/v1/position-monitor/open-positions
 * Obtém lista de posições abertas sendo monitoradas
 */
router.get('/open-positions', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const openPositions = await analysisService.getOpenPositions();
        return res.json({
            success: true,
            data: openPositions
        });
    } catch (error) {
        console.error('Erro ao obter posições abertas:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/v1/position-monitor/start
 * Inicia o monitoramento de posições
 */
router.post('/start', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        await analysisService.startPositionMonitoring();
        return res.json({
            success: true,
            message: 'Monitoramento de posições iniciado'
        });
    } catch (error) {
        console.error('Erro ao iniciar monitoramento:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/v1/position-monitor/stop
 * Para o monitoramento de posições
 */
router.post('/stop', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        await analysisService.stopPositionMonitoring();
        return res.json({
            success: true,
            message: 'Monitoramento de posições parado'
        });
    } catch (error) {
        console.error('Erro ao parar monitoramento:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/v1/position-monitor/close-position/:positionId
 * Fecha uma posição manualmente
 */
router.post('/close-position/:positionId', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const { positionId } = req.params;
        const { closePrice } = req.body;

        if (!closePrice) {
            return res.status(400).json({
                success: false,
                error: 'Preço de fechamento é obrigatório'
            });
        }

        const success = await analysisService.closePosition(positionId, closePrice);

        if (success) {
            return res.json({
                success: true,
                message: 'Posição fechada com sucesso'
            });
        } else {
            return res.status(400).json({
                success: false,
                error: 'Falha ao fechar posição'
            });
        }
    } catch (error) {
        console.error('Erro ao fechar posição:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

export default router;
