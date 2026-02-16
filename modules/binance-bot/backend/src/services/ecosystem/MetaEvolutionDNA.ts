/**
 * Seed 7: MetaEvolutionDNA - Self-modifying evolution parameters
 * The evolution LEARNS to evolve better. Mutation rates, crossover methods,
 * selection pressure, and evolution intervals all evolve.
 */

export interface MetaGenome {
    // Mutation rate per gene type (0.05-0.30)
    mutationRates: {
        strategyMask: number;
        strategyWeights: number;
        consensus: number;
        risk: number;
        betting: number;
    };
    // Crossover blend ratio (0.3-0.7) - probability of taking from parent1
    crossoverBlend: number;
    // Selection pressure: how much fitness matters in parent selection (1-5)
    // Higher = only top performers breed. Lower = more diversity
    selectionPressure: number;
    // Elitism: percentage of top bots preserved across generations (0.1-0.6)
    elitismRatio: number;
    // Intra-group evolution interval (20-100 cycles)
    evolutionInterval: number;
    // Mutation amplitude: how large mutations are (0.5-2.0, multiplier on default)
    mutationAmplitude: number;
    // Diversity bonus: extra fitness for genomes that are different from others (0-10)
    diversityBonus: number;
}

export class MetaEvolutionDNA {
    private genome: MetaGenome;
    private fitness: number = 0;
    private generation: number = 1;
    private childImprovementRates: number[] = []; // Track: did children outperform parents?

    constructor(personality?: string) {
        this.genome = this.createGenesis(personality);
    }

    private createGenesis(personality?: string): MetaGenome {
        const base: MetaGenome = {
            mutationRates: {
                strategyMask: 0.15,
                strategyWeights: 0.15,
                consensus: 0.15,
                risk: 0.15,
                betting: 0.15
            },
            crossoverBlend: 0.5,
            selectionPressure: 2.0,
            elitismRatio: 0.2,
            evolutionInterval: 50,
            mutationAmplitude: 1.0,
            diversityBonus: 2.0
        };

        if (personality === 'ALPHA') {
            base.mutationRates.risk = 0.10; // Less risk mutation (keep aggressive)
            base.selectionPressure = 3.0; // Strong selection
        }
        if (personality === 'BETA') {
            base.mutationAmplitude = 0.7; // Smaller mutations
            base.evolutionInterval = 70; // Slower evolution
        }
        if (personality === 'GAMMA') {
            base.diversityBonus = 4.0; // Reward diversity more
        }

        return base;
    }

    /**
     * Get mutation rate for a specific gene type
     */
    getMutationRate(geneType: keyof MetaGenome['mutationRates']): number {
        return this.genome.mutationRates[geneType];
    }

    /**
     * Get crossover blend (probability of taking gene from parent1)
     */
    getCrossoverBlend(): number {
        return this.genome.crossoverBlend;
    }

    /**
     * Get evolution interval (cycles between intra-group evolutions)
     */
    getEvolutionInterval(): number {
        return Math.round(this.genome.evolutionInterval);
    }

    /**
     * Get mutation amplitude multiplier
     */
    getMutationAmplitude(): number {
        return this.genome.mutationAmplitude;
    }

    /**
     * Get selection pressure (used in tournament selection)
     */
    getSelectionPressure(): number {
        return this.genome.selectionPressure;
    }

    /**
     * Calculate diversity bonus for a genome vs existing population
     */
    calculateDiversityBonus(genomeStrategyMask: boolean[], populationMasks: boolean[][]): number {
        if (populationMasks.length === 0) return 0;

        let totalDifference = 0;
        for (const mask of populationMasks) {
            let diff = 0;
            for (let i = 0; i < genomeStrategyMask.length; i++) {
                if (genomeStrategyMask[i] !== mask[i]) diff++;
            }
            totalDifference += diff / genomeStrategyMask.length;
        }

        const avgDifference = totalDifference / populationMasks.length;
        return avgDifference * this.genome.diversityBonus;
    }

