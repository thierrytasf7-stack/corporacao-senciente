/**
 * DNAVectorMemory - Vectorized learning memory for DNA genome performance
 * Records experiences as feature vectors, guides future mutations toward
 * successful patterns and away from failed ones.
 */

import * as fs from 'fs';
import * as path from 'path';
import { GenomeV2 } from '../DNAArenaV2Engine';

const STRATEGY_COUNT = 30;
const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const MEMORY_FILE = path.join(DATA_DIR, 'dna-memory.json');
const MAX_EXPERIENCES = 500;

export interface DNAExperience {
    genomeHash: string;
    strategyMask: boolean[];
    strategyWeights: number[];
    consensusParams: number[];   // [minAgreeing, maxOpposing, minStrength]
    riskParams: number[];        // [atrTP, atrSL, trailingATR, leverage]
    bettingParams: number[];     // [basePercent, winMult, lossMult]

    // Results
    fitness: number;
    bankrollMultiplier: number;
    winRate: number;
    sharpeRatio: number;
    trades: number;
    survived: boolean;
    reachedMilestone: number;    // 0, 2, 3, 5, 10
    groupId: string;
    timestamp: string;
}

export interface TopPattern {
    pattern: string;
    avgFitness: number;
    count: number;
    avgMultiplier: number;
    survivalRate: number;
}

export class DNAVectorMemory {
    private experiences: DNAExperience[] = [];

    constructor() {
        this.load();
    }

    /**
     * Extract feature vector from genome
     */
    private genomeToVector(genome: GenomeV2): {
        strategyMask: boolean[];
        strategyWeights: number[];
        consensusParams: number[];
        riskParams: number[];
        bettingParams: number[];
    } {
        return {
            strategyMask: genome.strategyMask.slice(0, STRATEGY_COUNT),
            strategyWeights: genome.strategyWeights.slice(0, STRATEGY_COUNT),
            consensusParams: [
                genome.consensus.minAgreeingSignals,
                genome.consensus.maxOpposingSignals,
                genome.consensus.minWeightedStrength
            ],
            riskParams: [
                genome.risk.atrMultiplierTP,
                genome.risk.atrMultiplierSL,
                genome.risk.trailingStopATR,
                genome.risk.leverage
            ],
            bettingParams: [
                genome.betting.basePercent,
                genome.betting.winMultiplier,
                genome.betting.lossMultiplier
            ]
        };
    }

    /**
     * Hash genome for deduplication
     */
    private hashGenome(genome: GenomeV2): string {
        const mask = genome.strategyMask.map(b => b ? '1' : '0').join('');
        const cons = `${genome.consensus.minAgreeingSignals}-${genome.consensus.maxOpposingSignals}`;
        const risk = `${genome.risk.leverage}-${genome.risk.atrMultiplierTP.toFixed(1)}`;
        return `${mask.substring(0, 10)}_${cons}_${risk}`;
    }

    /**
     * Record a genome's performance after it dies, reaches goal, or evolves out
     */
    recordExperience(
        genome: GenomeV2,
        botState: { bankroll: number; initialBankroll: number; totalTrades: number; wins: number; pnlHistory: number[] },
        fitness: number,
        survived: boolean,
        milestoneReached: number,
        groupId: string
    ): void {
        const vector = this.genomeToVector(genome);
        const winRate = botState.totalTrades > 0 ? botState.wins / botState.totalTrades : 0;
        const sharpe = this.calcSharpe(botState.pnlHistory);

        const experience: DNAExperience = {
            genomeHash: this.hashGenome(genome),
            ...vector,
            fitness,
            bankrollMultiplier: botState.bankroll / botState.initialBankroll,
            winRate,
            sharpeRatio: sharpe,
            trades: botState.totalTrades,
            survived,
            reachedMilestone: milestoneReached,
            groupId,
            timestamp: new Date().toISOString()
        };

        this.experiences.push(experience);

        // Keep only top MAX_EXPERIENCES by fitness
        if (this.experiences.length > MAX_EXPERIENCES * 1.2) {
            this.experiences.sort((a, b) => b.fitness - a.fitness);
            this.experiences = this.experiences.slice(0, MAX_EXPERIENCES);
        }
    }

