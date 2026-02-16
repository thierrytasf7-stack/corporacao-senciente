/**
 * Seed 9: SymbolSelectionDNA - Dynamic trading pair selection
 * Evolves which symbols to prioritize based on performance history.
 * Learns that some pairs work better in certain conditions.
 */

export interface SymbolGenome {
    // Per-symbol preference weight (0-2, higher = more trades on this pair)
    symbolWeights: Record<string, number>;
    // Maximum symbols to trade simultaneously per bot (1-5)
    maxActiveSymbols: number;
    // Rotation interval: how often to re-evaluate symbol selection (50-300 cycles)
    rotationInterval: number;
    // Performance lookback: how many trades to consider for symbol ranking (20-100)
    performanceLookback: number;
    // Min trades before judging a symbol (5-20)
    minTradesForJudgment: number;
}

interface SymbolPerformance {
    trades: number;
    wins: number;
    totalPnl: number;
    avgPnl: number;
    lastTraded: number; // cycle
}

export class SymbolSelectionDNA {
    private genome: SymbolGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private symbolPerformance: Record<string, SymbolPerformance> = {};
    private activeSymbols: string[] = [];
    private lastRotation: number = 0;

    constructor(personality?: string, defaultSymbols?: string[]) {
        this.genome = this.createGenesis(personality, defaultSymbols || [
            'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'
        ]);
        this.activeSymbols = Object.keys(this.genome.symbolWeights);
    }

    private createGenesis(personality?: string, symbols?: string[]): SymbolGenome {
        const weights: Record<string, number> = {};
        for (const sym of symbols || []) {
            weights[sym] = 1.0;
        }

        // Personality-based initial preferences
        if (personality === 'ALPHA') {
            weights['BTCUSDT'] = 1.5; // Trend-followers love BTC
            weights['ETHUSDT'] = 1.3;
        }
        if (personality === 'DELTA') {
            weights['SOLUSDT'] = 1.5; // Momentum on high-beta assets
            weights['XRPUSDT'] = 1.3;
        }
        if (personality === 'OMEGA') {
            weights['SOLUSDT'] = 1.4; // Volatility on high-vol assets
            weights['BNBUSDT'] = 1.3;
        }

        return {
            symbolWeights: weights,
            maxActiveSymbols: symbols?.length || 5,
            rotationInterval: 100,
            performanceLookback: 50,
            minTradesForJudgment: 8
        };
    }

    /**
     * Should this symbol be traded? Returns weight (0 = skip, >0 = trade with priority)
     */
    getSymbolWeight(symbol: string): number {
        const weight = this.genome.symbolWeights[symbol];
        if (weight === undefined) return 0.5; // Unknown symbol gets neutral weight

        // If symbol is not in active set, reduce weight
        if (this.activeSymbols.length > 0 && !this.activeSymbols.includes(symbol)) {
            return weight * 0.3;
        }

        return weight;
    }

    /**
     * Get prioritized symbol list
     */
    getActiveSymbols(): string[] {
        return [...this.activeSymbols];
    }

    /**
     * Record trade outcome for symbol
     */
    recordTrade(symbol: string, profitable: boolean, pnlPercent: number, cycle: number): void {
        if (!this.symbolPerformance[symbol]) {
            this.symbolPerformance[symbol] = { trades: 0, wins: 0, totalPnl: 0, avgPnl: 0, lastTraded: 0 };
        }
        const perf = this.symbolPerformance[symbol];
        perf.trades++;
        if (profitable) perf.wins++;
        perf.totalPnl += pnlPercent;
        perf.avgPnl = perf.totalPnl / perf.trades;
        perf.lastTraded = cycle;
    }

