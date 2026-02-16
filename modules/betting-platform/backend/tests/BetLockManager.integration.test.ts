import BetLockManager from '../../services/BetLockManager';

describe('BetLockManager Integration', () => {
  let lockManager: BetLockManager;

  beforeEach(() => {
    lockManager = new BetLockManager('redis://localhost:6379');
  });

  afterEach(async () => {
    await lockManager.close();
  });

  test('should handle high concurrency with multiple clients', async () => {
    const key = 'test-high-concurrency';
    const clientCount = 50;
    const results = await Promise.all(
      Array.from({ length: clientCount }, () => 
        lockManager.acquireLock(key)
      )
    );
    
    const successCount = results.filter(Boolean).length;
    expect(successCount).toBe(1);
    expect(results.filter(r => !r).length).toBe(clientCount - 1);
  });

  test('should handle lock contention logging', async () => {
    const key = 'test-contention';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await lockManager.acquireLock(key);
    
    const start = Date.now();
    const timeout = 2000;
    
    while (Date.now() - start < timeout) {
      await lockManager.acquireLock(key);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should handle lock TTL expiration under load', async () => {
    const key = 'test-ttl-load';
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      await lockManager.acquireLock(key, 0.1);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const info = await lockManager.getLockInfo(key);
    expect(info.locked).toBe(false);
  });

  test('should handle rapid sequential locking', async () => {
    const key = 'test-sequential';
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      await lockManager.acquireLock(key);
      await lockManager.releaseLock(key);
    }
    
    const info = await lockManager.getLockInfo(key);
    expect(info.locked).toBe(false);
  });

  test('should handle lock with different TTL values', async () => {
    const key = 'test-various-ttl';
    
    await lockManager.acquireLock(key, 1);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const info = await lockManager.getLockInfo(key);
    expect(info.locked).toBe(false);
    
    await lockManager.acquireLock(key, 5);
    const infoLong = await lockManager.getLockInfo(key);
    expect(infoLong.locked).toBe(true);
    expect(infoLong.ttl).toBeGreaterThanOrEqual(4);
  });
});