    /**
     * Cosine similarity between two number arrays
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length || a.length === 0) return 0;
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        const denom = Math.sqrt(magA) * Math.sqrt(magB);
        return denom === 0 ? 0 : dot / denom;
    }

    /**
     * Guide mutation: bias child genome toward successful patterns
     * Returns adjusted genome with informed bias
     */
    guideMutation(childGenome: GenomeV2): GenomeV2 {
        if (this.experiences.length < 10) return childGenome; // Not enough data

        const childVector = this.genomeToVector(childGenome);
        const childRiskVec = childVector.riskParams;

        // Find similar experiences (by risk + consensus params)
        const scored = this.experiences.map(exp => ({
            exp,
            similarity: this.cosineSimilarity(
                [...childRiskVec, ...childVector.consensusParams],
                [...exp.riskParams, ...exp.consensusParams]
            )
        }));

        // Get top 10 most similar
        scored.sort((a, b) => b.similarity - a.similarity);
        const similar = scored.slice(0, 10);

        // Separate good vs bad experiences
        const good = similar.filter(s => s.exp.fitness > 30 && s.exp.survived);
        const bad = similar.filter(s => s.exp.fitness < 10 || !s.exp.survived);

        const adjusted: GenomeV2 = JSON.parse(JSON.stringify(childGenome));

        // If we have good patterns, bias toward their averages
        if (good.length >= 3) {
            const avgLeverage = good.reduce((s, g) => s + g.exp.riskParams[3], 0) / good.length;
            const avgTP = good.reduce((s, g) => s + g.exp.riskParams[0], 0) / good.length;
            const avgSL = good.reduce((s, g) => s + g.exp.riskParams[1], 0) / good.length;
            const avgMinSignals = good.reduce((s, g) => s + g.exp.consensusParams[0], 0) / good.length;

            // Blend 30% toward good patterns
            adjusted.risk.leverage = Math.round(adjusted.risk.leverage * 0.7 + avgLeverage * 0.3);
            adjusted.risk.atrMultiplierTP = adjusted.risk.atrMultiplierTP * 0.7 + avgTP * 0.3;
            adjusted.risk.atrMultiplierSL = adjusted.risk.atrMultiplierSL * 0.7 + avgSL * 0.3;
            adjusted.consensus.minAgreeingSignals = Math.round(
                adjusted.consensus.minAgreeingSignals * 0.7 + avgMinSignals * 0.3
            );

            // Bias strategy mask toward successful patterns
            for (let i = 0; i < STRATEGY_COUNT; i++) {
                const goodUseRate = good.filter(g => g.exp.strategyMask[i]).length / good.length;
                if (goodUseRate > 0.7 && !adjusted.strategyMask[i]) {
                    // Good pattern uses this strategy often - 40% chance to enable
                    if (Math.random() < 0.4) adjusted.strategyMask[i] = true;
                }
            }
        }

        // If bad patterns are dominant, push away
        if (bad.length >= 3 && good.length < 2) {
            const avgBadLeverage = bad.reduce((s, b) => s + b.exp.riskParams[3], 0) / bad.length;
            // If child leverage is similar to bad, reduce it
            if (Math.abs(adjusted.risk.leverage - avgBadLeverage) < 10) {
                adjusted.risk.leverage = Math.max(5, adjusted.risk.leverage - 5);
            }
        }

        // Clamp values
        adjusted.risk.leverage = Math.max(5, Math.min(75, adjusted.risk.leverage));
        adjusted.risk.atrMultiplierTP = Math.max(1.0, Math.min(5.0, adjusted.risk.atrMultiplierTP));
        adjusted.risk.atrMultiplierSL = Math.max(0.5, Math.min(3.0, adjusted.risk.atrMultiplierSL));
        adjusted.consensus.minAgreeingSignals = Math.max(2, Math.min(15, adjusted.consensus.minAgreeingSignals));

        return adjusted;
    }

    /**
     * Get top performing patterns for analytics
     */
    getTopPatterns(): TopPattern[] {
        if (this.experiences.length < 5) return [];

        // Group by strategy mask pattern (simplified to active count + leverage range)
        const groups: Record<string, DNAExperience[]> = {};
        for (const exp of this.experiences) {
            const activeCount = exp.strategyMask.filter(b => b).length;
            const leverageBucket = Math.round(exp.riskParams[3] / 10) * 10;
            const key = `strats:${activeCount}_lev:${leverageBucket}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(exp);
        }

        return Object.entries(groups)
            .filter(([, exps]) => exps.length >= 3)
            .map(([pattern, exps]) => ({
                pattern,
                avgFitness: exps.reduce((s, e) => s + e.fitness, 0) / exps.length,
                count: exps.length,
                avgMultiplier: exps.reduce((s, e) => s + e.bankrollMultiplier, 0) / exps.length,
                survivalRate: exps.filter(e => e.survived).length / exps.length
            }))
            .sort((a, b) => b.avgFitness - a.avgFitness)
            .slice(0, 10);
    }

    getExperiences(): DNAExperience[] {
        return this.experiences;
    }

    getStats(): { total: number; avgFitness: number; bestMultiplier: number; survivalRate: number } {
        if (this.experiences.length === 0) return { total: 0, avgFitness: 0, bestMultiplier: 0, survivalRate: 0 };
        return {
            total: this.experiences.length,
            avgFitness: this.experiences.reduce((s, e) => s + e.fitness, 0) / this.experiences.length,
            bestMultiplier: Math.max(...this.experiences.map(e => e.bankrollMultiplier)),
            survivalRate: this.experiences.filter(e => e.survived).length / this.experiences.length
        };
    }

    persist(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(MEMORY_FILE, JSON.stringify({ experiences: this.experiences }, null, 2));
        } catch { /* silent */ }
    }

    reset(): void {
        this.experiences = [];
    }

    private load(): void {
        try {
            if (fs.existsSync(MEMORY_FILE)) {
                const data = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
                this.experiences = data.experiences || [];
            }
        } catch { /* start fresh */ }
    }

    private calcSharpe(pnlHistory: number[]): number {
        if (pnlHistory.length < 5) return 0;
        const mean = pnlHistory.reduce((a, b) => a + b, 0) / pnlHistory.length;
        const variance = pnlHistory.reduce((sum, pnl) => sum + Math.pow(pnl - mean, 2), 0) / pnlHistory.length;
        const stdDev = Math.sqrt(variance);
        if (stdDev === 0) return mean > 0 ? 3 : 0;
        return Math.max(-2, Math.min(5, mean / stdDev));
    }
}
