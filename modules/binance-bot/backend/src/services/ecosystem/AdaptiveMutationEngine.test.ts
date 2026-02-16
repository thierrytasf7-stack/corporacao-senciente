/**
 * Unit Tests for AdaptiveMutationEngine
 * QA-approved test suite for adaptive mutation system
 */

import { AdaptiveMutationEngine, MutationType, MutationDirection } from './AdaptiveMutationEngine';

describe('AdaptiveMutationEngine', () => {
    describe('recordDeath()', () => {
        let engine: AdaptiveMutationEngine;

        beforeEach(() => {
            engine = new AdaptiveMutationEngine();
        });

        it('should initialize consecutiveDeaths to 1 on first death', () => {
            engine.recordDeath(100);
            const state = engine.getState();
            expect(state.consecutiveDeaths).toBe(1);
            expect(state.totalDeaths).toBe(1);
            expect(state.lastDeathCycle).toBe(100);
        });

        it('should increment consecutiveDeaths when gap < 50 cycles', () => {
            engine.recordDeath(100);
            engine.recordDeath(120); // gap = 20
            const state = engine.getState();
            expect(state.consecutiveDeaths).toBe(2);
            expect(state.totalDeaths).toBe(2);
        });

        it('should reset consecutiveDeaths to 1 when gap >= 50 cycles', () => {
            engine.recordDeath(100);
            engine.recordDeath(200); // gap = 100
            const state = engine.getState();
            expect(state.consecutiveDeaths).toBe(1); // Reset
            expect(state.totalDeaths).toBe(2); // Total still increments
        });

        it('should increment deathsSinceLastEvolution on each death', () => {
            engine.recordDeath(10);
            engine.recordDeath(15);
            const state = engine.getState();
            expect(state.deathsSinceLastEvolution).toBe(2);
        });

        it('should reset deathsSinceLastEvolution after evolution', () => {
            engine.recordDeath(10);
            engine.recordDeath(15);
            engine.recordEvolution(20);
            const state = engine.getState();
            expect(state.deathsSinceLastEvolution).toBe(0);
        });
    });

    describe('selectMutationType()', () => {
        let engine: AdaptiveMutationEngine;

        beforeEach(() => {
            engine = new AdaptiveMutationEngine();
        });

        it('should return RADICAL after 3 consecutive deaths', () => {
            engine.recordDeath(10);
            engine.recordDeath(15);
            engine.recordDeath(20);

            const type = engine.selectMutationType(20, 100);
            expect(type).toBe(MutationType.RADICAL);
        });

        it('should return BOLD after 2 deaths since last evolution', () => {
            engine.recordDeath(10);
            engine.recordEvolution(15); // Reset
            engine.recordDeath(20);
            engine.recordDeath(25);

            const type = engine.selectMutationType(25, 100);
            expect(type).toBe(MutationType.BOLD);
        });

        it('should NOT trigger consecutive death boost if gap >= 50', () => {
            engine.recordDeath(10);
            engine.recordDeath(100); // gap = 90, resets to 1
            engine.recordDeath(105); // consecutiveDeaths = 2

            const type = engine.selectMutationType(105, 100);
            expect(type).not.toBe(MutationType.RADICAL); // Should not be RADICAL (only 2 consecutive)
        });

        it('should return RADICAL after 100 stagnation cycles', () => {
            const engine = new AdaptiveMutationEngine();
            // Simulate cycles without fitness improvement
            let type: MutationType | null = null;
            for (let i = 0; i < 100; i++) {
                type = engine.selectMutationType(i, 100); // Same fitness = stagnation
            }
            // At cycle 100, stagnationCycles should hit 100 and trigger RADICAL
            const radicalType = engine.selectMutationType(100, 100);
            expect(radicalType).toBe(MutationType.RADICAL);
        });

        it('should return BOLD after 60 stagnation cycles', () => {
            const engine = new AdaptiveMutationEngine();
            // Simulate 60 cycles without fitness improvement
            for (let i = 0; i < 60; i++) {
                engine.selectMutationType(i, 100); // Same fitness
            }
            const type = engine.selectMutationType(60, 100);
            expect(type).toBe(MutationType.BOLD);
        });

        it('should reset stagnation when fitness improves > 1%', () => {
            const engine = new AdaptiveMutationEngine();
            // Build up stagnation (first call sets lastBestFitness, subsequent calls increment)
            engine.selectMutationType(0, 100); // Sets lastBestFitness = 100, stagnation = 0
            for (let i = 1; i < 50; i++) {
                engine.selectMutationType(i, 100); // No improvement, increments stagnation
            }
            let state = engine.getState();
            expect(state.stagnationCycles).toBe(49); // 49 increments (not 50)

            // Improve fitness by 5%
            engine.selectMutationType(50, 105);
            state = engine.getState();
            expect(state.stagnationCycles).toBe(0); // Reset
        });
    });

    describe('getMutationProfile()', () => {
        let engine: AdaptiveMutationEngine;

        beforeEach(() => {
            engine = new AdaptiveMutationEngine();
        });

        it('should return correct profile for SUBTLE', () => {
            const profile = engine.getMutationProfile(MutationType.SUBTLE);
            expect(profile.amplitudeMultiplier).toBe(0.3);
            expect(profile.rateMultiplier).toBe(0.5);
            expect(profile.direction).toBe(MutationDirection.CONSERVATIVE);
        });

        it('should return correct profile for NORMAL', () => {
            const profile = engine.getMutationProfile(MutationType.NORMAL);
            expect(profile.amplitudeMultiplier).toBe(1.0);
            expect(profile.rateMultiplier).toBe(1.0);
            expect(profile.direction).toBe(MutationDirection.BALANCED);
        });

        it('should return correct profile for BOLD', () => {
            const profile = engine.getMutationProfile(MutationType.BOLD);
            expect(profile.amplitudeMultiplier).toBe(2.0);
            expect(profile.rateMultiplier).toBe(1.5);
            expect(profile.direction).toBe(MutationDirection.BALANCED);
        });

        it('should return correct profile for RADICAL', () => {
            const profile = engine.getMutationProfile(MutationType.RADICAL);
            expect(profile.amplitudeMultiplier).toBe(4.0);
            expect(profile.rateMultiplier).toBe(2.5);
            expect(profile.direction).toBe(MutationDirection.EXPLORATORY);
        });
    });

    describe('applyDirectionalBias()', () => {
        let engine: AdaptiveMutationEngine;

        beforeEach(() => {
            engine = new AdaptiveMutationEngine();
        });

        it('should apply conservative bias (small adjustments)', () => {
            const value = 50;
            const min = 0;
            const max = 100;
            const result = engine.applyDirectionalBias(value, min, max, MutationDirection.CONSERVATIVE, 1.0);

            // Conservative should stay close to original (±5% of range = ±5)
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
            expect(Math.abs(result - value)).toBeLessThan(10); // Within ±10 (conservative)
        });

        it('should apply balanced bias (moderate adjustments)', () => {
            const value = 50;
            const min = 0;
            const max = 100;
            const result = engine.applyDirectionalBias(value, min, max, MutationDirection.BALANCED, 1.0);

            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        });

        it('should apply exploratory bias (large jumps or resets)', () => {
            const value = 50;
            const min = 0;
            const max = 100;
            const results: number[] = [];

            // Run multiple times to test probabilistic behavior
            for (let i = 0; i < 100; i++) {
                const result = engine.applyDirectionalBias(value, min, max, MutationDirection.EXPLORATORY, 1.0);
                results.push(result);
                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThanOrEqual(max);
            }

            // Some results should be far from original (random resets happen ~30% of time)
            const farFromOriginal = results.filter(r => Math.abs(r - value) > 25).length;
            expect(farFromOriginal).toBeGreaterThan(0); // At least some large jumps
        });

        it('should clamp values to min/max bounds', () => {
            const result1 = engine.applyDirectionalBias(10, 0, 100, MutationDirection.CONSERVATIVE, 1.0);
            expect(result1).toBeGreaterThanOrEqual(0);
            expect(result1).toBeLessThanOrEqual(100);

            const result2 = engine.applyDirectionalBias(90, 0, 100, MutationDirection.CONSERVATIVE, 1.0);
            expect(result2).toBeGreaterThanOrEqual(0);
            expect(result2).toBeLessThanOrEqual(100);
        });
    });

    describe('getState() and restoreState()', () => {
        it('should persist and restore state correctly', () => {
            const engine = new AdaptiveMutationEngine();
            engine.recordDeath(10);
            engine.recordDeath(15);
            engine.recordDeath(20);

            const state = engine.getState();
            expect(state.totalDeaths).toBe(3);
            expect(state.consecutiveDeaths).toBe(3);

            // Create new engine and restore
            const engine2 = new AdaptiveMutationEngine();
            engine2.restoreState(state);
            const restored = engine2.getState();

            expect(restored.totalDeaths).toBe(3);
            expect(restored.consecutiveDeaths).toBe(3);
            expect(restored.lastDeathCycle).toBe(20);
            expect(restored.lastBestFitness).toBe(state.lastBestFitness); // QA Fix #3
        });

        it('should persist lastBestFitness for stagnation tracking', () => {
            const engine = new AdaptiveMutationEngine();
            // Trigger stagnation tracking
            for (let i = 0; i < 50; i++) {
                engine.selectMutationType(i, 100);
            }
            engine.selectMutationType(51, 110); // Improve fitness

            const state = engine.getState();
            expect(state.lastBestFitness).toBe(110); // Should be persisted

            // Restore and verify
            const engine2 = new AdaptiveMutationEngine();
            engine2.restoreState(state);
            const restored = engine2.getState();
            expect(restored.lastBestFitness).toBe(110);
        });
    });

    describe('reset()', () => {
        it('should reset all counters to initial state', () => {
            const engine = new AdaptiveMutationEngine();
            engine.recordDeath(10);
            engine.recordDeath(15);
            engine.recordDeath(20);

            engine.reset();
            const state = engine.getState();

            expect(state.totalDeaths).toBe(0);
            expect(state.consecutiveDeaths).toBe(0);
            expect(state.deathsSinceLastEvolution).toBe(0);
            expect(state.lastDeathCycle).toBe(0);
            expect(state.stagnationCycles).toBe(0);
            expect(state.lastBestFitness).toBe(0); // QA Fix #3
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple evolutions resetting death counters', () => {
            const engine = new AdaptiveMutationEngine();
            engine.recordDeath(10);
            engine.recordDeath(15);
            engine.recordEvolution(20);

            let state = engine.getState();
            expect(state.deathsSinceLastEvolution).toBe(0);
            expect(state.consecutiveDeaths).toBe(0);

            engine.recordDeath(25);
            state = engine.getState();
            expect(state.deathsSinceLastEvolution).toBe(1);
            expect(state.consecutiveDeaths).toBe(1); // Reset after evolution
        });

        it('should handle fitness = 0 edge case', () => {
            const engine = new AdaptiveMutationEngine();
            const type = engine.selectMutationType(0, 0); // Zero fitness
            // Should not crash, should return some mutation type
            expect(Object.values(MutationType)).toContain(type);
        });

        it('should handle stagnation partial reset (QA Fix #2)', () => {
            const engine = new AdaptiveMutationEngine();
            // Trigger stagnation
            for (let i = 0; i < 100; i++) {
                engine.selectMutationType(i, 100);
            }
            const type = engine.selectMutationType(100, 100);
            expect(type).toBe(MutationType.RADICAL);

            // After RADICAL, stagnation should be partially reset (30%)
            const state = engine.getState();
            expect(state.stagnationCycles).toBe(30); // Not 0, but 30 (partial reset)
        });
    });
});