    /**
     * Record whether a child outperformed its parents
     */
    recordChildPerformance(childFitness: number, parentAvgFitness: number): void {
        const improvement = parentAvgFitness > 0
            ? (childFitness - parentAvgFitness) / parentAvgFitness
            : childFitness > 0 ? 1 : 0;
        this.childImprovementRates.push(improvement);
        if (this.childImprovementRates.length > 50) {
            this.childImprovementRates = this.childImprovementRates.slice(-50);
        }

        // Fitness = average improvement rate of offspring (NaN guard)
        const len = this.childImprovementRates.length;
        const avg = len > 0 ? this.childImprovementRates.reduce((s, r) => s + r, 0) / len : 0;
        this.fitness = isFinite(avg) ? (avg + 1) * 50 : 50; // Normalize: 0 improvement = 50, positive = >50
    }

    evolve(): void {
        this.generation++;
        const g = this.genome;
        const rate = 0.20; // Meta-evolution has slightly higher base mutation

        // Use child improvement data to guide: if children aren't improving, try something different
        const avgImprovement = this.childImprovementRates.length > 0
            ? this.childImprovementRates.reduce((s, r) => s + r, 0) / this.childImprovementRates.length : 0;

        // If children aren't improving, increase mutation rates
        const adjustmentBias = avgImprovement < 0 ? 0.03 : -0.01;

        for (const key of Object.keys(g.mutationRates) as (keyof MetaGenome['mutationRates'])[]) {
            if (Math.random() < rate) {
                g.mutationRates[key] = clamp(g.mutationRates[key] + (Math.random() - 0.5) * 0.08 + adjustmentBias, 0.05, 0.30);
            }
            // Floor bounce-back: prevent rates from getting stuck at minimum
            if (g.mutationRates[key] <= 0.06 && Math.random() < 0.3) {
                g.mutationRates[key] = 0.10 + Math.random() * 0.05; // Jump back to 0.10-0.15
            }
        }

        if (Math.random() < rate) g.crossoverBlend = clamp(g.crossoverBlend + (Math.random() - 0.5) * 0.15, 0.3, 0.7);
        if (Math.random() < rate) g.selectionPressure = clamp(g.selectionPressure + (Math.random() - 0.5) * 1.0, 1, 5);
        if (Math.random() < rate) g.elitismRatio = clamp(g.elitismRatio + (Math.random() - 0.5) * 0.15, 0.1, 0.6);
        if (Math.random() < rate) g.evolutionInterval = clamp(g.evolutionInterval + (Math.random() - 0.5) * 30, 20, 100);
        if (Math.random() < rate) g.mutationAmplitude = clamp(g.mutationAmplitude + (Math.random() - 0.5) * 0.4, 0.5, 2.0);
        if (Math.random() < rate) g.diversityBonus = clamp(g.diversityBonus + (Math.random() - 0.5) * 2, 0, 10);

        this.childImprovementRates = this.childImprovementRates.slice(-25); // Keep half as memory
    }

    /**
     * Boost mutation rates by a factor (applied directly to internal genome)
     */
    boostMutationRates(factor: number): void {
        for (const key of Object.keys(this.genome.mutationRates) as (keyof MetaGenome['mutationRates'])[]) {
            this.genome.mutationRates[key] = clamp(this.genome.mutationRates[key] * factor, 0.05, 0.30);
        }
        this.genome.mutationAmplitude = clamp(this.genome.mutationAmplitude * factor, 0.5, 2.0);
    }

    getGenome(): MetaGenome { return JSON.parse(JSON.stringify(this.genome)); }
    getFitness(): number { return this.fitness; }
    getGeneration(): number { return this.generation; }

    serialize(): any {
        return { genome: this.genome, fitness: this.fitness, generation: this.generation,
            childImprovementRates: this.childImprovementRates };
    }

    restore(data: any): void {
        if (data.genome) this.genome = data.genome;
        this.fitness = data.fitness || 0;
        this.generation = data.generation || 1;
        if (data.childImprovementRates) this.childImprovementRates = data.childImprovementRates;
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
