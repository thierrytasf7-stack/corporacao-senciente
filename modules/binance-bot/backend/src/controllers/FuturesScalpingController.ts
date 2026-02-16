import { Request, Response } from 'express';
import { FuturesScalpingService } from '../services/FuturesScalpingService';
import { BinanceApiService } from '../services/BinanceApiService';

let futuresService: FuturesScalpingService | null = null;

export class FuturesScalpingController {
    private binanceService: BinanceApiService;

    constructor(binanceService: BinanceApiService) {
        this.binanceService = binanceService;
    }

    private getService(): FuturesScalpingService {
        if (!futuresService) {
            futuresService = new FuturesScalpingService(this.binanceService);
        }
        return futuresService;
    }

    async start(req: Request, res: Response): Promise<void> {
        try {
            const service = this.getService();

            // Apply config from request body if provided
            if (req.body && Object.keys(req.body).length > 0) {
                service.updateConfig(req.body);
            }

            const result = await service.start();
            res.json({
                success: result.success,
                message: result.message,
                config: service.getConfig(),
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    stop(req: Request, res: Response): void {
        try {
            const service = this.getService();
            const result = service.stop();
            res.json({
                success: result.success,
                message: result.message,
                status: service.getStatus(),
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    getStatus(req: Request, res: Response): void {
        try {
            const service = this.getService();
            res.json({
                success: true,
                data: service.getStatus(),
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    updateConfig(req: Request, res: Response): void {
        try {
            const service = this.getService();
            service.updateConfig(req.body);
            res.json({
                success: true,
                message: 'Config atualizada',
                config: service.getConfig(),
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async getFuturesAccount(req: Request, res: Response): Promise<void> {
        try {
            const account = await this.binanceService.getFuturesAccountInfo();
            res.json({
                success: true,
                data: account,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async getFuturesPositions(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.query;
            const positions = await this.binanceService.getFuturesPositions(symbol as string);
            res.json({
                success: true,
                data: positions,
                count: positions.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async getFuturesBalance(req: Request, res: Response): Promise<void> {
        try {
            const balances = await this.binanceService.getFuturesBalance();
            const nonZero = balances.filter((b: any) => parseFloat(b.balance) > 0 || parseFloat(b.crossUnPnl) !== 0);
            res.json({
                success: true,
                data: nonZero,
                count: nonZero.length,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async setLeverage(req: Request, res: Response): Promise<void> {
        try {
            const { symbol, leverage } = req.body;
            if (!symbol || !leverage) {
                res.status(400).json({ success: false, message: 'symbol e leverage obrigatórios' });
                return;
            }
            const result = await this.binanceService.setFuturesLeverage(symbol, leverage);
            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}
