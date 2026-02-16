/**
 * AdaptiveMutationEngine - Advanced mutation system with multiple intensities
 * and death-triggered adaptive exploration to prevent evolutionary stagnation.
 *
 * CEO-BINANCE Directive: Garantir exploração evolutiva saudável com mutações
 * de intensidades e direções variadas.
 */

import { logger } from '../../utils/logger';

export enum MutationType {
    SUBTLE = 'SUBTLE',     // 0.3x - Pequenos ajustes conservadores
    NORMAL = 'NORMAL',     // 1.0x - Mutação padrão
    BOLD = 'BOLD',         // 2.0x - Exploração moderada
    RADICAL = 'RADICAL'    // 4.0x - Exploração agressiva
}

export enum MutationDirection {
    CONSERVATIVE = 'CONSERVATIVE',  // Preserva características + pequenos ajustes
    BALANCED = 'BALANCED',          // Mix de preservação e exploração
    EXPLORATORY = 'EXPLORATORY'     // Grandes saltos, busca por novas soluções
}

interface MutationProfile {
    type: MutationType;
    direction: MutationDirection;
    amplitudeMultiplier: number;
    rateMultiplier: number;
    description: string;
}

const MUTATION_PROFILES: Record<MutationType, MutationProfile> = {
    [MutationType.SUBTLE]: {
        type: MutationType.SUBTLE,
        direction: MutationDirection.CONSERVATIVE,
        amplitudeMultiplier: 0.3,
        rateMultiplier: 0.5,
        description: 'Fine-tuning - Small adjustments to existing traits'
    },
    [MutationType.NORMAL]: {
        type: MutationType.NORMAL,
        direction: MutationDirection.BALANCED,
        amplitudeMultiplier: 1.0,
        rateMultiplier: 1.0,
        description: 'Standard evolution - Balanced exploration/exploitation'
    },
    [MutationType.BOLD]: {
        type: MutationType.BOLD,
        direction: MutationDirection.BALANCED,
        amplitudeMultiplier: 2.0,
        rateMultiplier: 1.5,
        description: 'Bold exploration - Moderate jumps in trait space'
    },
    [MutationType.RADICAL]: {
        type: MutationType.RADICAL,
        direction: MutationDirection.EXPLORATORY,
        amplitudeMultiplier: 4.0,
        rateMultiplier: 2.5,
        description: 'Radical exploration - Large jumps, break from local optima'
    }
};

export interface DeathTriggerState {
    totalDeaths: number;
    consecutiveDeaths: number;
    deathsSinceLastEvolution: number;
    lastDeathCycle: number;
    lastEvolutionCycle: number;
    stagnationCycles: number; // Cycles without fitness improvement
    lastBestFitness: number; // QA Fix #3 - Persist for stagnation tracking
}

export interface MutationEvent {
    timestamp: string;
    type: 'DEATH_BOOST' | 'RECENT_DEATHS' | 'STAGNATION' | 'BOT_DEATH';
    groupId?: string;
    details: any;
}

export type MutationEventCallback = (event: MutationEvent) => void;

export class AdaptiveMutationEngine {
    private deathState: DeathTriggerState = {
        totalDeaths: 0,
        consecutiveDeaths: 0,
        deathsSinceLastEvolution: 0,
        lastDeathCycle: 0,
        lastEvolutionCycle: 0,
        stagnationCycles: 0,
        lastBestFitness: 0 // QA Fix #3
    };

    private readonly STAGNATION_THRESHOLD = 100; // Cycles without improvement = stagnation
    private readonly DEATH_BOOST_THRESHOLD = 3; // Deaths to trigger mutation boost
    private onMutationEvent?: MutationEventCallback;
    private groupId?: string;

    constructor(groupId?: string, onMutationEvent?: MutationEventCallback) {
        this.groupId = groupId;
        this.onMutationEvent = onMutationEvent;
    }

