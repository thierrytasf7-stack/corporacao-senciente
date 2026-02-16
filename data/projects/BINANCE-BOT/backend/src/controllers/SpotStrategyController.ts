import { Request, Response } from 'express';
import { SpotStrategyService } from '../services/SpotStrategyService';

export class SpotStrategyController {
    private spotStrategyService: SpotStrategyService;

    constructor() {
        this.spotStrategyService = SpotStrategyService.getInstance();
    }

    // GET /api/v1/spot-strategies
    async getAllStrategies(req: Request, res: Response) {
        try {
            const strategies = this.spotStrategyService.getAllStrategies();
            return res.json({
                success: true,
                strategies,
                count: strategies.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao obter estratégias:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/v1/spot-strategies/active
    async getActiveStrategies(req: Request, res: Response) {
        try {
            const strategies = this.spotStrategyService.getAllStrategies().filter(s => s.isActive);
            return res.json({
                success: true,
                strategies,
                count: strategies.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao obter estratégias ativas:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/v1/spot-strategies/:id
    async getStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const strategy = this.spotStrategyService.getStrategyById(id);

            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'Estratégia não encontrada',
                    timestamp: new Date().toISOString()
                });
            }

            return res.json({
                success: true,
                strategy,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao obter estratégia:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // POST /api/v1/spot-strategies
    async createStrategy(req: Request, res: Response) {
        try {
            const {
                name,
                description,
                type,
                riskLevel
            } = req.body;

            // Validações obrigatórias
            if (!name || !description || !type || !riskLevel) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obrigatórios: name, description, type, riskLevel',
                    timestamp: new Date().toISOString()
                });
            }

            // Criar estratégia não implementado ainda
            return res.status(501).json({
                success: false,
                message: 'Criação de estratégias não implementada ainda',
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao criar estratégia:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // PUT /api/v1/spot-strategies/:id
    async updateStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const strategy = await this.spotStrategyService.updateStrategy(updates);

            if (!strategy) {
                return res.status(404).json({
                    success: false,
                    message: 'Estratégia não encontrada',
                    timestamp: new Date().toISOString()
                });
            }

            return res.json({
                success: true,
                message: 'Estratégia spot atualizada com sucesso',
                strategy,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao atualizar estratégia:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // POST /api/v1/spot-strategies/:id/toggle
    async toggleStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const success = await this.spotStrategyService.toggleFavorite(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Estratégia não encontrada',
                    timestamp: new Date().toISOString()
                });
            }

            return res.json({
                success: true,
                message: `Estratégia favoritada/desfavoritada com sucesso`,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao alternar estratégia:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // DELETE /api/v1/spot-strategies/:id
    async deleteStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // Deletar estratégia não implementado ainda
            return res.status(501).json({
                success: false,
                message: 'Deleção de estratégias não implementada ainda',
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao remover estratégia:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/v1/spot-strategies/type/:type
    async getStrategiesByType(req: Request, res: Response) {
        try {
            const { type } = req.params;

            if (!['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo inválido. Use: CONSERVATIVE, MODERATE ou AGGRESSIVE',
                    timestamp: new Date().toISOString()
                });
            }

            const strategies = this.spotStrategyService.getAllStrategies().filter(s => s.type === type);

            return res.json({
                success: true,
                strategies,
                count: strategies.length,
                type,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao obter estratégias por tipo:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/v1/spot-favorites
    async getFavorites(req: Request, res: Response) {
        try {
            const strategies = this.spotStrategyService.getAllStrategies();
            const favorites = strategies.filter(s => s.isFavorite).map(s => s.id);

            return res.json({
                success: true,
                favorites,
                count: favorites.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT FAVORITES] Erro ao obter favoritos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // POST /api/v1/spot-strategies/:id/toggle-favorite
    async toggleFavorite(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Garantir que as estratégias estejam carregadas
            this.spotStrategyService.ensureStrategiesLoaded();

            // Usar a instância do serviço do controller para manter estado
            const success = await this.spotStrategyService.toggleFavorite(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Estratégia não encontrada',
                    timestamp: new Date().toISOString()
                });
            }

            // Buscar a estratégia atualizada para retornar
            const updatedStrategy = this.spotStrategyService.getStrategyById(id);

            return res.json({
                success: true,
                message: `Estratégia favoritada/desfavoritada com sucesso`,
                strategy: updatedStrategy,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao alternar favorito:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/v1/spot-strategies/favorites
    async getFavoriteStrategies(req: Request, res: Response) {
        try {
            const strategies = this.spotStrategyService.getFavoriteStrategies();
            return res.json({
                success: true,
                strategies,
                count: strategies.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [SPOT STRATEGIES] Erro ao obter estratégias favoritas:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