    /**
     * Check if it's time to rotate symbols
     */
    maybeRotate(cycle: number): void {
        if (cycle - this.lastRotation < this.genome.rotationInterval) return;
        this.lastRotation = cycle;

        // Rank symbols by performance
        const ranked = Object.entries(this.symbolPerformance)
            .filter(([, perf]) => perf.trades >= this.genome.minTradesForJudgment)
            .sort((a, b) => b[1].avgPnl - a[1].avgPnl);

        if (ranked.length === 0) return;

        // Update weights based on performance
        for (const [symbol, perf] of ranked) {
            const winRate = perf.wins / perf.trades;
            // Good performers get weight boost
            if (winRate > 0.5 && perf.avgPnl > 0) {
                this.genome.symbolWeights[symbol] = Math.min(2.0, (this.genome.symbolWeights[symbol] || 1) * 1.1);
            }
            // Poor performers get weight reduction
            else if (winRate < 0.35 || perf.avgPnl < -0.5) {
                this.genome.symbolWeights[symbol] = Math.max(0.2, (this.genome.symbolWeights[symbol] || 1) * 0.9);
            }
        }

        // Select top N active symbols
        const allSymbols = Object.entries(this.genome.symbolWeights)
            .sort((a, b) => b[1] - a[1]);
        this.activeSymbols = allSymbols
            .slice(0, this.genome.maxActiveSymbols)
            .map(([sym]) => sym);

        // Calculate fitness
        const totalPnl = Object.values(this.symbolPerformance).reduce((s, p) => s + p.totalPnl, 0);
        const totalTrades = Object.values(this.symbolPerformance).reduce((s, p) => s + p.trades, 0);
        this.fitness = totalTrades > 20 ? (totalPnl / totalTrades) * 10 + 50 : 0;
    }

    evolve(partnerGenome?: SymbolGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            for (const sym of Object.keys(g.symbolWeights)) {
                if (Math.random() > 0.5 && partnerGenome.symbolWeights[sym] !== undefined) {
                    g.symbolWeights[sym] = partnerGenome.symbolWeights[sym];
                }
            }
            if (Math.random() > 0.5) g.maxActiveSymbols = partnerGenome.maxActiveSymbols;
        }

        for (const sym of Object.keys(g.symbolWeights)) {
            if (Math.random() < rate) {
                g.symbolWeights[sym] = clamp(g.symbolWeights[sym] + (Math.random() - 0.5) * 0.4, 0.1, 2.0);
            }
        }

        if (Math.random() < rate) g.maxActiveSymbols = Math.max(1, Math.min(Object.keys(g.symbolWeights).length, Math.round(g.maxActiveSymbols + (Math.random() - 0.5) * 2)));
        if (Math.random() < rate) g.rotationInterval = Math.max(50, Math.min(300, Math.round(g.rotationInterval + (Math.random() - 0.5) * 80)));
        if (Math.random() < rate) g.performanceLookback = Math.max(20, Math.min(100, Math.round(g.performanceLookback + (Math.random() - 0.5) * 30)));

        // Decay old performance data (keep 80% - EMA decay)
        for (const perf of Object.values(this.symbolPerformance)) {
            perf.trades = Math.floor(perf.trades * 0.8);
            perf.wins = Math.floor(perf.wins * 0.8);
            perf.totalPnl *= 0.8;
            perf.avgPnl = perf.trades > 0 ? perf.totalPnl / perf.trades : 0;
        }

        // Dead symbol re-testing: periodically boost lowest-weight symbols for exploration
        const symbolEntries = Object.entries(g.symbolWeights);
        const minWeight = Math.min(...symbolEntries.map(([, w]) => w));
        if (minWeight <= 0.3) {
            for (const [sym, weight] of symbolEntries) {
                if (weight <= 0.3 && Math.random() < 0.25) {
                    g.symbolWeights[sym] = 0.6; // Reset to moderate weight for re-evaluation
                }
            }
        }
    }

    getGenome(): SymbolGenome { return JSON.parse(JSON.stringify(this.genome)); }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }
    getSymbolPerformance(): Record<string, SymbolPerformance> { return { ...this.symbolPerformance }; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            symbolPerformance: this.symbolPerformance, activeSymbols: this.activeSymbols,
            lastRotation: this.lastRotation };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        if (data.symbolPerformance) this.symbolPerformance = data.symbolPerformance;
        if (data.activeSymbols) this.activeSymbols = data.activeSymbols;
        this.lastRotation = data.lastRotation || 0;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
