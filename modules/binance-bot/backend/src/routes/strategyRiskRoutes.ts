import express from 'express';
import { StrategyRiskProfileService } from '../services/StrategyRiskProfileService';
import { StrategyStorageService } from '../services/StrategyStorageService';

const router = express.Router();
const storageService = new StrategyStorageService();
const riskProfileService = new StrategyRiskProfileService(storageService);

// GET /api/v1/strategy-risk/configs - Obter todas as configurações de risco
router.get('/configs', async (req, res) => {
    try {
        const configs = await riskProfileService.getAllStrategyRiskConfigs();
        res.json({
            success: true,
            configs,
            count: configs.length
        });
    } catch (error) {
        console.error('Erro ao obter configurações de risco:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/v1/strategy-risk/config/:strategyId - Obter configuração de uma estratégia específica
router.get('/config/:strategyId', async (req, res) => {
    try {
        const { strategyId } = req.params;
        const config = await riskProfileService.getStrategyRiskConfig(strategyId);
        
        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Configuração de risco não encontrada'
            });
        }

        return res.json({
            success: true,
            config
        });
    } catch (error) {
        console.error('Erro ao obter configuração de risco:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// PUT /api/v1/strategy-risk/config/:strategyId/profile - Atualizar perfil de risco de uma estratégia
router.put('/config/:strategyId/profile', async (req, res) => {
    try {
        const { strategyId } = req.params;
        const { profile } = req.body;

        if (!profile || !['AGGRESSIVE', 'CONSERVATIVE', 'MODERATE'].includes(profile)) {
            return res.status(400).json({
                success: false,
                error: 'Perfil deve ser AGGRESSIVE, CONSERVATIVE ou MODERATE'
            });
        }

        const updatedConfig = await riskProfileService.updateStrategyRiskProfile(strategyId, profile);
        
        if (!updatedConfig) {
            return res.status(404).json({
                success: false,
                error: 'Estratégia não encontrada'
            });
        }

        return res.json({
            success: true,
            config: updatedConfig,
            message: `Perfil de risco atualizado para ${profile}`
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil de risco:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/v1/strategy-risk/profiles/:strategyId - Obter perfis disponíveis para uma estratégia
router.get('/profiles/:strategyId', async (req, res) => {
    try {
        const { strategyId } = req.params;
        const profiles = await riskProfileService.getRiskProfilesForStrategy(strategyId);
        
        if (!profiles) {
            return res.status(404).json({
                success: false,
                error: 'Estratégia não encontrada'
            });
        }

        return res.json({
            success: true,
            profiles
        });
    } catch (error) {
        console.error('Erro ao obter perfis de risco:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/v1/strategy-risk/current/:strategyId - Obter perfil atual de uma estratégia
router.get('/current/:strategyId', async (req, res) => {
    try {
        const { strategyId } = req.params;
        const profile = await riskProfileService.getCurrentRiskProfile(strategyId);
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Estratégia não encontrada'
            });
        }

        return res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Erro ao obter perfil atual:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// GET /api/v1/strategy-risk/timeframe/:timeframe - Obter configurações por timeframe
router.get('/timeframe/:timeframe', async (req, res) => {
    try {
        const { timeframe } = req.params;
        const configs = await riskProfileService.getRiskConfigsByTimeframe(timeframe);
        
        return res.json({
            success: true,
            configs,
            timeframe,
            count: configs.length
        });
    } catch (error) {
        console.error('Erro ao obter configurações por timeframe:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

export default router;
