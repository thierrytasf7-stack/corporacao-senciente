import { Request, Response } from 'express';
import { TradingStrategyService } from '../services/TradingStrategyService';

export class TradingStrategyController {
    private tradingStrategyService: TradingStrategyService;

    constructor() {
        this.tradingStrategyService = new TradingStrategyService();
    }

    // GET /api/v1/trading-strategies
    async getAllStrategies(req: Request, res: Response) {
        try {
            const strategies = await this.tradingStrategyService.getAllStrategies();
            return res.json({
                success: true,
                strategies
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/trading-strategies
    async createStrategy(req: Request, res: Response) {
        try {
            const {
                name,
                description,
                timeframe,
                indicators,
                rules
            } = req.body;

            if (!name || !description || !timeframe) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obrigatórios: name, description, timeframe'
                });
            }

            const strategy = await this.tradingStrategyService.createStrategy({
                name,
                description,
                timeframe,
                isActive: false,
                isFavorite: false,
                maxCandles: 100,
                indicators: indicators || {},
                rules: rules || {
                    buyConditions: [],
                    sellConditions: []
                }
            });

            return res.status(201).json({
                success: true,
                strategy
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/trading-strategies/:id/toggle
    async toggleStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const strategy = await this.tradingStrategyService.toggleStrategy(id);

            return res.json({
                success: true,
                strategy
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/trading-strategies/:id/toggle-favorite
    async toggleFavorite(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const strategy = await this.tradingStrategyService.toggleFavorite(id);

            return res.json({
                success: true,
                strategy
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/v1/trading-strategies/:id
    async deleteStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.tradingStrategyService.deleteStrategy(id);

            return res.json({
                success: true,
                message: 'Estratégia excluída com sucesso'
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/trading-strategies/active
    async getActiveStrategies(req: Request, res: Response) {
        try {
            const strategies = await this.tradingStrategyService.getActiveStrategies();

            return res.json({
                success: true,
                strategies
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/trading-strategies/timeframes
    async getTimeframes(req: Request, res: Response) {
        try {
            const timeframes = await this.tradingStrategyService.getActiveTimeframes();
            return res.json({ success: true, timeframes });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /api/v1/trading-strategies/by-timeframe/:timeframe
    async getStrategiesByTimeframe(req: Request, res: Response) {
        try {
            const { timeframe } = req.params;
            const strategies = await this.tradingStrategyService.getStrategiesByTimeframe(timeframe as any);
            return res.json({ success: true, strategies });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
