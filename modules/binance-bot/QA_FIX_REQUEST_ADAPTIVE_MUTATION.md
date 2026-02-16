# QA FIX REQUEST - Adaptive Mutation System

**Date:** 14 Fev 2026, 23:05 UTC
**Reviewer:** Quinn (QA Guardian)
**Target:** @dev (Dex) or CEO-BINANCE (Satoshi)
**Story:** Adaptive Mutation System Implementation
**Gate Status:** 🔴 BLOCKED until fixes applied

---

## 🚨 CRITICAL FIXES REQUIRED

### **FIX #1: Consecutive Deaths Tracking Broken** 🔴

**File:** `modules/binance-bot/backend/src/services/ecosystem/AdaptiveMutationEngine.ts`
**Lines:** 130-143
**Severity:** CRITICAL
**Priority:** P0 (MUST FIX BEFORE DEPLOY)

**Current Code (BROKEN):**
```typescript
recordDeath(currentCycle: number): void {
    this.deathState.totalDeaths++;
    this.deathState.deathsSinceLastEvolution++;
    this.deathState.lastDeathCycle = currentCycle;  // ❌ Updated BEFORE comparison

    // Track consecutive deaths (reset if gap > 50 cycles)
    if (currentCycle - this.deathState.lastDeathCycle < 50) {  // ❌ ALWAYS 0!
        this.deathState.consecutiveDeaths++;
    } else {
        this.deathState.consecutiveDeaths = 1;
    }

    console.log(`💀 Bot death recorded | Total: ${this.deathState.totalDeaths} | Consecutive: ${this.deathState.consecutiveDeaths} | Since last evolution: ${this.deathState.deathsSinceLastEvolution}`);
}
```

**Problem:**
`lastDeathCycle` is updated at line 133 BEFORE the comparison at line 136. Result: `currentCycle - this.deathState.lastDeathCycle` will ALWAYS be 0.

**Impact:**
- consecutiveDeaths will increment on EVERY death
- Death-triggered RADICAL boost will trigger on 3rd death regardless of timing
- Gap threshold (50 cycles) is effectively ignored

**Corrected Code:**
```typescript
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

    // Update AFTER calculation
    this.deathState.lastDeathCycle = currentCycle;

    console.log(`💀 Bot death recorded | Total: ${this.deathState.totalDeaths} | Consecutive: ${this.deathState.consecutiveDeaths} | Gap: ${gap} cycles | Since last evolution: ${this.deathState.deathsSinceLastEvolution}`);
}
```

**Verification Steps:**
1. Create unit test with 3 deaths at cycles: 10, 15, 100
2. Expected: consecutiveDeaths = 2 after cycle 15 (gap=5), then reset to 1 at cycle 100 (gap=85)
3. Manually test in ecosystem, trigger 3 deaths close together, verify logs show correct gaps

---

## ⚠️ HIGH PRIORITY FIXES

### **FIX #2: Stagnation Loop Prevention** 🟠

**File:** `AdaptiveMutationEngine.ts`
**Lines:** 102-105
**Severity:** HIGH
**Priority:** P1 (Strongly Recommended)

**Issue:**
RADICAL mutation triggered at 100 stagnation cycles, but stagnationCycles resets to 0 immediately. If RADICAL doesn't improve fitness quickly, can re-trigger in another 100 cycles, creating loop.

**Recommendation Option A - Partial Reset:**
```typescript
if (this.deathState.stagnationCycles >= this.STAGNATION_THRESHOLD) {
    console.log(`⚠️ STAGNATION detected (${this.deathState.stagnationCycles} cycles) → RADICAL mutation`);
    // Partial reset - give radical mutation time to take effect
    this.deathState.stagnationCycles = Math.floor(this.STAGNATION_THRESHOLD * 0.3); // 30 cycles
    return MutationType.RADICAL;
}
```

**Recommendation Option B - Cooldown Tracking:**
```typescript
// Add to DeathTriggerState interface
lastRadicalMutationCycle: number;

// In selectMutationType()
if (this.deathState.stagnationCycles >= this.STAGNATION_THRESHOLD) {
    const cyclesSinceLastRadical = currentCycle - this.deathState.lastRadicalMutationCycle;
    if (cyclesSinceLastRadical < 50) {
        // Too soon, use BOLD instead
        return MutationType.BOLD;
    }
    this.deathState.lastRadicalMutationCycle = currentCycle;
    this.deathState.stagnationCycles = 0;
    return MutationType.RADICAL;
}
```

