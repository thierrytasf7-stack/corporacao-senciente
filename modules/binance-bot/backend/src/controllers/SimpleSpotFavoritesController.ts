import { Request, Response } from 'express';
import { SimpleSpotFavoritesService } from '../services/SimpleSpotFavoritesService';

export class SimpleSpotFavoritesController {
    private favoritesService: SimpleSpotFavoritesService;

    constructor() {
        this.favoritesService = new SimpleSpotFavoritesService();
    }

    // POST /api/v1/spot-favorites/:id/toggle
    async toggleFavorite(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da estratégia é obrigatório',
                    timestamp: new Date().toISOString()
                });
            }

            const isFavorite = this.favoritesService.toggleFavorite(id);

            return res.json({
                success: true,
                message: `Estratégia ${isFavorite ? 'adicionada aos' : 'removida dos'} favoritos`,
                strategyId: id,
                isFavorite: isFavorite,
                favoritesCount: this.favoritesService.getFavoritesCount(),
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [FAVORITES] Erro ao alternar favorito:', error);
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
            const favorites = this.favoritesService.getFavorites();

            return res.json({
                success: true,
                favorites: favorites,
                count: favorites.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [FAVORITES] Erro ao obter favoritos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/v1/spot-favorites/:id/status
    async getFavoriteStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da estratégia é obrigatório',
                    timestamp: new Date().toISOString()
                });
            }

            const isFavorite = this.favoritesService.isFavorite(id);

            return res.json({
                success: true,
                strategyId: id,
                isFavorite: isFavorite,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('❌ [FAVORITES] Erro ao verificar status do favorito:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}
