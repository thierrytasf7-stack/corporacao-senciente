/**
 * Seed 4: CorrelationDNA - Cross-market correlation learning
 * Tracks relationships between trading pairs and uses them to filter/boost signals.
 * BTC leads, alts follow - but by how much and how fast?
 */

export interface CorrelationGenome {
    // BTC dominance weight: how much BTC direction influences alt decisions (0-2)
    btcDominanceWeight: number;
    // Correlation lag: how many cycles BTC leads alts (0-10)
    correlationLag: number;
    // Pair-specific correlation weights (evolvable)
    pairWeights: Record<string, number>; // symbol -> influence weight 0-2
    // Min correlation confidence to use (0.3-0.9)
    minCorrelationConfidence: number;
    // Anti-correlation threshold: when pairs diverge, reduce confidence (0.2-0.8)
    divergenceThreshold: number;
}

interface PairState {
    recentDirections: ('LONG' | 'SHORT' | 'NEUTRAL')[];
    recentPrices: number[];
    recentPnls: number[];
}

export class CorrelationDNA {
    private genome: CorrelationGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private pairStates: Record<string, PairState> = {};
    private correlationAccuracy: number = 0;
    private correlationTotal: number = 0;
    private pnlHistory: number[] = [];

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
    }

    private createGenesis(personality?: string): CorrelationGenome {
        const base: CorrelationGenome = {
            btcDominanceWeight: 1.2,
            correlationLag: 2,
            pairWeights: {
                'BTCUSDT': 1.5,
                'ETHUSDT': 1.2,
                'SOLUSDT': 1.0,
                'BNBUSDT': 0.8,
                'XRPUSDT': 0.7
            },
            minCorrelationConfidence: 0.5,
            divergenceThreshold: 0.5
        };

        if (personality === 'ALPHA') { base.btcDominanceWeight = 1.5; } // Follow the leader
        if (personality === 'BETA') { base.btcDominanceWeight = 0.8; base.minCorrelationConfidence = 0.7; }
        if (personality === 'OMEGA') { base.divergenceThreshold = 0.3; } // Exploit divergences

        return base;
    }

    /**
     * Update pair state with latest market direction
     */
    updatePairState(symbol: string, dominantDirection: 'LONG' | 'SHORT' | 'NEUTRAL', price: number): void {
        if (!this.pairStates[symbol]) {
            this.pairStates[symbol] = { recentDirections: [], recentPrices: [], recentPnls: [] };
        }
        const state = this.pairStates[symbol];
        state.recentDirections.push(dominantDirection);
        state.recentPrices.push(price);
        if (state.recentDirections.length > 20) state.recentDirections = state.recentDirections.slice(-20);
        if (state.recentPrices.length > 20) state.recentPrices = state.recentPrices.slice(-20);
    }

    /**
     * Get correlation-based signal modifier for a symbol
     * Returns: multiplier (>1 = boost, <1 = reduce, 0 = skip)
     */
    getCorrelationModifier(symbol: string, direction: 'LONG' | 'SHORT'): number {
        const btcState = this.pairStates['BTCUSDT'];
        if (!btcState || btcState.recentDirections.length < 3) return 1.0;

        // BTC dominance: does BTC agree with the proposed direction?
        const lagIdx = Math.max(0, btcState.recentDirections.length - 1 - this.genome.correlationLag);
        const btcDirection = btcState.recentDirections[lagIdx];

        let modifier = 1.0;

        if (symbol !== 'BTCUSDT') {
            if (btcDirection === direction) {
                // BTC confirms - boost
                modifier *= 1.0 + (this.genome.btcDominanceWeight - 1.0) * 0.5;
            } else if (btcDirection !== 'NEUTRAL' && btcDirection !== direction) {
                // BTC disagrees - reduce
                modifier *= 1.0 / (1.0 + (this.genome.btcDominanceWeight - 1.0) * 0.3);
            }
        }

        // Cross-pair confirmation: how many other pairs agree?
        let agreeing = 0, disagreeing = 0;
        for (const [pairSymbol, state] of Object.entries(this.pairStates)) {
            if (pairSymbol === symbol || state.recentDirections.length < 2) continue;
            const pairDir = state.recentDirections[state.recentDirections.length - 1];
            const weight = this.genome.pairWeights[pairSymbol] || 1.0;
            if (pairDir === direction) agreeing += weight;
            else if (pairDir !== 'NEUTRAL') disagreeing += weight;
        }

        const total = agreeing + disagreeing;
        if (total > 0) {
            const agreementRatio = agreeing / total;
            if (agreementRatio > this.genome.minCorrelationConfidence) {
                modifier *= 1.0 + (agreementRatio - 0.5) * 0.3; // Mild boost
            } else if (agreementRatio < this.genome.divergenceThreshold) {
                modifier *= 0.7; // Divergence penalty
            }
        }

        return Math.max(0.3, Math.min(1.8, modifier));
    }

    recordOutcome(profitable: boolean, pnlPercent: number = 0): void {
        this.correlationTotal++;
        if (profitable) this.correlationAccuracy++;
        this.pnlHistory.push(pnlPercent);
        if (this.pnlHistory.length > 100) this.pnlHistory = this.pnlHistory.slice(-100);
        if (this.pnlHistory.length > 10) {
            const mean = this.pnlHistory.reduce((s, p) => s + p, 0) / this.pnlHistory.length;
            const variance = this.pnlHistory.reduce((s, p) => s + (p - mean) ** 2, 0) / this.pnlHistory.length;
            const stdDev = Math.sqrt(variance);
            this.fitness = stdDev > 0 ? Math.max(0, (mean / stdDev) * 30 + 50) : (mean > 0 ? 70 : 30);
        }
    }

    evolve(partnerGenome?: CorrelationGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            if (Math.random() > 0.5) g.btcDominanceWeight = partnerGenome.btcDominanceWeight;
            if (Math.random() > 0.5) g.correlationLag = partnerGenome.correlationLag;
            if (Math.random() > 0.5) g.minCorrelationConfidence = partnerGenome.minCorrelationConfidence;
        }

        if (Math.random() < rate) g.btcDominanceWeight = clamp(g.btcDominanceWeight + (Math.random() - 0.5) * 0.4, 0, 2);
        if (Math.random() < rate) g.correlationLag = Math.max(0, Math.min(10, Math.round(g.correlationLag + (Math.random() - 0.5) * 4)));
        if (Math.random() < rate) g.minCorrelationConfidence = clamp(g.minCorrelationConfidence + (Math.random() - 0.5) * 0.2, 0.3, 0.9);
        if (Math.random() < rate) g.divergenceThreshold = clamp(g.divergenceThreshold + (Math.random() - 0.5) * 0.2, 0.2, 0.8);

        for (const sym of Object.keys(g.pairWeights)) {
            if (Math.random() < rate) g.pairWeights[sym] = clamp(g.pairWeights[sym] + (Math.random() - 0.5) * 0.4, 0, 2);
        }

        // EMA decay: preserve 80% of learning
        this.correlationAccuracy = Math.floor(this.correlationAccuracy * 0.8);
        this.correlationTotal = Math.floor(this.correlationTotal * 0.8);
        this.pnlHistory = this.pnlHistory.slice(-50);
    }

    getGenome(): CorrelationGenome { return JSON.parse(JSON.stringify(this.genome)); }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            pairStates: this.pairStates, correlationAccuracy: this.correlationAccuracy,
            correlationTotal: this.correlationTotal, pnlHistory: this.pnlHistory };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        if (data.pairStates) this.pairStates = data.pairStates;
        this.correlationAccuracy = data.correlationAccuracy || 0;
        this.correlationTotal = data.correlationTotal || 0;
        if (data.pnlHistory) this.pnlHistory = data.pnlHistory;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
