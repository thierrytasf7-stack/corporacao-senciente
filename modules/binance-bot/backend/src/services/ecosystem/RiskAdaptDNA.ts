/**
 * Seed 6: RiskAdaptDNA - Dynamic risk adaptation
 * Adjusts risk parameters based on drawdown, streaks, and volatility.
 * Each group evolves its own risk curves.
 */

export interface RiskAdaptGenome {
    // Drawdown-based scaling: [threshold%, riskMultiplier] pairs
    drawdownLevels: { threshold: number; multiplier: number }[];
    // Win streak boost (1.0-1.5)
    winStreakBoost: number;
    // Loss streak reduce (0.3-0.8)
    lossStreakReduce: number;
    // Streak length to trigger adjustment (2-8)
    streakTrigger: number;
    // Volatility scaling: high vol = reduce risk (0.5-1.5)
    highVolReduction: number;
    // Low vol boost (1.0-1.3)
    lowVolBoost: number;
    // Milestone proximity protection: reduce risk near milestones (0.5-1.0)
    milestoneProtection: number;
    // Recovery mode: after big drawdown, extra conservative (0.3-0.8)
    recoveryModeMultiplier: number;
    // Recovery threshold: drawdown % that triggers recovery mode (15-40)
    recoveryThreshold: number;
}

