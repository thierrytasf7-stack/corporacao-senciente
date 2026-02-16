/**
 * DNA Arena V2 Controller - REST API for Signal Pool Consensus Engine
 */

import { Request, Response } from 'express';
import { BinanceApiService } from '../services/BinanceApiService';
import { DNAArenaV2Engine } from '../services/DNAArenaV2Engine';
import { SignalPoolEngine } from '../services/SignalPoolEngine';

export class DNAArenaV2Controller {
    private engine: DNAArenaV2Engine;
    private signalPool: SignalPoolEngine;

    constructor(binanceService: BinanceApiService) {
        this.engine = new DNAArenaV2Engine(binanceService);
        this.signalPool = new SignalPoolEngine(binanceService);
    }

    async start(_req: Request, res: Response): Promise<void> {
        const result = await this.engine.start();
        res.json({ success: result.success, message: result.message });
    }

    stop(_req: Request, res: Response): void {
        const result = this.engine.stop();
        res.json({ success: result.success, message: result.message });
    }

    async reset(_req: Request, res: Response): Promise<void> {
        const result = await this.engine.reset();
        res.json({ success: result.success, message: result.message });
    }

    getStatus(_req: Request, res: Response): void {
        res.json({ success: true, data: this.engine.getStatus() });
    }

    getLeaderboard(_req: Request, res: Response): void {
        res.json({ success: true, data: this.engine.getLeaderboard() });
    }

    getSessions(_req: Request, res: Response): void {
        res.json({ success: true, data: this.engine.getSessions() });
    }

    getSession(req: Request, res: Response): void {
        const session = this.engine.getSession(req.params.sessionId);
        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }
        res.json({ success: true, data: session });
    }

    /**
     * Get current signals from the pool (for debugging/monitoring)
     */
    async getPoolSignals(req: Request, res: Response): Promise<void> {
        try {
            const symbol = req.params.symbol;
            if (symbol) {
                const signals = await this.signalPool.generateSignals(symbol);
                res.json({ success: true, data: signals });
            } else {
                const allSignals = await this.signalPool.generateAllSignals();
                res.json({ success: true, data: allSignals });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to generate signals' });
        }
    }

    /**
     * Get strategy definitions
     */
    getStrategies(_req: Request, res: Response): void {
        res.json({
            success: true,
            data: {
                count: SignalPoolEngine.getStrategyCount(),
                strategies: SignalPoolEngine.getStrategyInfo()
            }
        });
    }

    /**
     * Get aggregate stats & analytics
     */
    getStats(_req: Request, res: Response): void {
        res.json({ success: true, data: this.engine.getStats() });
    }

    /**
     * Get Hall of Fame (best genomes ever)
     */
    getHallOfFame(_req: Request, res: Response): void {
        res.json({ success: true, data: this.engine.getHallOfFame() });
    }
}
