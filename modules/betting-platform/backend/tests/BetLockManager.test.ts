import { describe, it, expect, beforeEach, afterEach, jest } from '@vitest/runner';
import BetLockManager from '../services/BetLockManager';

describe('BetLockManager', () => {
  let lockManager: BetLockManager;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      set: jest.fn(),
      del: jest.fn(),
      quit: jest.fn()
    };
    
    lockManager = new BetLockManager({
      redisUrl: 'redis://localhost:6379'
    });
    
    // Mock Redis instance
    (lockManager as any).redis = mockRedis;
  });

  afterEach(async () => {
    await lockManager.close();
  });

  it('should acquire and release lock successfully', async () => {
    mockRedis.set.mockResolvedValue('OK');
    
    const result = await lockManager.acquireLock('user1', 'event1');
    expect(result).toBe(true);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'bet:lock:user1:event1',
      'locked',
      'NX',
      'EX',
      5
    );
    
    await lockManager.releaseLock('user1', 'event1');
    expect(mockRedis.del).toHaveBeenCalledWith('bet:lock:user1:event1');
  });

  it('should return false when lock cannot be acquired', async () => {
    mockRedis.set.mockResolvedValue(null);
    
    const result = await lockManager.acquireLock('user1', 'event1');
    expect(result).toBe(false);
  });

  it('should use custom TTL when provided', async () => {
    mockRedis.set.mockResolvedValue('OK');
    
    await lockManager.acquireLock('user1', 'event1', 2000);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'bet:lock:user1:event1',
      'locked',
      'NX',
      'EX',
      2
    );
  });

  it('should handle different users on same event', async () => {
    mockRedis.set.mockResolvedValue('OK');
    
    const result1 = await lockManager.acquireLock('user1', 'event1');
    const result2 = await lockManager.acquireLock('user2', 'event1');
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should handle same user on different events', async () => {
    mockRedis.set.mockResolvedValue('OK');
    
    const result1 = await lockManager.acquireLock('user1', 'event1');
    const result2 = await lockManager.acquireLock('user1', 'event2');
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should close Redis connection properly', async () => {
    await lockManager.close();
    expect(mockRedis.quit).toHaveBeenCalled();
  });
});