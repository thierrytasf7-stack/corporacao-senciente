/**
 * REST Controller for the Competitive DNA Trading Engine
 */

import { Request, Response } from 'express';
import { BinanceApiService } from '../services/BinanceApiService';
import { CompetitiveDNAEngine } from '../services/CompetitiveDNAEngine';

export class CompetitiveDNAController {
    private engine: CompetitiveDNAEngine;

    constructor(binanceService: BinanceApiService) {
        this.engine = new CompetitiveDNAEngine(binanceService);
    }

    async start(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.engine.start();
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    stop(req: Request, res: Response): void {
        try {
            const result = this.engine.stop();
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getStatus(req: Request, res: Response): void {
        try {
            const status = this.engine.getStatus();
            res.json({ success: true, data: status });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getLeaderboard(req: Request, res: Response): void {
        try {
            const leaderboard = this.engine.getLeaderboard();
            res.json({ success: true, data: leaderboard });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getSessions(req: Request, res: Response): void {
        try {
            const sessions = this.engine.getDNASessions();
            res.json({ success: true, data: sessions });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getSession(req: Request, res: Response): void {
        try {
            const { sessionId } = req.params;
            const session = this.engine.getDNASession(sessionId);
            if (session) {
                res.json({ success: true, data: session });
            } else {
                res.status(404).json({ success: false, message: 'Session not found' });
            }
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
