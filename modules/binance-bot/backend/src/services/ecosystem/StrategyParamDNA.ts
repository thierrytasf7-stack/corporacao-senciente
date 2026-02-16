/**
 * Seed 1: StrategyParamDNA - Evolvable signal processing layer
 * Each group evolves HOW it interprets signals from the fixed 30-strategy pool.
 * Modifies signal strengths by category, applies minimum thresholds, recency bias.
 */

import { PoolSignal, MarketSignals } from '../SignalPoolEngine';

export interface StrategyParamGenome {
    // Strength multipliers per category (0.3 - 2.5)
    trendMultiplier: number;
    momentumMultiplier: number;
    volatilityMultiplier: number;

    // Minimum strength to consider signal valid (0-50)
    minStrengthThreshold: number;

    // Boost signals that agree with higher timeframe (0.8-1.5)
    htfConfirmationBoost: number;

    // Penalty for signals that disagree with higher timeframe (0.3-1.0)
    htfDisagreementPenalty: number;

    // Strength cap (50-100) - signals above this are capped
    strengthCap: number;
}

const CATEGORY_MAP: Record<string, 'TREND' | 'MOMENTUM' | 'VOLATILITY'> = {};
for (let i = 0; i < 10; i++) CATEGORY_MAP[`TREND_${String(i + 1).padStart(3, '0')}`] = 'TREND';
for (let i = 10; i < 20; i++) CATEGORY_MAP[`MOM_${String(i + 1).padStart(3, '0')}`] = 'MOMENTUM';
for (let i = 20; i < 30; i++) CATEGORY_MAP[`VOL_${String(i + 1).padStart(3, '0')}`] = 'VOLATILITY';

export class StrategyParamDNA {
    private genome: StrategyParamGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private correctPredictions: number = 0;
    private totalPredictions: number = 0;
    private pnlHistory: number[] = [];

    constructor(personality?: 'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA' | 'OMEGA') {
        this.genome = this.createGenesis(personality);
    }

    private createGenesis(personality?: string): StrategyParamGenome {
        const base: StrategyParamGenome = {
            trendMultiplier: 1.0,
            momentumMultiplier: 1.0,
            volatilityMultiplier: 1.0,
            minStrengthThreshold: 10,
            htfConfirmationBoost: 1.2,
            htfDisagreementPenalty: 0.7,
            strengthCap: 95
        };

        switch (personality) {
            case 'ALPHA': // Aggressive Trend
                base.trendMultiplier = 1.8; base.momentumMultiplier = 1.2; base.volatilityMultiplier = 0.6;
                base.minStrengthThreshold = 8; break;
            case 'BETA': // Conservative
                base.trendMultiplier = 1.0; base.momentumMultiplier = 0.8; base.volatilityMultiplier = 1.0;
                base.minStrengthThreshold = 15; base.strengthCap = 85; break;
            case 'GAMMA': // Balanced
                base.trendMultiplier = 1.1; base.momentumMultiplier = 1.1; base.volatilityMultiplier = 1.1; break;
            case 'DELTA': // Momentum
                base.trendMultiplier = 0.7; base.momentumMultiplier = 1.8; base.volatilityMultiplier = 0.8;
                base.minStrengthThreshold = 8; break;
            case 'OMEGA': // Volatility
                base.trendMultiplier = 0.6; base.momentumMultiplier = 0.8; base.volatilityMultiplier = 2.0;
                base.htfConfirmationBoost = 1.0; break;
        }
        return base;
    }