**Choose one approach** and document rationale.

---

### **FIX #3: Missing Persistence for lastBestFitness** 🟠

**File:** `AdaptiveMutationEngine.ts`
**Lines:** 208-217
**Severity:** HIGH
**Priority:** P1 (Recommended)

**Issue:**
`lastBestFitness` is not persisted. After ecosystem restart, stagnation tracking starts from scratch.

**Fix Option A - Add to DeathTriggerState:**
```typescript
export interface DeathTriggerState {
    totalDeaths: number;
    consecutiveDeaths: number;
    deathsSinceLastEvolution: number;
    lastDeathCycle: number;
    lastEvolutionCycle: number;
    stagnationCycles: number;
    lastBestFitness: number; // ✅ ADD THIS
}

// Update constructor
private deathState: DeathTriggerState = {
    totalDeaths: 0,
    consecutiveDeaths: 0,
    deathsSinceLastEvolution: 0,
    lastDeathCycle: 0,
    lastEvolutionCycle: 0,
    stagnationCycles: 0,
    lastBestFitness: 0 // ✅ ADD THIS
};

// Update getState() - already works with spread
// Update restoreState()
restoreState(state: Partial<DeathTriggerState>): void {
    this.deathState = { ...this.deathState, ...state };
    this.lastBestFitness = state.lastBestFitness || 0; // ✅ ADD THIS
}

// Update updateStagnationState() to use deathState.lastBestFitness
private updateStagnationState(currentBestFitness: number): void {
    const improvementThreshold = 0.01;
    const improvement = this.deathState.lastBestFitness > 0
        ? (currentBestFitness - this.deathState.lastBestFitness) / this.deathState.lastBestFitness
        : currentBestFitness > 0 ? 1 : 0;

    if (improvement > improvementThreshold) {
        this.deathState.stagnationCycles = 0;
        this.deathState.lastBestFitness = currentBestFitness; // ✅ UPDATE THIS
    } else {
        this.deathState.stagnationCycles++;
    }
}
```

**Fix Option B - Document as Intended Behavior:**
If fresh start after restart is desired, add comment explaining rationale.

---

## 🟡 MEDIUM PRIORITY IMPROVEMENTS

### **FIX #4: Extract Magic Numbers** 🟡

**Severity:** MEDIUM (Code Quality)
**Priority:** P2 (Nice to Have)

**Add configuration constants:**
```typescript
export class AdaptiveMutationEngine {
    // Configuration constants
    private readonly STAGNATION_THRESHOLD = 100;
    private readonly DEATH_BOOST_THRESHOLD = 3;
    private readonly CONSECUTIVE_DEATH_GAP_THRESHOLD = 50; // ✅ NEW
    private readonly EXPLORATORY_RESET_CHANCE = 0.3;       // ✅ NEW
    private readonly IMPROVEMENT_THRESHOLD = 0.01;         // ✅ NEW
    private readonly STAGNATION_PARTIAL_TRIGGER = 0.6;     // ✅ NEW

    // Directional bias deltas
    private readonly CONSERVATIVE_DELTA_FACTOR = 0.05;     // ✅ NEW
    private readonly BALANCED_DELTA_FACTOR = 0.2;          // ✅ NEW
    private readonly EXPLORATORY_DELTA_FACTOR = 0.5;       // ✅ NEW

    // ... rest of class
}
```

**Update usages:**
- Line 136: Use `CONSECUTIVE_DEATH_GAP_THRESHOLD`
- Line 158: Use `IMPROVEMENT_THRESHOLD`
- Line 108: Use `STAGNATION_PARTIAL_TRIGGER`
- Line 196: Use `EXPLORATORY_RESET_CHANCE`
- Lines 186, 191, 200: Use delta factor constants

---

## 🧪 REQUIRED TESTS

### **TEST #1: Unit Tests for recordDeath()** ✅

