/**
 * Seed 5: SentimentDNA - Market sentiment integration
 * Uses price-momentum, volume, and spread as sentiment proxies.
 * No external APIs needed - derives sentiment from available market data.
 */

export interface SentimentGenome {
    // Momentum lookback (3-20 cycles)
    momentumWindow: number;
    // Volume spike threshold (1.5-5.0x average)
    volumeSpikeThreshold: number;
    // Momentum strength to consider sentiment strong (0.5-3.0%)
    strongMomentumThreshold: number;
    // How much sentiment affects trade decisions (0-1)
    sentimentWeight: number;
    // Contrarian factor (0=follow sentiment, 1=fade sentiment)
    contrarianFactor: number;
    // Sentiment persistence: how many cycles sentiment lasts (5-30)
    sentimentPersistence: number;
}

export type SentimentState = 'EXTREME_GREED' | 'GREED' | 'NEUTRAL' | 'FEAR' | 'EXTREME_FEAR';

interface SentimentData {
    current: SentimentState;
    score: number; // -100 to 100 (negative=fear, positive=greed)
    momentumPct: number;
    volumeRatio: number;
    history: { score: number; cycle: number }[];
}

export class SentimentDNA {
    private genome: SentimentGenome;
    private data: SentimentData;
    private fitness: number = 0;
    private generation: number = 1;
    private priceBuffer: number[] = [];
    private volumeBuffer: number[] = [];
    private correctCalls: number = 0;
    private totalCalls: number = 0;
    private pnlHistory: number[] = [];

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
        this.data = { current: 'NEUTRAL', score: 0, momentumPct: 0, volumeRatio: 1, history: [] };
    }

    private createGenesis(personality?: string): SentimentGenome {
        const base: SentimentGenome = {
            momentumWindow: 10,
            volumeSpikeThreshold: 2.5,
            strongMomentumThreshold: 1.5,
            sentimentWeight: 0.5,
            contrarianFactor: 0.0,
            sentimentPersistence: 15
        };

        if (personality === 'ALPHA') { base.sentimentWeight = 0.7; } // Follows sentiment strongly
        if (personality === 'BETA') { base.contrarianFactor = 0.3; base.sentimentWeight = 0.4; } // Slightly contrarian
        if (personality === 'OMEGA') { base.volumeSpikeThreshold = 2.0; } // Sensitive to volume

        return base;
    }

    /**
     * Update sentiment from market data
     */
    update(avgPrice: number, avgVolume: number, cycle: number): void {
        this.priceBuffer.push(avgPrice);
        this.volumeBuffer.push(avgVolume);
        if (this.priceBuffer.length > 30) this.priceBuffer = this.priceBuffer.slice(-30);
        if (this.volumeBuffer.length > 30) this.volumeBuffer = this.volumeBuffer.slice(-30);

        if (this.priceBuffer.length < this.genome.momentumWindow) return;

        // Momentum
        const windowStart = this.priceBuffer[this.priceBuffer.length - this.genome.momentumWindow];
        const current = this.priceBuffer[this.priceBuffer.length - 1];
        this.data.momentumPct = ((current - windowStart) / windowStart) * 100;

        // Volume ratio
        const avgVol = this.volumeBuffer.slice(0, -3).reduce((s, v) => s + v, 0) / Math.max(1, this.volumeBuffer.length - 3);
        const recentVol = this.volumeBuffer.slice(-3).reduce((s, v) => s + v, 0) / 3;
        this.data.volumeRatio = avgVol > 0 ? recentVol / avgVol : 1;

        // Calculate sentiment score (-100 to 100)
        let score = 0;

        // Momentum component (0-60)
        const momNorm = Math.min(Math.abs(this.data.momentumPct) / this.genome.strongMomentumThreshold, 1);
        score += (this.data.momentumPct > 0 ? 1 : -1) * momNorm * 60;

        // Volume spike component (0-40)
        if (this.data.volumeRatio > this.genome.volumeSpikeThreshold) {
            // High volume amplifies momentum direction
            score += (this.data.momentumPct > 0 ? 1 : -1) * Math.min(40, (this.data.volumeRatio - 1) * 15);
        }

        this.data.score = Math.max(-100, Math.min(100, Math.round(score)));

        // Classify
        if (score > 60) this.data.current = 'EXTREME_GREED';
        else if (score > 25) this.data.current = 'GREED';
        else if (score < -60) this.data.current = 'EXTREME_FEAR';
        else if (score < -25) this.data.current = 'FEAR';
        else this.data.current = 'NEUTRAL';

        this.data.history.push({ score: this.data.score, cycle });
        if (this.data.history.length > 100) this.data.history = this.data.history.slice(-100);
    }

    /**
     * Get sentiment modifier for trading decisions
     * Returns: { modifier: number, shouldTrade: boolean }
     */
    getSentimentModifier(proposedDirection: 'LONG' | 'SHORT'): { modifier: number; shouldTrade: boolean } {
        const score = this.data.score;
        let modifier = 1.0;
        let shouldTrade = true;

        // Apply contrarian factor (smooth curve: 0=follow, 0.5=slight reduction, 1.0=mild contrarian)
        const effectiveScore = score * (1 - this.genome.contrarianFactor * 1.5);

        if (proposedDirection === 'LONG') {
            if (effectiveScore > 25) modifier = 1.0 + effectiveScore / 200; // Greed helps longs
            else if (effectiveScore < -40) modifier = 0.7; // Fear hurts longs
            if (effectiveScore < -60 && this.genome.sentimentWeight > 0.6) shouldTrade = false; // Extreme fear blocks longs
        } else {
            if (effectiveScore < -25) modifier = 1.0 + Math.abs(effectiveScore) / 200; // Fear helps shorts
            else if (effectiveScore > 40) modifier = 0.7; // Greed hurts shorts
            if (effectiveScore > 60 && this.genome.sentimentWeight > 0.6) shouldTrade = false; // Extreme greed blocks shorts
        }

        // Weight the modifier by sentimentWeight (blend with 1.0)
        modifier = 1.0 + (modifier - 1.0) * this.genome.sentimentWeight;

        return { modifier: Math.max(0.5, Math.min(1.5, modifier)), shouldTrade };
    }

    recordOutcome(profitable: boolean, pnlPercent: number = 0): void {
        this.totalCalls++;
        if (profitable) this.correctCalls++;
        this.pnlHistory.push(pnlPercent);
        if (this.pnlHistory.length > 100) this.pnlHistory = this.pnlHistory.slice(-100);
        if (this.pnlHistory.length > 10) {
            const mean = this.pnlHistory.reduce((s, p) => s + p, 0) / this.pnlHistory.length;
            const variance = this.pnlHistory.reduce((s, p) => s + (p - mean) ** 2, 0) / this.pnlHistory.length;
            const stdDev = Math.sqrt(variance);
            this.fitness = stdDev > 0 ? Math.max(0, (mean / stdDev) * 30 + 50) : (mean > 0 ? 70 : 30);
        }
    }

    evolve(partnerGenome?: SentimentGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            if (Math.random() > 0.5) g.momentumWindow = partnerGenome.momentumWindow;
            if (Math.random() > 0.5) g.sentimentWeight = partnerGenome.sentimentWeight;
            if (Math.random() > 0.5) g.contrarianFactor = partnerGenome.contrarianFactor;
        }

        if (Math.random() < rate) g.momentumWindow = Math.max(3, Math.min(20, Math.round(g.momentumWindow + (Math.random() - 0.5) * 6)));
        if (Math.random() < rate) g.volumeSpikeThreshold = clamp(g.volumeSpikeThreshold + (Math.random() - 0.5) * 1.0, 1.5, 5.0);
        if (Math.random() < rate) g.strongMomentumThreshold = clamp(g.strongMomentumThreshold + (Math.random() - 0.5) * 0.8, 0.5, 3.0);
        if (Math.random() < rate) g.sentimentWeight = clamp(g.sentimentWeight + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.contrarianFactor = clamp(g.contrarianFactor + (Math.random() - 0.5) * 0.3, 0, 1);
        if (Math.random() < rate) g.sentimentPersistence = Math.max(5, Math.min(30, Math.round(g.sentimentPersistence + (Math.random() - 0.5) * 10)));

        // EMA decay: preserve 80% of learning
        this.correctCalls = Math.floor(this.correctCalls * 0.8);
        this.totalCalls = Math.floor(this.totalCalls * 0.8);
        this.pnlHistory = this.pnlHistory.slice(-50);
    }

    getCurrentSentiment(): SentimentState { return this.data.current; }
    getScore(): number { return this.data.score; }
    getGenome(): SentimentGenome { return { ...this.genome }; }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }

    serialize(): any {
        return { genome: this.genome, data: this.data, fitness: this.fitness, generation: this.generation,
            priceBuffer: this.priceBuffer, volumeBuffer: this.volumeBuffer,
            correctCalls: this.correctCalls, totalCalls: this.totalCalls,
            pnlHistory: this.pnlHistory };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        if (data.data) this.data = data.data;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        if (data.priceBuffer) this.priceBuffer = data.priceBuffer;
        if (data.volumeBuffer) this.volumeBuffer = data.volumeBuffer;
        this.correctCalls = data.correctCalls || 0;
        this.totalCalls = data.totalCalls || 0;
        if (data.pnlHistory) this.pnlHistory = data.pnlHistory;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
