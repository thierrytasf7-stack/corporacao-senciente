import BetLockManager from '../../services/BetLockManager';

describe('Bet Lock Monitoring', () => {
  let lockManager: BetLockManager;

  beforeEach(() => {
    lockManager = new BetLockManager('redis://localhost:6379');
  });

  afterEach(async () => {
    await lockManager.close();
  });

  test('should log lock contention events', async () => {
    const eventId = 'monitoring-test-001';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await lockManager.acquireLock(eventId);
    
    const start = Date.now();
    const timeout = 2000;
    
    while (Date.now() - start < timeout) {
      await lockManager.acquireLock(eventId);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should track lock acquisition statistics', async () => {
    const eventId = 'stats-test-002';
    const iterations = 100;
    const successCount = 0;
    
    for (let i = 0; i < iterations; i++) {
      const acquired = await lockManager.acquireLock(eventId);
      if (acquired) {
        successCount++;
        await lockManager.releaseLock(eventId);
      }
    }
    
    expect(successCount).toBeGreaterThan(0);
    expect(successCount).toBeLessThanOrEqual(iterations);
  });

  test('should handle lock timeout monitoring', async () => {
    const eventId = 'timeout-test-003';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await lockManager.acquireLock(eventId, 0.5);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const info = await lockManager.getLockInfo(eventId);
    expect(info.locked).toBe(false);
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should monitor lock contention patterns', async () => {
    const eventId = 'pattern-test-004';
    const contentionEvents = [];
    
    const monitorContention = async () => {
      const start = Date.now();
      let acquired = false;
      
      while (!acquired && Date.now() - start < 2000) {
        acquired = await lockManager.acquireLock(eventId);
        if (!acquired) {
          contentionEvents.push('contention');
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      if (acquired) {
        await lockManager.releaseLock(eventId);
      }
    };
    
    await Promise.all([
      monitorContention(),
      monitorContention(),
      monitorContention()
    ]);
    
    expect(contentionEvents.length).toBeGreaterThan(0);
  });

  test('should handle lock monitoring under load', async () => {
    const eventId = 'load-test-005';
    const clientCount = 50;
    const start = Date.now();
    
    await Promise.all(
      Array.from({ length: clientCount }, () => 
        lockManager.acquireLock(eventId).then(acquired => {
          if (acquired) {
            return lockManager.releaseLock(eventId);
          }
        })
      )
    );
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });
});