/**
 * Seed 2: MarketRegimeDNA - Evolvable market regime classification
 * Detects TRENDING/RANGING/VOLATILE/CRASH states from market data.
 * Each group evolves its own thresholds for classification.
 */

import { MarketSignals } from '../SignalPoolEngine';

export type MarketRegime = 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE' | 'CRASH';

export interface RegimeGenome {
    // ATR ratio threshold: current ATR / avg ATR. High = volatile (1.2-3.0)
    volatileATRRatio: number;
    // Crash threshold: when price drops > X% in recent candles (3-15%)
    crashThreshold: number;
    // Trend strength: min directional signal ratio to call trending (0.5-0.9)
    trendMinRatio: number;
    // Ranging: max spread of signals (low directional agreement) (0.3-0.7)
    rangingMaxRatio: number;
    // Strategy boosts per regime
    regimeBoosts: Record<MarketRegime, { trend: number; momentum: number; volatility: number }>;
}

export interface RegimeState {
    current: MarketRegime;
    confidence: number; // 0-100
    history: { regime: MarketRegime; cycle: number }[];
    priceHistory: number[]; // last 20 prices for trend detection
}

export class MarketRegimeDNA {
    private genome: RegimeGenome;
    private state: RegimeState;
    private fitness: number = 0;
    private generation: number = 1;
    private correctClassifications: number = 0;
    private totalClassifications: number = 0;
    private pnlHistory: number[] = [];

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
        this.state = { current: 'RANGING', confidence: 50, history: [], priceHistory: [] };
    }

    private createGenesis(personality?: string): RegimeGenome {
        const base: RegimeGenome = {
            volatileATRRatio: 1.8,
            crashThreshold: 5.0,
            trendMinRatio: 0.65,
            rangingMaxRatio: 0.55,
            regimeBoosts: {
                TRENDING_UP: { trend: 1.5, momentum: 1.3, volatility: 0.7 },
                TRENDING_DOWN: { trend: 1.5, momentum: 1.3, volatility: 0.7 },
                RANGING: { trend: 0.5, momentum: 0.8, volatility: 1.3 },
                VOLATILE: { trend: 0.7, momentum: 1.2, volatility: 1.5 },
                CRASH: { trend: 0.3, momentum: 0.5, volatility: 0.5 }
            }
        };

        // Personality adjustments
        if (personality === 'ALPHA') { base.trendMinRatio = 0.55; } // More aggressive trend detection
        if (personality === 'BETA') { base.trendMinRatio = 0.75; } // Conservative
        if (personality === 'OMEGA') { base.volatileATRRatio = 1.5; } // Sensitive to volatility

        return base;
    }

    /**
     * Classify current market regime from signals
     */
    classify(allSignals: MarketSignals[], cycle: number): MarketRegime {
        if (allSignals.length === 0) return this.state.current;

        // Aggregate across all symbols
        let totalLong = 0, totalShort = 0, totalNeutral = 0;
        let avgATR = 0, priceSum = 0, atrCount = 0;

        for (const ms of allSignals) {
            totalLong += ms.summary.longCount;
            totalShort += ms.summary.shortCount;
            totalNeutral += ms.summary.neutralCount;
            if (ms.atr14) { avgATR += ms.atr14; atrCount++; }
            priceSum += ms.currentPrice;
        }

        if (atrCount > 0) avgATR /= atrCount;
        const avgPrice = priceSum / allSignals.length;

        // Update price history
        this.state.priceHistory.push(avgPrice);
        if (this.state.priceHistory.length > 20) this.state.priceHistory = this.state.priceHistory.slice(-20);

        const totalSignals = totalLong + totalShort + totalNeutral;
        if (totalSignals === 0) return this.state.current;

        // Price change over recent history
        let priceChangePct = 0;
        if (this.state.priceHistory.length >= 5) {
            const oldest = this.state.priceHistory[this.state.priceHistory.length - 5];
            priceChangePct = ((avgPrice - oldest) / oldest) * 100;
        }

        // Classify
        let regime: MarketRegime = 'RANGING';
        let confidence = 50;

        // CRASH: sharp negative move
        if (priceChangePct < -this.genome.crashThreshold) {
            regime = 'CRASH';
            confidence = Math.min(100, Math.abs(priceChangePct) / this.genome.crashThreshold * 80);
        }
        // VOLATILE: ATR anomaly (need baseline)
        else if (this.state.priceHistory.length >= 10) {
            const recentATRProxy = Math.abs(this.state.priceHistory[this.state.priceHistory.length - 1] -
                this.state.priceHistory[this.state.priceHistory.length - 3]) / avgPrice * 100;
            const baseATRProxy = Math.abs(this.state.priceHistory[5] - this.state.priceHistory[0]) / this.state.priceHistory[0] * 100;

            if (baseATRProxy > 0 && recentATRProxy / baseATRProxy > this.genome.volatileATRRatio) {
                regime = 'VOLATILE';
                confidence = Math.min(100, (recentATRProxy / baseATRProxy / this.genome.volatileATRRatio) * 70);
            }
        }

        // TRENDING: strong directional agreement
        if (regime === 'RANGING') {
            const longRatio = totalLong / totalSignals;
            const shortRatio = totalShort / totalSignals;

            if (longRatio > this.genome.trendMinRatio) {
                regime = 'TRENDING_UP';
                confidence = longRatio * 100;
            } else if (shortRatio > this.genome.trendMinRatio) {
                regime = 'TRENDING_DOWN';
                confidence = shortRatio * 100;
            } else if (Math.max(longRatio, shortRatio) < this.genome.rangingMaxRatio) {
                regime = 'RANGING';
                confidence = (1 - Math.max(longRatio, shortRatio)) * 100;
            }
        }

        this.state.current = regime;
        this.state.confidence = Math.round(confidence);
        this.state.history.push({ regime, cycle });
        if (this.state.history.length > 100) this.state.history = this.state.history.slice(-100);

        return regime;
    }

    /**
     * Get strategy category boosts for current regime
     */
    getRegimeBoosts(): { trend: number; momentum: number; volatility: number } {
        return this.genome.regimeBoosts[this.state.current] || { trend: 1, momentum: 1, volatility: 1 };
    }

    getCurrentRegime(): MarketRegime { return this.state.current; }
    getConfidence(): number { return this.state.confidence; }

    recordOutcome(profitable: boolean, pnlPercent: number = 0): void {
        this.totalClassifications++;
        if (profitable) this.correctClassifications++;
        this.pnlHistory.push(pnlPercent);
        if (this.pnlHistory.length > 100) this.pnlHistory = this.pnlHistory.slice(-100);
        if (this.pnlHistory.length > 10) {
            const mean = this.pnlHistory.reduce((s, p) => s + p, 0) / this.pnlHistory.length;
            const variance = this.pnlHistory.reduce((s, p) => s + (p - mean) ** 2, 0) / this.pnlHistory.length;
            const stdDev = Math.sqrt(variance);
            this.fitness = stdDev > 0 ? Math.max(0, (mean / stdDev) * 30 + 50) : (mean > 0 ? 70 : 30);
        }
    }

    evolve(partnerGenome?: RegimeGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            if (Math.random() > 0.5) g.volatileATRRatio = partnerGenome.volatileATRRatio;
            if (Math.random() > 0.5) g.crashThreshold = partnerGenome.crashThreshold;
            if (Math.random() > 0.5) g.trendMinRatio = partnerGenome.trendMinRatio;
        }

        if (Math.random() < rate) g.volatileATRRatio = clamp(g.volatileATRRatio + (Math.random() - 0.5) * 0.5, 1.2, 3.0);
        if (Math.random() < rate) g.crashThreshold = clamp(g.crashThreshold + (Math.random() - 0.5) * 3, 3, 15);
        if (Math.random() < rate) g.trendMinRatio = clamp(g.trendMinRatio + (Math.random() - 0.5) * 0.15, 0.5, 0.9);
        if (Math.random() < rate) g.rangingMaxRatio = clamp(g.rangingMaxRatio + (Math.random() - 0.5) * 0.1, 0.3, 0.7);

        // Mutate only 1 random regime's boosts per generation (prevents chaotic 15-gene mutation)
        const regimes = Object.keys(g.regimeBoosts) as MarketRegime[];
        const targetRegime = regimes[Math.floor(Math.random() * regimes.length)];
        const rb = g.regimeBoosts[targetRegime];
        if (Math.random() < rate) rb.trend = clamp(rb.trend + (Math.random() - 0.5) * 0.3, 0.2, 2.0);
        if (Math.random() < rate) rb.momentum = clamp(rb.momentum + (Math.random() - 0.5) * 0.3, 0.2, 2.0);
        if (Math.random() < rate) rb.volatility = clamp(rb.volatility + (Math.random() - 0.5) * 0.3, 0.2, 2.0);

        // EMA decay: preserve 80% of learning
        this.correctClassifications = Math.floor(this.correctClassifications * 0.8);
        this.totalClassifications = Math.floor(this.totalClassifications * 0.8);
        this.pnlHistory = this.pnlHistory.slice(-50);
    }

    getGenome(): RegimeGenome { return JSON.parse(JSON.stringify(this.genome)); }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }

    serialize(): any {
        return { genome: this.genome, state: this.state, fitness: this.fitness,
            generation: this.generation, correctClassifications: this.correctClassifications,
            totalClassifications: this.totalClassifications, pnlHistory: this.pnlHistory };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        if (data.state) this.state = data.state;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        this.correctClassifications = data.correctClassifications || 0;
        this.totalClassifications = data.totalClassifications || 0;
        if (data.pnlHistory) this.pnlHistory = data.pnlHistory;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