    /**
     * Select mutation type based on current evolutionary state
     */
    selectMutationType(currentCycle: number, groupBestFitness: number): MutationType {
        this.updateStagnationState(groupBestFitness);

        // Death-triggered mutation boost
        if (this.deathState.consecutiveDeaths >= this.DEATH_BOOST_THRESHOLD) {
            logger.info(`🔴 DEATH BOOST: ${this.deathState.consecutiveDeaths} consecutive deaths → RADICAL mutation`, {
                type: 'ADAPTIVE_MUTATION',
                event: 'DEATH_BOOST',
                consecutiveDeaths: this.deathState.consecutiveDeaths,
                mutationType: MutationType.RADICAL
            });
            this.emitMutationEvent('DEATH_BOOST', {
                consecutiveDeaths: this.deathState.consecutiveDeaths,
                mutationType: MutationType.RADICAL,
                currentCycle
            });
            return MutationType.RADICAL;
        }

        if (this.deathState.deathsSinceLastEvolution >= 2) {
            logger.info(`🟠 Recent deaths (${this.deathState.deathsSinceLastEvolution}) → BOLD mutation`, {
                type: 'ADAPTIVE_MUTATION',
                event: 'RECENT_DEATHS',
                deathsSinceEvolution: this.deathState.deathsSinceLastEvolution,
                mutationType: MutationType.BOLD
            });
            this.emitMutationEvent('RECENT_DEATHS', {
                deathsSinceEvolution: this.deathState.deathsSinceLastEvolution,
                mutationType: MutationType.BOLD,
                currentCycle
            });
            return MutationType.BOLD;
        }

        // Stagnation-triggered exploration
        if (this.deathState.stagnationCycles >= this.STAGNATION_THRESHOLD) {
            logger.info(`⚠️ STAGNATION detected (${this.deathState.stagnationCycles} cycles) → RADICAL mutation`, {
                type: 'ADAPTIVE_MUTATION',
                event: 'STAGNATION',
                stagnationCycles: this.deathState.stagnationCycles,
                mutationType: MutationType.RADICAL
            });
            this.emitMutationEvent('STAGNATION', {
                stagnationCycles: this.deathState.stagnationCycles,
                mutationType: MutationType.RADICAL,
                currentCycle
            });
            // QA Fix #2: Partial reset - give radical mutation time to take effect
            this.deathState.stagnationCycles = Math.floor(this.STAGNATION_THRESHOLD * 0.3); // 30 cycles
            return MutationType.RADICAL;
        }

        if (this.deathState.stagnationCycles >= this.STAGNATION_THRESHOLD * 0.6) {
            return MutationType.BOLD;
        }

        // Probabilistic selection for normal evolution
        const rand = Math.random();
        if (rand < 0.10) return MutationType.SUBTLE;      // 10%
        if (rand < 0.70) return MutationType.NORMAL;      // 60%
        if (rand < 0.95) return MutationType.BOLD;        // 25%
        return MutationType.RADICAL;                      // 5%
    }

    /**
     * Get mutation parameters for a given type
     */
    getMutationProfile(type: MutationType): MutationProfile {
        return { ...MUTATION_PROFILES[type] };
    }

    /**
     * Record bot death event
     */
    recordDeath(currentCycle: number): void {
        this.deathState.totalDeaths++;
        this.deathState.deathsSinceLastEvolution++;

        // Track consecutive deaths (reset if gap > 50 cycles)
        const gap = currentCycle - this.deathState.lastDeathCycle;

        // Handle first death case
        if (this.deathState.lastDeathCycle === 0) {
            // First death ever
            this.deathState.consecutiveDeaths = 1;
        } else if (gap < 50) {
            // Deaths within 50 cycles = consecutive
            this.deathState.consecutiveDeaths++;
        } else {
            // Gap >= 50 cycles = reset streak
            this.deathState.consecutiveDeaths = 1;
        }

        // Update AFTER calculation (QA Fix #1)
        this.deathState.lastDeathCycle = currentCycle;

        this.emitMutationEvent('BOT_DEATH', {
            totalDeaths: this.deathState.totalDeaths,
            consecutiveDeaths: this.deathState.consecutiveDeaths,
            gap,
            deathsSinceEvolution: this.deathState.deathsSinceLastEvolution,
            currentCycle
        });

        logger.info(`💀 Bot death recorded | Total: ${this.deathState.totalDeaths} | Consecutive: ${this.deathState.consecutiveDeaths} | Gap: ${gap} cycles | Since last evolution: ${this.deathState.deathsSinceLastEvolution}`, {
            type: 'ADAPTIVE_MUTATION',
            event: 'BOT_DEATH',
            totalDeaths: this.deathState.totalDeaths,
            consecutiveDeaths: this.deathState.consecutiveDeaths,
            gap,
            deathsSinceEvolution: this.deathState.deathsSinceLastEvolution
        });
    }

