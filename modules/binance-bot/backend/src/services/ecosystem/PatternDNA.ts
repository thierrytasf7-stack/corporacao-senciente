/**
 * Seed 8: PatternDNA - Price pattern recognition with evolvable confidence
 * Detects candlestick patterns and support/resistance from market data.
 * Each group evolves which patterns to trust and how much weight to give them.
 */

export interface PatternGenome {
    // Candlestick pattern confidence thresholds (0-1)
    dojiWeight: number;
    hammerWeight: number;
    engulfingWeight: number;
    pinBarWeight: number;
    insideBarWeight: number;
    // Support/Resistance
    srWeight: number;          // How much S/R affects decisions (0-2)
    srLookback: number;        // How many price points to consider (10-50)
    srTolerance: number;       // % tolerance for "near" S/R (0.1-1.0%)
    // Overall pattern influence (0-1)
    patternInfluence: number;
}

type PatternType = 'DOJI' | 'HAMMER' | 'ENGULFING_BULL' | 'ENGULFING_BEAR' | 'PIN_BAR_BULL' | 'PIN_BAR_BEAR' | 'INSIDE_BAR';

interface DetectedPattern {
    type: PatternType;
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    confidence: number;
}

export class PatternDNA {
    private genome: PatternGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private correctPatterns: number = 0;
    private totalPatterns: number = 0;
    private pnlHistory: number[] = [];
    private recentHighs: number[] = [];
    private recentLows: number[] = [];

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
    }

    private createGenesis(personality?: string): PatternGenome {
        const base: PatternGenome = {
            dojiWeight: 0.5,
            hammerWeight: 0.7,
            engulfingWeight: 0.8,
            pinBarWeight: 0.6,
            insideBarWeight: 0.4,
            srWeight: 1.0,
            srLookback: 20,
            srTolerance: 0.3,
            patternInfluence: 0.5
        };

        if (personality === 'ALPHA') { base.engulfingWeight = 1.0; base.patternInfluence = 0.6; }
        if (personality === 'BETA') { base.srWeight = 1.5; base.patternInfluence = 0.7; } // Trusts S/R more
        if (personality === 'DELTA') { base.pinBarWeight = 0.9; } // Momentum reversal patterns

        return base;
    }

    /**
     * Analyze price data for patterns. Returns trading bias modifier.
     * candles: [open, high, low, close] for last 5 candles
     */
    analyze(candles: { open: number; high: number; low: number; close: number }[], currentPrice: number): {
        bias: 'LONG' | 'SHORT' | 'NEUTRAL';
        modifier: number;
        patterns: string[];
        nearSupport: boolean;
        nearResistance: boolean;
    } {
        const result = { bias: 'NEUTRAL' as 'LONG' | 'SHORT' | 'NEUTRAL', modifier: 1.0, patterns: [] as string[],
            nearSupport: false, nearResistance: false };

        if (candles.length < 3) return result;

        const detected: DetectedPattern[] = [];
        const last = candles[candles.length - 1];
        const prev = candles[candles.length - 2];
        const bodySize = Math.abs(last.close - last.open);
        const totalRange = last.high - last.low;

        if (totalRange === 0) return result;

        // DOJI: tiny body relative to range
        if (bodySize / totalRange < 0.1) {
            detected.push({ type: 'DOJI', direction: 'NEUTRAL', confidence: this.genome.dojiWeight });
        }

        // HAMMER: small body at top, long lower wick
        const lowerWick = Math.min(last.open, last.close) - last.low;
        const upperWick = last.high - Math.max(last.open, last.close);
        if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
            detected.push({ type: 'HAMMER', direction: 'LONG', confidence: this.genome.hammerWeight });
        }

        // ENGULFING
        if (last.close > last.open && prev.close < prev.open &&
            last.open <= prev.close && last.close >= prev.open) {
            detected.push({ type: 'ENGULFING_BULL', direction: 'LONG', confidence: this.genome.engulfingWeight });
        }
        if (last.close < last.open && prev.close > prev.open &&
            last.open >= prev.close && last.close <= prev.open) {
            detected.push({ type: 'ENGULFING_BEAR', direction: 'SHORT', confidence: this.genome.engulfingWeight });
        }

        // PIN BAR: long wick in one direction
        if (upperWick > bodySize * 2.5 && lowerWick < bodySize * 0.5) {
            detected.push({ type: 'PIN_BAR_BEAR', direction: 'SHORT', confidence: this.genome.pinBarWeight });
        }
        if (lowerWick > bodySize * 2.5 && upperWick < bodySize * 0.5) {
            detected.push({ type: 'PIN_BAR_BULL', direction: 'LONG', confidence: this.genome.pinBarWeight });
        }

        // INSIDE BAR
        if (last.high < prev.high && last.low > prev.low) {
            detected.push({ type: 'INSIDE_BAR', direction: 'NEUTRAL', confidence: this.genome.insideBarWeight });
        }

        // Update S/R levels
        this.updateSRLevels(candles);

        // Check proximity to support/resistance
        const tolerance = currentPrice * this.genome.srTolerance / 100;
        for (const support of this.recentLows) {
            if (Math.abs(currentPrice - support) < tolerance) {
                result.nearSupport = true;
                break;
            }
        }
        for (const resistance of this.recentHighs) {
            if (Math.abs(currentPrice - resistance) < tolerance) {
                result.nearResistance = true;
                break;
            }
        }

        // Calculate combined bias
        let longScore = 0, shortScore = 0;

        for (const p of detected) {
            result.patterns.push(p.type);
            if (p.direction === 'LONG') longScore += p.confidence;
            else if (p.direction === 'SHORT') shortScore += p.confidence;
        }

        // S/R influence
        if (result.nearSupport) longScore += this.genome.srWeight * 0.5;
        if (result.nearResistance) shortScore += this.genome.srWeight * 0.5;

        if (longScore > shortScore + 0.2) result.bias = 'LONG';
        else if (shortScore > longScore + 0.2) result.bias = 'SHORT';

        // Modifier: blend with pattern influence
        const maxScore = Math.max(longScore, shortScore);
        result.modifier = 1.0 + (maxScore - 0.5) * this.genome.patternInfluence;
        result.modifier = Math.max(0.6, Math.min(1.5, result.modifier));

        return result;
    }

    private updateSRLevels(candles: { open: number; high: number; low: number; close: number }[]): void {
        for (const c of candles) {
            this.recentHighs.push(c.high);
            this.recentLows.push(c.low);
        }
        const lookback = Math.round(this.genome.srLookback);
        if (this.recentHighs.length > lookback) this.recentHighs = this.recentHighs.slice(-lookback);
        if (this.recentLows.length > lookback) this.recentLows = this.recentLows.slice(-lookback);
    }

    recordOutcome(profitable: boolean, pnlPercent: number = 0): void {
        this.totalPatterns++;
        if (profitable) this.correctPatterns++;
        this.pnlHistory.push(pnlPercent);
        if (this.pnlHistory.length > 100) this.pnlHistory = this.pnlHistory.slice(-100);
        if (this.pnlHistory.length > 10) {
            const mean = this.pnlHistory.reduce((s, p) => s + p, 0) / this.pnlHistory.length;
            const variance = this.pnlHistory.reduce((s, p) => s + (p - mean) ** 2, 0) / this.pnlHistory.length;
            const stdDev = Math.sqrt(variance);
            this.fitness = stdDev > 0 ? Math.max(0, (mean / stdDev) * 30 + 50) : (mean > 0 ? 70 : 30);
        }
    }

    evolve(partnerGenome?: PatternGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            if (Math.random() > 0.5) g.dojiWeight = partnerGenome.dojiWeight;
            if (Math.random() > 0.5) g.hammerWeight = partnerGenome.hammerWeight;
            if (Math.random() > 0.5) g.engulfingWeight = partnerGenome.engulfingWeight;
            if (Math.random() > 0.5) g.pinBarWeight = partnerGenome.pinBarWeight;
            if (Math.random() > 0.5) g.insideBarWeight = partnerGenome.insideBarWeight;
            if (Math.random() > 0.5) g.srWeight = partnerGenome.srWeight;
            if (Math.random() > 0.5) g.srLookback = partnerGenome.srLookback;
            if (Math.random() > 0.5) g.srTolerance = partnerGenome.srTolerance;
            if (Math.random() > 0.5) g.patternInfluence = partnerGenome.patternInfluence;
        }

        if (Math.random() < rate) g.dojiWeight = clamp(g.dojiWeight + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.hammerWeight = clamp(g.hammerWeight + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.engulfingWeight = clamp(g.engulfingWeight + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.pinBarWeight = clamp(g.pinBarWeight + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.insideBarWeight = clamp(g.insideBarWeight + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.srWeight = clamp(g.srWeight + (Math.random() - 0.5) * 0.4, 0, 2);
        if (Math.random() < rate) g.srLookback = Math.max(10, Math.min(50, Math.round(g.srLookback + (Math.random() - 0.5) * 15)));
        if (Math.random() < rate) g.srTolerance = clamp(g.srTolerance + (Math.random() - 0.5) * 0.3, 0.1, 1.0);
        if (Math.random() < rate) g.patternInfluence = clamp(g.patternInfluence + (Math.random() - 0.5) * 0.2, 0, 1);

        // EMA decay: preserve 80% of learning
        this.correctPatterns = Math.floor(this.correctPatterns * 0.8);
        this.totalPatterns = Math.floor(this.totalPatterns * 0.8);
        this.pnlHistory = this.pnlHistory.slice(-50);
    }

    getGenome(): PatternGenome { return { ...this.genome }; }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            correctPatterns: this.correctPatterns, totalPatterns: this.totalPatterns,
            recentHighs: this.recentHighs, recentLows: this.recentLows,
            pnlHistory: this.pnlHistory };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        this.correctPatterns = data.correctPatterns || 0;
        this.totalPatterns = data.totalPatterns || 0;
        if (data.pnlHistory) this.pnlHistory = data.pnlHistory;
        if (data.recentHighs) this.recentHighs = data.recentHighs;
        if (data.recentLows) this.recentLows = data.recentLows;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
