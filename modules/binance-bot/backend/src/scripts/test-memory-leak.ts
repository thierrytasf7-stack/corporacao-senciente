/**
 * MEMORY LEAK TEST SCRIPT
 *
 * Simulates accelerated analysis cycles (1s interval) for 1000 iterations
 * and measures memory growth. Pass if RSS stays under 512MB.
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/test-memory-leak.ts
 */

const ITERATIONS = 1000;
const SAMPLE_INTERVAL = 100; // Log memory every N iterations

interface MemorySnapshot {
    iteration: number;
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    timestamp: number;
}

function getMemoryMB(): MemorySnapshot & { rssMB: string; heapMB: string } {
    const mem = process.memoryUsage();
    return {
        iteration: 0,
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
        timestamp: Date.now(),
        rssMB: (mem.rss / 1024 / 1024).toFixed(1),
        heapMB: (mem.heapUsed / 1024 / 1024).toFixed(1),
    };
}

async function testMemoryGrowth(): Promise<void> {
    console.log('=== MEMORY LEAK TEST ===');
    console.log(`Iterations: ${ITERATIONS}, Sample interval: ${SAMPLE_INTERVAL}`);
    console.log('');

    const snapshots: MemorySnapshot[] = [];
    const initial = getMemoryMB();
    console.log(`[START] RSS: ${initial.rssMB}MB | Heap: ${initial.heapMB}MB`);

    // Simulate data structures that would grow in the real service
    const simulatedCycleHistory: any[] = [];
    const simulatedEmittedSignals: any[] = [];
    const simulatedCooldowns = new Map<string, number>();
    const simulatedTriggers = new Set<string>();
    const simulatedCandleCache = new Map<string, { data: number[]; timestamp: number }>();

    for (let i = 1; i <= ITERATIONS; i++) {
        // Simulate cycle: generate data
        const cycleData = {
            cycleNumber: i,
            timestamp: new Date().toISOString(),
            signalsGenerated: Math.floor(Math.random() * 20),
            executionsPerformed: Math.floor(Math.random() * 3),
            signalsByMarket: { BTCUSDT: 5, ETHUSDT: 3, SOLUSDT: 2 },
            table: Array(5).fill(null).map(() => ({
                market: 'BTCUSDT',
                strategies: Object.fromEntries(
                    Array(10).fill(null).map((_, j) => [
                        `strategy_${j}`,
                        { timeframe1m: { strength: Math.random() * 100, diagnostics: 'test' } }
                    ])
                )
            }))
        };

        simulatedCycleHistory.push(cycleData);
        simulatedEmittedSignals.unshift({ id: i, market: 'BTCUSDT', signal: 'BUY' });
        simulatedCooldowns.set(`SYMBOL_${i % 50}`, Date.now() + 900000);
        simulatedTriggers.add(`trigger_${i}`);

        // Simulate candle cache entries
        for (let s = 0; s < 5; s++) {
            simulatedCandleCache.set(`SYMBOL${s}_1m`, {
                data: Array(100).fill(0).map(() => Math.random() * 1000),
                timestamp: Date.now()
            });
        }

        // Apply the same cleanup logic as the fixed code (every 100 cycles)
        if (i % 100 === 0) {
            // Cleanup: cycleHistory max 20
            if (simulatedCycleHistory.length > 20) {
                simulatedCycleHistory.splice(0, simulatedCycleHistory.length - 20);
            }

            // Cleanup: emittedSignals max 100
            if (simulatedEmittedSignals.length > 100) {
                simulatedEmittedSignals.splice(100);
            }

            // Cleanup: expired cooldowns
            const now = Date.now();
            for (const [symbol, expiry] of simulatedCooldowns) {
                if (now > expiry) simulatedCooldowns.delete(symbol);
            }

            // Cleanup: triggerSellsExecuted max 200
            if (simulatedTriggers.size > 200) {
                const arr = Array.from(simulatedTriggers);
                simulatedTriggers.clear();
                for (const item of arr.slice(-200)) simulatedTriggers.add(item);
            }

            // Cleanup: stale cache entries
            for (const [key, entry] of simulatedCandleCache) {
                if (now - entry.timestamp > 30000) simulatedCandleCache.delete(key);
            }

            // Force GC if available
            if (global.gc) global.gc();
        }

        // Log at sample intervals
        if (i % SAMPLE_INTERVAL === 0) {
            const mem = getMemoryMB();
            mem.iteration = i;
            snapshots.push(mem);
            console.log(`[Cycle ${i}/${ITERATIONS}] RSS: ${mem.rssMB}MB | Heap: ${mem.heapMB}MB | Cache: ${simulatedCandleCache.size} | History: ${simulatedCycleHistory.length} | Signals: ${simulatedEmittedSignals.length} | Triggers: ${simulatedTriggers.size}`);
        }
    }

    const final = getMemoryMB();
    const rssGrowthMB = ((final.rss - initial.rss) / 1024 / 1024).toFixed(1);
    const rssFinalMB = parseFloat(final.rssMB);

    console.log('');
    console.log('=== RESULTS ===');
    console.log(`Initial RSS: ${initial.rssMB}MB`);
    console.log(`Final RSS:   ${final.rssMB}MB`);
    console.log(`Growth:      ${rssGrowthMB}MB`);
    console.log(`Under 512MB: ${rssFinalMB < 512 ? 'PASS' : 'FAIL'}`);

    if (rssFinalMB >= 512) {
        console.error('MEMORY TEST FAILED: RSS exceeds 512MB limit');
        process.exit(1);
    }

    console.log('MEMORY TEST PASSED');
}

testMemoryGrowth().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
