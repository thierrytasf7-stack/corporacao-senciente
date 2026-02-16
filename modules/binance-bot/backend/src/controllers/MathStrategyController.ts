import { Request, Response } from 'express';
import { MathStrategyService } from '../services/MathStrategyService';

export class MathStrategyController {
    private mathStrategyService: MathStrategyService;

    constructor() {
        this.mathStrategyService = new MathStrategyService();
    }

    // GET /api/v1/math-strategies
    async getAllStrategies(req: Request, res: Response) {
        try {
            const strategies = await this.mathStrategyService.getAllStrategies();
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

    // POST /api/v1/math-strategies
    async createStrategy(req: Request, res: Response) {
        try {
            const { name, description, betAmount, type } = req.body;

            if (!name || !description || !betAmount || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos são obrigatórios'
                });
            }

            const strategy = await this.mathStrategyService.createStrategy({
                name,
                description,
                betAmount: parseFloat(betAmount),
                type
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

    // POST /api/v1/math-strategies/:id/toggle
    async toggleStrategy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const strategy = await this.mathStrategyService.toggleStrategy(id);

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

    // GET /api/v1/math-strategies/active
    async getActiveStrategy(req: Request, res: Response) {
        try {
            const strategy = await this.mathStrategyService.getActiveStrategy();

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

    // POST /api/v1/math-strategies/initialize-default
    async initializeDefaultStrategy(req: Request, res: Response) {
        try {
            const strategy = await this.mathStrategyService.initializeDefaultStrategy();

            return res.json({
                success: true,
                strategy,
                message: 'Estratégia matemática padrão inicializada com sucesso'
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}
