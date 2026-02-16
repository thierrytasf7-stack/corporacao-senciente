/**
 * Seed 0: EvolutionRegistry - Track evolution across ALL dimensions
 * Records snapshots for every seed, enabling cross-dimensional analysis.
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const REGISTRY_FILE = path.join(DATA_DIR, 'evolution-registry.json');
const MAX_SNAPSHOTS_PER_DIMENSION = 200;

export interface EvolutionSnapshot {
    dimension: string;
    cycle: number;
    generation: number;
    fitness: number;
    bestGenomeHash: string;
    metadata: Record<string, any>;
    timestamp: string;
}

export interface DimensionSummary {
    dimension: string;
    totalSnapshots: number;
    currentGeneration: number;
    currentFitness: number;
    bestFitness: number;
    fitnessHistory: number[]; // last 50
    trend: 'improving' | 'stagnant' | 'declining';
}

export class EvolutionRegistry {
    private snapshots: Record<string, EvolutionSnapshot[]> = {};

    constructor() {
        this.load();
    }

    record(dimension: string, snapshot: Omit<EvolutionSnapshot, 'dimension' | 'timestamp'>): void {
        if (!this.snapshots[dimension]) this.snapshots[dimension] = [];
        this.snapshots[dimension].push({
            ...snapshot,
            dimension,
            timestamp: new Date().toISOString()
        });
        if (this.snapshots[dimension].length > MAX_SNAPSHOTS_PER_DIMENSION) {
            this.snapshots[dimension] = this.snapshots[dimension].slice(-MAX_SNAPSHOTS_PER_DIMENSION);
        }
    }

    getDimensionSummary(dimension: string): DimensionSummary | null {
        const snaps = this.snapshots[dimension];
        if (!snaps || snaps.length === 0) return null;

        const recent = snaps.slice(-50);
        const fitnessHistory = recent.map(s => s.fitness);
        const currentFitness = fitnessHistory[fitnessHistory.length - 1];
        const bestFitness = Math.max(...fitnessHistory);

        // Trend: compare last 10 avg vs first 10 avg
        let trend: 'improving' | 'stagnant' | 'declining' = 'stagnant';
        if (fitnessHistory.length >= 10) {
            const firstHalf = fitnessHistory.slice(0, Math.floor(fitnessHistory.length / 2));
            const secondHalf = fitnessHistory.slice(Math.floor(fitnessHistory.length / 2));
            const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
            const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
            if (avgSecond > avgFirst * 1.05) trend = 'improving';
            else if (avgSecond < avgFirst * 0.95) trend = 'declining';
        }

        const last = snaps[snaps.length - 1];
        return {
            dimension,
            totalSnapshots: snaps.length,
            currentGeneration: last.generation,
            currentFitness,
            bestFitness,
            fitnessHistory,
            trend
        };
    }

    getAllDimensions(): string[] {
        return Object.keys(this.snapshots);
    }

    getFullStatus(): Record<string, DimensionSummary> {
        const result: Record<string, DimensionSummary> = {};
        for (const dim of this.getAllDimensions()) {
            const summary = this.getDimensionSummary(dim);
            if (summary) result[dim] = summary;
        }
        return result;
    }

    getDimensionHistory(dimension: string, limit: number = 50): EvolutionSnapshot[] {
        return (this.snapshots[dimension] || []).slice(-limit);
    }

    persist(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.snapshots, null, 2));
        } catch (err) {
            console.error('⚠️ EvolutionRegistry persist failed:', err instanceof Error ? err.message : err);
        }
    }

    reset(): void {
        this.snapshots = {};
    }

    private load(): void {
        try {
            if (fs.existsSync(REGISTRY_FILE)) {
                this.snapshots = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
            }
        } catch { /* start fresh */ }
    }
}