export class RiskAdaptDNA {
    private genome: RiskAdaptGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private survivals: number = 0;
    private bankruptcies: number = 0;
    private riskAdjustedReturns: number[] = [];

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
    }

    private createGenesis(personality?: string): RiskAdaptGenome {
        const base: RiskAdaptGenome = {
            drawdownLevels: [
                { threshold: 10, multiplier: 0.8 },
                { threshold: 25, multiplier: 0.5 },
                { threshold: 50, multiplier: 0.2 }
            ],
            winStreakBoost: 1.15,
            lossStreakReduce: 0.6,
            streakTrigger: 3,
            highVolReduction: 0.7,
            lowVolBoost: 1.1,
            milestoneProtection: 0.7,
            recoveryModeMultiplier: 0.5,
            recoveryThreshold: 25
        };

        if (personality === 'ALPHA') {
            base.drawdownLevels[0].multiplier = 0.9; // More aggressive even in drawdown
            base.winStreakBoost = 1.3;
        }
        if (personality === 'BETA') {
            base.drawdownLevels[0].multiplier = 0.6; // Quick to reduce risk
            base.lossStreakReduce = 0.4;
            base.recoveryThreshold = 15;
        }

        return base;
    }

    /**
     * Get risk multiplier based on current conditions
     */
    getRiskMultiplier(conditions: {
        currentDrawdown: number;
        consecutiveWins: number;
        consecutiveLosses: number;
        bankroll: number;
        initialBankroll: number;
        isHighVolatility: boolean;
    }): number {
        let multiplier = 1.0;

        // Drawdown scaling
        for (const level of this.genome.drawdownLevels) {
            if (conditions.currentDrawdown >= level.threshold) {
                multiplier = Math.min(multiplier, level.multiplier);
            }
        }

        // Win streak boost
        if (conditions.consecutiveWins >= this.genome.streakTrigger) {
            multiplier *= this.genome.winStreakBoost;
        }

        // Loss streak reduce
        if (conditions.consecutiveLosses >= this.genome.streakTrigger) {
            multiplier *= this.genome.lossStreakReduce;
        }

        // Volatility adjustment
        if (conditions.isHighVolatility) {
            multiplier *= this.genome.highVolReduction;
        } else {
            multiplier *= this.genome.lowVolBoost;
        }

        // Milestone proximity protection
        const milestoneTargets = [2, 3, 5, 10];
        for (const m of milestoneTargets) {
            const target = conditions.initialBankroll * m;
            const progress = conditions.bankroll / target;
            if (progress > 0.85 && progress < 1.0) {
                // Close to milestone - protect gains
                multiplier *= this.genome.milestoneProtection;
                break;
            }
        }

        // Recovery mode
        if (conditions.currentDrawdown >= this.genome.recoveryThreshold) {
            multiplier *= this.genome.recoveryModeMultiplier;
        }

        return Math.max(0.1, Math.min(2.0, multiplier));
    }

    recordOutcome(survived: boolean, returns: number): void {
        if (survived) this.survivals++;
        else this.bankruptcies++;
        this.riskAdjustedReturns.push(returns);
        if (this.riskAdjustedReturns.length > 100) this.riskAdjustedReturns = this.riskAdjustedReturns.slice(-100);

        // Fitness: survival rate * average returns
        const total = this.survivals + this.bankruptcies;
        const survivalRate = total > 0 ? this.survivals / total : 0;
        const avgReturns = this.riskAdjustedReturns.length > 0
            ? this.riskAdjustedReturns.reduce((s, r) => s + r, 0) / this.riskAdjustedReturns.length : 0;
        this.fitness = total > 5 ? survivalRate * 50 + Math.min(50, avgReturns * 10) : 0;
    }

    evolve(partnerGenome?: RiskAdaptGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            if (Math.random() > 0.5) g.winStreakBoost = partnerGenome.winStreakBoost;
            if (Math.random() > 0.5) g.lossStreakReduce = partnerGenome.lossStreakReduce;
            if (Math.random() > 0.5) g.recoveryThreshold = partnerGenome.recoveryThreshold;
            if (Math.random() > 0.5) g.drawdownLevels = JSON.parse(JSON.stringify(partnerGenome.drawdownLevels));
        }

        // Mutate drawdown levels
        for (const level of g.drawdownLevels) {
            if (Math.random() < rate) level.threshold = clamp(level.threshold + (Math.random() - 0.5) * 10, 5, 60);
            if (Math.random() < rate) level.multiplier = clamp(level.multiplier + (Math.random() - 0.5) * 0.2, 0.1, 1.0);
        }
        // Keep sorted by threshold AND enforce monotonically decreasing multipliers
        g.drawdownLevels.sort((a, b) => a.threshold - b.threshold);
        for (let i = 1; i < g.drawdownLevels.length; i++) {
            if (g.drawdownLevels[i].multiplier >= g.drawdownLevels[i - 1].multiplier) {
                g.drawdownLevels[i].multiplier = g.drawdownLevels[i - 1].multiplier * 0.7;
            }
        }

        if (Math.random() < rate) g.winStreakBoost = clamp(g.winStreakBoost + (Math.random() - 0.5) * 0.2, 1.0, 1.5);
        if (Math.random() < rate) g.lossStreakReduce = clamp(g.lossStreakReduce + (Math.random() - 0.5) * 0.2, 0.3, 0.8);
        if (Math.random() < rate) g.streakTrigger = Math.max(2, Math.min(8, Math.round(g.streakTrigger + (Math.random() - 0.5) * 3)));
        if (Math.random() < rate) g.highVolReduction = clamp(g.highVolReduction + (Math.random() - 0.5) * 0.2, 0.5, 1.5);
        if (Math.random() < rate) g.lowVolBoost = clamp(g.lowVolBoost + (Math.random() - 0.5) * 0.15, 1.0, 1.3);
        if (Math.random() < rate) g.milestoneProtection = clamp(g.milestoneProtection + (Math.random() - 0.5) * 0.2, 0.5, 1.0);
        if (Math.random() < rate) g.recoveryModeMultiplier = clamp(g.recoveryModeMultiplier + (Math.random() - 0.5) * 0.2, 0.3, 0.8);
        if (Math.random() < rate) g.recoveryThreshold = clamp(g.recoveryThreshold + (Math.random() - 0.5) * 10, 15, 40);

        this.survivals = Math.floor(this.survivals * 0.8);
        this.bankruptcies = Math.floor(this.bankruptcies * 0.8);
        this.riskAdjustedReturns = this.riskAdjustedReturns.slice(-50);
    }

    getGenome(): RiskAdaptGenome { return JSON.parse(JSON.stringify(this.genome)); }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            survivals: this.survivals, bankruptcies: this.bankruptcies,
            riskAdjustedReturns: this.riskAdjustedReturns };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        this.survivals = data.survivals || 0;
        this.bankruptcies = data.bankruptcies || 0;
        if (data.riskAdjustedReturns) this.riskAdjustedReturns = data.riskAdjustedReturns;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