    /**
     * Record evolution event (resets death counters)
     */
    recordEvolution(currentCycle: number): void {
        this.deathState.lastEvolutionCycle = currentCycle;
        this.deathState.deathsSinceLastEvolution = 0;
        this.deathState.consecutiveDeaths = 0; // Evolution is a "fresh start"
    }

    /**
     * Update stagnation tracking
     */
    private updateStagnationState(currentBestFitness: number): void {
        const improvementThreshold = 0.01; // 1% improvement required
        const improvement = this.deathState.lastBestFitness > 0
            ? (currentBestFitness - this.deathState.lastBestFitness) / this.deathState.lastBestFitness
            : currentBestFitness > 0 ? 1 : 0;

        if (improvement > improvementThreshold) {
            this.deathState.stagnationCycles = 0; // Reset stagnation
            this.deathState.lastBestFitness = currentBestFitness; // QA Fix #3
        } else {
            this.deathState.stagnationCycles++;
        }
    }

    /**
     * Apply directional bias to mutation
     * Conservative: preserve more traits, smaller changes
     * Exploratory: flip more bits, larger jumps
     */
    applyDirectionalBias(
        baseValue: number,
        min: number,
        max: number,
        direction: MutationDirection,
        amplitude: number
    ): number {
        switch (direction) {
            case MutationDirection.CONSERVATIVE:
                // Small adjustments around current value
                const conservativeDelta = (Math.random() - 0.5) * (max - min) * 0.05 * amplitude;
                return clamp(baseValue + conservativeDelta, min, max);

            case MutationDirection.BALANCED:
                // Standard random walk
                const balancedDelta = (Math.random() - 0.5) * (max - min) * 0.2 * amplitude;
                return clamp(baseValue + balancedDelta, min, max);

            case MutationDirection.EXPLORATORY:
                // Large jumps or random resets
                if (Math.random() < 0.3) {
                    // 30% chance to jump to random value
                    return min + Math.random() * (max - min);
                }
                const exploratoryDelta = (Math.random() - 0.5) * (max - min) * 0.5 * amplitude;
                return clamp(baseValue + exploratoryDelta, min, max);
        }
    }

    /**
     * Emite evento de mutação para checkpoint monitor
     */
    private emitMutationEvent(type: 'DEATH_BOOST' | 'RECENT_DEATHS' | 'STAGNATION' | 'BOT_DEATH', details: any): void {
        if (this.onMutationEvent) {
            this.onMutationEvent({
                timestamp: new Date().toISOString(),
                type,
                groupId: this.groupId,
                details
            });
        }
    }

    /**
     * Get current state for persistence/debugging
     */
    getState(): DeathTriggerState {
        return { ...this.deathState };
    }

    /**
     * Restore state from persistence
     */
    restoreState(state: Partial<DeathTriggerState>): void {
        this.deathState = { ...this.deathState, ...state };
    }

    /**
     * Reset counters (e.g., on ecosystem reset)
     */
    reset(): void {
        this.deathState = {
            totalDeaths: 0,
            consecutiveDeaths: 0,
            deathsSinceLastEvolution: 0,
            lastDeathCycle: 0,
            lastEvolutionCycle: 0,
            stagnationCycles: 0,
            lastBestFitness: 0 // QA Fix #3
        };
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
