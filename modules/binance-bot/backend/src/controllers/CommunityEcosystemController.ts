/**
 * CommunityEcosystemController - REST API handler for the 25-bot ecosystem
 */

import { Request, Response } from 'express';
import { BinanceApiService } from '../services/BinanceApiService';
import { CommunityEcosystem } from '../services/ecosystem/CommunityEcosystem';

export class CommunityEcosystemController {
    private ecosystem: CommunityEcosystem;

    constructor(binanceService: BinanceApiService) {
        this.ecosystem = new CommunityEcosystem(binanceService);
    }

    async start(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.ecosystem.start();
            res.json(result);
        } catch (err) {
            res.status(500).json({ success: false, message: `Failed to start ecosystem: ${err}` });
        }
    }

    stop(_req: Request, res: Response): void {
        res.json(this.ecosystem.stop());
    }

    async reset(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.ecosystem.reset();
            res.json(result);
        } catch (err) {
            res.status(500).json({ success: false, message: `Failed to reset ecosystem: ${err}` });
        }
    }

    getStatus(_req: Request, res: Response): void {
        res.json({ success: true, data: this.ecosystem.getStatus() });
    }

    getLeaderboard(_req: Request, res: Response): void {
        res.json({ success: true, data: this.ecosystem.getLeaderboard() });
    }

    getMilestones(_req: Request, res: Response): void {
        res.json({ success: true, data: this.ecosystem.getMilestones() });
    }

    getGroupStatus(req: Request, res: Response): void {
        const data = this.ecosystem.getGroupStatus(req.params.groupId);
        if (!data) {
            res.status(404).json({ success: false, message: `Group ${req.params.groupId} not found` });
            return;
        }
        res.json({ success: true, data });
    }

    getBotStatus(req: Request, res: Response): void {
        const data = this.ecosystem.getBotStatus(req.params.groupId, req.params.botId);
        if (!data) {
            res.status(404).json({ success: false, message: 'Bot not found' });
            return;
        }
        res.json({ success: true, data });
    }

    getDNAMemory(_req: Request, res: Response): void {
        res.json({ success: true, data: this.ecosystem.getDNAMemory() });
    }

    async consultOracle(_req: Request, res: Response): Promise<void> {
        try {
            const decision = await this.ecosystem.consultOracle();
            res.json({ success: true, data: decision });
        } catch (err) {
            res.status(500).json({ success: false, message: `Oracle consultation failed: ${err}` });
        }
    }

    getEvolutionStatus(_req: Request, res: Response): void {
        res.json({ success: true, data: this.ecosystem.getEvolutionStatus() });
    }

    getEvolutionDimension(req: Request, res: Response): void {
        const data = this.ecosystem.getEvolutionDimension(req.params.dimension);
        if (!data.summary) {
            res.status(404).json({ success: false, message: `Dimension ${req.params.dimension} not found` });
            return;
        }
        res.json({ success: true, data });
    }

    getSeedsStatus(_req: Request, res: Response): void {
        res.json({ success: true, data: this.ecosystem.getSeedsStatus() });
    }
}
