import BetLockManager from '../../services/BetLockManager';

describe('Bet Race Condition Tests', () => {
  let lockManager: BetLockManager;

  beforeEach(() => {
    lockManager = new BetLockManager('redis://localhost:6379');
  });

  afterEach(async () => {
    await lockManager.close();
  });

  test('should prevent double bet placement on same event', async () => {
    const eventId = 'race-event-001';
    const betCount = 100;
    const results = await Promise.all(
      Array.from({ length: betCount }, () => 
        lockManager.acquireLock(eventId)
      )
    );
    
    const successCount = results.filter(Boolean).length;
    expect(successCount).toBe(1);
    expect(results.filter(r => !r).length).toBe(betCount - 1);
  });

  test('should handle concurrent bet placement with proper locking', async () => {
    const eventId = 'concurrent-bets-002';
    const betCount = 50;
    const executionOrder = [];
    
    await Promise.all(
      Array.from({ length: betCount }, (_, i) => 
        lockManager.withLock(eventId, async () => {
          executionOrder.push(i);
          await new Promise(resolve => setTimeout(resolve, 10));
        })
      )
    );
    
    expect(executionOrder.length).toBe(betCount);
    expect(new Set(executionOrder).size).toBe(betCount);
  });

  test('should handle high-frequency bet placement', async () => {
    const eventId = 'high-frequency-003';
    const betCount = 1000;
    const start = Date.now();
    
    await Promise.all(
      Array.from({ length: betCount }, () => 
        lockManager.acquireLock(eventId).then(acquired => {
          if (acquired) {
            return lockManager.releaseLock(eventId);
          }
        })
      )
    );
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('should handle nested locking scenarios', async () => {
    const eventId = 'nested-locking-004';
    const results = [];
    
    await lockManager.withLock(eventId, async () => {
      results.push('outer-lock');
      
      await lockManager.withLock(eventId, async () => {
        results.push('inner-lock');
      });
    });
    
    expect(results).toEqual(['outer-lock', 'inner-lock']);
  });

  test('should handle lock contention under stress', async () => {
    const eventId = 'stress-test-005';
    const clientCount = 100;
    const timeout = 3000;
    const start = Date.now();
    
    await Promise.all(
      Array.from({ length: clientCount }, () => 
        new Promise(async (resolve) => {
          const startTime = Date.now();
          let acquired = false;
          
          while (Date.now() - startTime < timeout && !acquired) {
            acquired = await lockManager.acquireLock(eventId);
            if (!acquired) {
              await new Promise(r => setTimeout(r, 10));
            }
          }
          
          if (acquired) {
            await lockManager.releaseLock(eventId);
          }
          
          resolve(acquired);
        })
      )
    );
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(timeout + 1000);
  });

  test('should handle lock recovery after process crash', async () => {
    const eventId = 'crash-recovery-006';
    
    await lockManager.acquireLock(eventId, 1);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const info = await lockManager.getLockInfo(eventId);
    expect(info.locked).toBe(false);
  });
});