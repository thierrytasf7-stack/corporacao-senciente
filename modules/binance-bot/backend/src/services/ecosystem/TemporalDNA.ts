/**
 * Seed 3: TemporalDNA - Learn WHEN to trade
 * Evolves a 24-hour activity mask and session weights.
 * Filters trades during historically unprofitable time windows.
 */

export interface TemporalGenome {
    // 24-hour activity mask (UTC). true = allowed to trade
    hourMask: boolean[];
    // Day of week weights (0=Sunday, 6=Saturday). 0-2 multiplier
    dayWeights: number[];
    // Trading session weights
    sessionWeights: { asian: number; european: number; us: number };
    // Minimum combined weight to allow trading (0.3-1.5)
    minActivityThreshold: number;
}

interface HourPerformance {
    trades: number;
    wins: number;
    totalPnl: number;
}

export class TemporalDNA {
    private genome: TemporalGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private hourPerformance: HourPerformance[] = Array.from({ length: 24 }, () => ({ trades: 0, wins: 0, totalPnl: 0 }));
    private dayPerformance: HourPerformance[] = Array.from({ length: 7 }, () => ({ trades: 0, wins: 0, totalPnl: 0 }));

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
    }

    private createGenesis(personality?: string): TemporalGenome {
        // Start with all hours active - evolution will learn which to avoid
        const hourMask = Array(24).fill(true);

        const base: TemporalGenome = {
            hourMask,
            dayWeights: [0.7, 1.0, 1.0, 1.0, 1.0, 1.0, 0.8], // Sun slightly less, Sat less
            sessionWeights: { asian: 0.9, european: 1.1, us: 1.2 },
            minActivityThreshold: 0.5
        };

        // Personality: some groups prefer certain sessions
        if (personality === 'ALPHA') { base.sessionWeights.us = 1.5; } // High volatility US
        if (personality === 'BETA') { base.sessionWeights.european = 1.3; base.sessionWeights.asian = 1.2; } // Calmer sessions
        if (personality === 'OMEGA') { base.sessionWeights.us = 1.4; base.sessionWeights.asian = 0.7; } // Volatility lover

        return base;
    }

    /**
     * Should we trade right now? Returns activity weight (0 = don't trade, >0 = trade with weight)
     */
    getActivityWeight(): number {
        const now = new Date();
        const hour = now.getUTCHours();
        const day = now.getUTCDay();

        // Hour mask check
        if (!this.genome.hourMask[hour]) return 0;

        // Day weight
        const dayWeight = this.genome.dayWeights[day];

        // Session weight (handle overlapping sessions with max)
        let sessionWeight = 1.0;
        const sessions: number[] = [];
        if (hour >= 0 && hour < 9) sessions.push(this.genome.sessionWeights.asian);
        if (hour >= 7 && hour < 16) sessions.push(this.genome.sessionWeights.european);
        if (hour >= 13 && hour < 22) sessions.push(this.genome.sessionWeights.us);
        if (hour >= 22) sessions.push(this.genome.sessionWeights.asian); // Pre-Asian
        if (sessions.length > 0) sessionWeight = Math.max(...sessions);

        const combined = dayWeight * sessionWeight;
        return combined >= this.genome.minActivityThreshold ? combined : 0;
    }

    /**
     * Record trade outcome for temporal learning
     */
    recordTrade(profitable: boolean, pnlPercent: number): void {
        const now = new Date();
        const hour = now.getUTCHours();
        const day = now.getUTCDay();

        this.hourPerformance[hour].trades++;
        this.dayPerformance[day].trades++;

        if (profitable) {
            this.hourPerformance[hour].wins++;
            this.dayPerformance[day].wins++;
        }
        this.hourPerformance[hour].totalPnl += pnlPercent;
        this.dayPerformance[day].totalPnl += pnlPercent;

        // Fitness = weighted average of active-hour profitability
        this.calculateFitness();
    }

    private calculateFitness(): void {
        let activePnl = 0, inactivePnl = 0, activeCount = 0, inactiveCount = 0;

        for (let h = 0; h < 24; h++) {
            if (this.genome.hourMask[h]) {
                activePnl += this.hourPerformance[h].totalPnl;
                activeCount += this.hourPerformance[h].trades;
            } else {
                inactivePnl += this.hourPerformance[h].totalPnl;
                inactiveCount += this.hourPerformance[h].trades;
            }
        }

        // Fitness: active hours profitable, inactive hours would have been unprofitable
        const activeAvg = activeCount > 0 ? activePnl / activeCount : 0;
        const totalTrades = activeCount + inactiveCount;
        this.fitness = totalTrades > 20 ? activeAvg * 10 + 50 : 0; // Normalize around 50
    }

    evolve(partnerGenome?: TemporalGenome): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.15;

        if (partnerGenome) {
            for (let h = 0; h < 24; h++) {
                if (Math.random() > 0.5) g.hourMask[h] = partnerGenome.hourMask[h];
            }
            for (let d = 0; d < 7; d++) {
                if (Math.random() > 0.5) g.dayWeights[d] = partnerGenome.dayWeights[d];
            }
        }

        // Use performance data to guide evolution
        for (let h = 0; h < 24; h++) {
            if (Math.random() < rate) {
                // If we have data, use it to guide mutation
                const perf = this.hourPerformance[h];
                if (perf.trades > 10) {
                    const winRate = perf.wins / perf.trades;
                    // Bad hours more likely to be turned off
                    if (winRate < 0.35 && Math.random() < 0.4) g.hourMask[h] = false;
                    else if (winRate > 0.55 && Math.random() < 0.4) g.hourMask[h] = true;
                    else g.hourMask[h] = !g.hourMask[h]; // Random flip
                } else {
                    g.hourMask[h] = !g.hourMask[h];
                }
            }
        }

        // Ensure at least 12 hours active
        const activeHours = g.hourMask.filter(m => m).length;
        if (activeHours < 12) {
            const inactive = g.hourMask.map((m, i) => m ? -1 : i).filter(i => i >= 0);
            for (let i = 0; i < 12 - activeHours && i < inactive.length; i++) {
                g.hourMask[inactive[Math.floor(Math.random() * inactive.length)]] = true;
            }
        }

        for (let d = 0; d < 7; d++) {
            if (Math.random() < rate) g.dayWeights[d] = clamp(g.dayWeights[d] + (Math.random() - 0.5) * 0.4, 0.3, 2.0);
        }

        if (Math.random() < rate) g.sessionWeights.asian = clamp(g.sessionWeights.asian + (Math.random() - 0.5) * 0.3, 0.3, 2.0);
        if (Math.random() < rate) g.sessionWeights.european = clamp(g.sessionWeights.european + (Math.random() - 0.5) * 0.3, 0.3, 2.0);
        if (Math.random() < rate) g.sessionWeights.us = clamp(g.sessionWeights.us + (Math.random() - 0.5) * 0.3, 0.3, 2.0);
        if (Math.random() < rate) g.minActivityThreshold = clamp(g.minActivityThreshold + (Math.random() - 0.5) * 0.3, 0.3, 1.5);

        // Don't reset performance entirely - carry forward 50% as memory
        for (let h = 0; h < 24; h++) {
            this.hourPerformance[h].trades = Math.floor(this.hourPerformance[h].trades * 0.5);
            this.hourPerformance[h].wins = Math.floor(this.hourPerformance[h].wins * 0.5);
            this.hourPerformance[h].totalPnl *= 0.5;
        }
    }

    getGenome(): TemporalGenome { return JSON.parse(JSON.stringify(this.genome)); }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }
    getHourPerformance(): HourPerformance[] { return [...this.hourPerformance]; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            hourPerformance: this.hourPerformance, dayPerformance: this.dayPerformance };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        if (data.hourPerformance) this.hourPerformance = data.hourPerformance;
        if (data.dayPerformance) this.dayPerformance = data.dayPerformance;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
