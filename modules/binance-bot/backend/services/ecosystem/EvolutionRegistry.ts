// Add to existing imports
import * as fs from 'fs';
import * as path from 'path';

// Add to existing constants
const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const REGISTRY_FILE = path.join(DATA_DIR, 'evolution-registry.json');
const MAX_SNAPSHOTS_PER_DIMENSION = 200;

// Add to existing interface
export interface EvolutionSnapshot {
    dimension: string;
    cycle: number;
    generation: number;
    fitness: number;
    bestGenomeHash: string;
    metadata: Record<string, any>;
    timestamp: string;
}

// Add to existing class
export class EvolutionRegistry {
    private snapshots: Record<string, EvolutionSnapshot[]> = {};

    constructor() {
        this.load();
    }

    /**
     * Record evolution snapshot
     */
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

    /**
     * Inject a genome into a specific dimension
     */
    injectGenome(genome: any, options: {
        dimension: string;
        generation: number;
        metadata?: Record<string, any>;
    }): void {
        const snapshot: EvolutionSnapshot = {
            dimension: options.dimension,
            cycle: 0,
            generation: options.generation,
            fitness: 0,
            bestGenomeHash: this.hashGenome(genome),
            metadata: {
                injected: true,
                source: 'manual-injection',
                ...options.metadata
            },
            timestamp: new Date().toISOString()
        };

        this.record(options.dimension, snapshot);
        this.save();
    }

    // ... rest of existing methods ...

    /**
     * Hash genome for deduplication
     */
    private hashGenome(genome: any): string {
        const mask = genome.strategyMask ? genome.strategyMask.map(b => b ? '1' : '0').join('') : '';
        const cons = genome.consensus ? `${genome.consensus.minAgreeingSignals}-${genome.consensus.maxOpposingSignals}` : '';
        const risk = genome.risk ? `${genome.risk.leverage}-${genome.risk.atrMultiplierTP.toFixed(1)}` : '';
        return `${mask.substring(0, 10)}_${cons}_${risk}`;
    }

    /**
     * Save registry to file
     */
    private save(): void {
        try {
            fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.snapshots, null, 2));
        } catch (error) {
            console.error('Error saving evolution registry:', error);
        }
    }

    /**
     * Load registry from file
     */
    private load(): void {
        try {
            if (fs.existsSync(REGISTRY_FILE)) {
                const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
                this.snapshots = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading evolution registry:', error);
        }
    }
}