**File to Create:** `AdaptiveMutationEngine.test.ts`

```typescript
describe('AdaptiveMutationEngine.recordDeath()', () => {
    let engine: AdaptiveMutationEngine;

    beforeEach(() => {
        engine = new AdaptiveMutationEngine();
    });

    it('should initialize consecutiveDeaths to 1 on first death', () => {
        engine.recordDeath(100);
        const state = engine.getState();
        expect(state.consecutiveDeaths).toBe(1);
        expect(state.totalDeaths).toBe(1);
    });

    it('should increment consecutiveDeaths when gap < 50 cycles', () => {
        engine.recordDeath(100);
        engine.recordDeath(120); // gap = 20
        const state = engine.getState();
        expect(state.consecutiveDeaths).toBe(2);
    });

    it('should reset consecutiveDeaths to 1 when gap >= 50 cycles', () => {
        engine.recordDeath(100);
        engine.recordDeath(200); // gap = 100
        const state = engine.getState();
        expect(state.consecutiveDeaths).toBe(1);
        expect(state.totalDeaths).toBe(2); // total still increments
    });

    it('should track gap correctly in logs', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        engine.recordDeath(100);
        engine.recordDeath(120);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Gap: 20 cycles'));
    });
});
```

### **TEST #2: Unit Tests for selectMutationType()** ✅

```typescript
describe('AdaptiveMutationEngine.selectMutationType()', () => {
    it('should return RADICAL after 3 consecutive deaths', () => {
        const engine = new AdaptiveMutationEngine();
        engine.recordDeath(10);
        engine.recordDeath(15);
        engine.recordDeath(20);

        const type = engine.selectMutationType(20, 100);
        expect(type).toBe(MutationType.RADICAL);
    });

    it('should return BOLD after 2 deaths since evolution', () => {
        const engine = new AdaptiveMutationEngine();
        engine.recordDeath(10);
        engine.recordEvolution(15); // reset
        engine.recordDeath(20);
        engine.recordDeath(25);

        const type = engine.selectMutationType(25, 100);
        expect(type).toBe(MutationType.BOLD);
    });

    it('should return RADICAL after 100 stagnation cycles', () => {
        const engine = new AdaptiveMutationEngine();
        // Simulate 100 cycles without fitness improvement
        for (let i = 0; i < 101; i++) {
            engine.selectMutationType(i, 100); // same fitness = no improvement
        }
        const type = engine.selectMutationType(101, 100);
        expect(type).toBe(MutationType.RADICAL);
    });
});
```

---

## ✅ ACCEPTANCE CRITERIA FOR FIX

**Definition of Done:**

1. ✅ Fix #1 applied - consecutiveDeaths tracking corrected
2. ✅ Fix #2 or #3 applied (at least one HIGH priority fix)
3. ✅ Unit tests created with minimum 60% coverage
4. ✅ Manual testing performed (3 consecutive deaths scenario)
5. ✅ TypeScript compilation passes (0 errors)
6. ✅ Documentation updated if behavior changes
7. ✅ QA re-review and gate approval

**QA Will Re-Review:**
- Code changes via `*code-review committed`
- Test coverage via test suite execution
- Manual verification of logs during ecosystem run

---

## 📊 ESTIMATED EFFORT

| Fix | Effort | Risk |
|-----|--------|------|
| Fix #1 (consecutiveDeaths) | 15min | Low |
| Fix #2 (stagnation loop) | 30min | Medium |
| Fix #3 (persistence) | 20min | Low |
| Fix #4 (magic numbers) | 10min | Low |
| Unit Tests | 1-2 hours | Low |
| **TOTAL** | **~3 hours** | **Low** |

---

## 🎯 NEXT STEPS

1. **@dev or @ceo-binance:** Review this fix request
2. **Apply fixes** in order: Critical → High → Medium
3. **Create unit tests** with coverage report
4. **Request QA re-review:** `@qa *review adaptive-mutation-system`
5. **Gate approval** → Ready for deploy

---

**QA Contact:** Quinn (QA Guardian)
**Blocking Issues:** 1 CRITICAL, 2 HIGH
**Estimated Time to Green:** 3 hours

— Quinn, guardião da qualidade 🛡️