    /**
     * Process signals through this group's evolved parameters
     */
    processSignals(signals: PoolSignal[], htfBias: MarketSignals['higherTF']): PoolSignal[] {
        return signals.map(s => {
            let adjustedStrength = s.strength;

            // Apply category multiplier
            const mult = s.category === 'TREND' ? this.genome.trendMultiplier
                : s.category === 'MOMENTUM' ? this.genome.momentumMultiplier
                : this.genome.volatilityMultiplier;
            adjustedStrength *= mult;

            // HTF confirmation/disagreement
            if (s.direction !== 'NEUTRAL' && htfBias.bias !== 'NEUTRAL') {
                if (s.direction === htfBias.bias) adjustedStrength *= this.genome.htfConfirmationBoost;
                else adjustedStrength *= this.genome.htfDisagreementPenalty;
            }

            // Filter weak signals
            if (adjustedStrength < this.genome.minStrengthThreshold) {
                return { ...s, strength: 0, direction: 'NEUTRAL' as const };
            }

            // Cap
            adjustedStrength = Math.min(adjustedStrength, this.genome.strengthCap);

            return { ...s, strength: Math.round(adjustedStrength) };
        });
    }

    recordOutcome(profitable: boolean, pnlPercent: number = 0): void {
        this.totalPredictions++;
        if (profitable) this.correctPredictions++;
        this.pnlHistory.push(pnlPercent);
        if (this.pnlHistory.length > 100) this.pnlHistory = this.pnlHistory.slice(-100);
        // Sharpe-based fitness: consistent profits > win rate
        if (this.pnlHistory.length > 10) {
            const mean = this.pnlHistory.reduce((s, p) => s + p, 0) / this.pnlHistory.length;
            const variance = this.pnlHistory.reduce((s, p) => s + (p - mean) ** 2, 0) / this.pnlHistory.length;
            const stdDev = Math.sqrt(variance);
            this.fitness = stdDev > 0 ? Math.max(0, (mean / stdDev) * 30 + 50) : (mean > 0 ? 70 : 30);
        }
    }

    evolve(partnerGenome?: StrategyParamGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        // Crossover if partner
        if (partnerGenome) {
            if (Math.random() > 0.5) g.trendMultiplier = partnerGenome.trendMultiplier;
            if (Math.random() > 0.5) g.momentumMultiplier = partnerGenome.momentumMultiplier;
            if (Math.random() > 0.5) g.volatilityMultiplier = partnerGenome.volatilityMultiplier;
            if (Math.random() > 0.5) g.minStrengthThreshold = partnerGenome.minStrengthThreshold;
        }

        // Mutate
        if (Math.random() < rate) g.trendMultiplier = clamp(g.trendMultiplier + (Math.random() - 0.5) * 0.4, 0.3, 2.5);
        if (Math.random() < rate) g.momentumMultiplier = clamp(g.momentumMultiplier + (Math.random() - 0.5) * 0.4, 0.3, 2.5);
        if (Math.random() < rate) g.volatilityMultiplier = clamp(g.volatilityMultiplier + (Math.random() - 0.5) * 0.4, 0.3, 2.5);
        if (Math.random() < rate) g.minStrengthThreshold = clamp(g.minStrengthThreshold + (Math.random() - 0.5) * 15, 0, 50);
        if (Math.random() < rate) g.htfConfirmationBoost = clamp(g.htfConfirmationBoost + (Math.random() - 0.5) * 0.3, 0.8, 1.5);
        if (Math.random() < rate) g.htfDisagreementPenalty = clamp(g.htfDisagreementPenalty + (Math.random() - 0.5) * 0.2, 0.3, 1.0);
        if (Math.random() < rate) g.strengthCap = clamp(g.strengthCap + (Math.random() - 0.5) * 20, 50, 100);

        // EMA decay: preserve 80% of learning
        this.correctPredictions = Math.floor(this.correctPredictions * 0.8);
        this.totalPredictions = Math.floor(this.totalPredictions * 0.8);
        this.pnlHistory = this.pnlHistory.slice(-50);
    }

    getGenome(): StrategyParamGenome { return { ...this.genome }; }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }
    getAccuracy(): number { return this.totalPredictions > 0 ? this.correctPredictions / this.totalPredictions : 0; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            correctPredictions: this.correctPredictions, totalPredictions: this.totalPredictions,
            pnlHistory: this.pnlHistory };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        this.correctPredictions = data.correctPredictions || 0;
        this.totalPredictions = data.totalPredictions || 0;
        if (data.pnlHistory) this.pnlHistory = data.pnlHistory;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
