import { Request, Response } from 'express';
import { RotativeAnalysisService } from '../services/RotativeAnalysisService';

export class RotativeAnalysisController {
    private rotativeAnalysisService: RotativeAnalysisService;

    constructor(binanceService?: any) {
        this.rotativeAnalysisService = new RotativeAnalysisService(binanceService);
    }

    // GET /api/v1/rotative-analysis/status
    async getStatus(req: Request, res: Response) {
        try {
            const status = await this.rotativeAnalysisService.getStatus();
            return res.json({
                success: true,
                data: status
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/rotative-analysis/start
    async startAnalysis(req: Request, res: Response) {
        try {
            const { cycleMode } = req.body;

            if (!cycleMode || !['CONTINUOUS', 'WAIT_RESULT'].includes(cycleMode)) {
                return res.status(400).json({
                    success: false,
                    message: 'cycleMode deve ser CONTINUOUS ou WAIT_RESULT'
                });
            }

            const result = await this.rotativeAnalysisService.startAnalysis(cycleMode);

            return res.json({
                success: true,
                message: 'Análise rotativa iniciada com sucesso',
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/rotative-analysis/stop
    async stopAnalysis(req: Request, res: Response) {
        try {
            await this.rotativeAnalysisService.stopAnalysis();

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
    }

    // GET /api/v1/rotative-analysis/signals
    async getSignals(req: Request, res: Response) {
        try {
            const signals = await this.rotativeAnalysisService.getRecentSignals();

            return res.json({
                success: true,
                signals
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/rotative-analysis/all-signals
    async getAllSignals(req: Request, res: Response) {
        try {
            console.log('🔍 [DEBUG] getAllSignals chamado');
            const signals = await this.rotativeAnalysisService.getAllSignals();
            console.log('🔍 [DEBUG] Sinais obtidos:', signals.length);

            return res.json({
                success: true,
                signals
            });
        } catch (error: any) {
            console.error('❌ [DEBUG] Erro em getAllSignals:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/rotative-analysis/clear-history
    async clearHistory(req: Request, res: Response) {
        try {
            await this.rotativeAnalysisService.clearSignalsHistory();

            return res.json({
                success: true,
                message: 'Histórico de sinais e análise limpo com sucesso'
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/rotative-analysis/logs
    async getLogs(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const logs = await this.rotativeAnalysisService.getAnalysisLogs(limit);

            return res.json({
                success: true,
                logs
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/rotative-analysis/stats
    async getStats(req: Request, res: Response) {
        try {
            const stats = await this.rotativeAnalysisService.getAnalysisStats();

            return res.json({
                success: true,
                stats
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}
