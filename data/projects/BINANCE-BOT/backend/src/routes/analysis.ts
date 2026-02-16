import express from 'express';
import { RotativeAnalysisService } from '../services/RotativeAnalysisService';
import { logger } from '../utils/logger';

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

// GET /api/analysis/status - Obter status da análise
router.get('/status', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const status = await analysisService.getStatus();
        res.json({
            success: true,
            data: status,
            message: 'Status da análise obtido com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/analysis/start - Iniciar análise rotativa
router.post('/start', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const { cycleMode } = req.body;
        await analysisService.startAnalysis(cycleMode || 'CONTINUOUS');
        return res.json({
            success: true,
            message: 'Análise rotativa iniciada com sucesso'
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/analysis/stop - Parar análise rotativa
router.post('/stop', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        await analysisService.stopAnalysis();
        return res.json({
            success: true,
            message: 'Análise rotativa parada com sucesso'
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/analysis/position-history - Adicionar posição ao histórico
router.post('/position-history', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const positionData = req.body;

        logger.info('📊 [API] Recebendo posição para histórico:', positionData);

        // Adicionar timestamp se não existir
        if (!positionData.timestamp) {
            positionData.timestamp = new Date().toISOString();
        }

        // Adicionar posição ao histórico usando o método público
        // addTestPosition foi removido - apenas posições reais são permitidas
        // await analysisService.addTestPosition(positionData);

        logger.info('✅ [API] Posição adicionada ao histórico com sucesso');

        return res.json({
            success: true,
            message: 'Posição adicionada ao histórico',
            position: positionData
        });
    } catch (error: any) {
        logger.error('❌ [API] Erro ao adicionar posição ao histórico:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// GET /api/analysis/position-history - Obter histórico de posições
router.get('/position-history', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const { page = 1, limit = 20 } = req.query;
        const pageNumber = parseInt(page as string) || 1;
        const pageLimit = parseInt(limit as string) || 20;

        // Buscar posições do storage
        const allPositions = await analysisService.getPositionHistory();
        const totalPositions = allPositions.length;
        const totalPages = Math.ceil(totalPositions / pageLimit);
        const startIndex = (pageNumber - 1) * pageLimit;
        const endIndex = startIndex + pageLimit;
        const positions = allPositions.slice(startIndex, endIndex);

        return res.json({
            success: true,
            positions,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalPositions,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/analysis/close-position - Fechar posição
router.post('/close-position', async (req, res) => {
    try {
        const analysisService = getAnalysisService();
        const { signalId, closePrice } = req.body;

        if (!signalId || !closePrice) {
            return res.status(400).json({
                success: false,
                message: 'signalId e closePrice são obrigatórios'
            });
        }

        const success = await analysisService.closePosition(signalId, closePrice);

        if (success) {
            return res.json({
                success: true,
                message: 'Posição fechada com sucesso'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Falha ao fechar posição'
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
