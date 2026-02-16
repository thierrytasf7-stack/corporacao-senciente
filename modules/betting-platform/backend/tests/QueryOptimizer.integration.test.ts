import QueryOptimizer from '../services/QueryOptimizer';

describe('QueryOptimizer Integration Tests', () => {
  let optimizer: QueryOptimizer;

  beforeAll(async () => {
    optimizer = new QueryOptimizer('redis://localhost:6379');
    await optimizer.clearCache();
  });

  afterAll(async () => {
    await optimizer.close();
  });

  describe('cache method', () => {
    it('should cache and retrieve data', async () => {
      const data = { test: 'value' };
      const result = await optimizer.cache('test_key', async () => data, 60);
      expect(result).toEqual(data);
    });

    it('should handle cache misses', async () => {
      const result = await optimizer.cache('non_existent_key', async () => ({ test: 'fallback' }));
      expect(result).toEqual({ test: 'fallback' });
    });

    it('should handle invalid keys gracefully', async () => {
      await expect(optimizer.cache('invalid key', async () => ({ test: 'value' })))
        .rejects.toThrow('Invalid cache key');
    });
  });

  describe('batch method', () => {
    it('should handle batch operations', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      
      const result = await optimizer.batch(['key1', 'key2'], async () => data);
      expect(result).toEqual(data);
    });

    it('should handle mixed cache hits and misses', async () => {
      await optimizer.cache('hit_key', async () => ({ id: 1 }));
      
      const data = [{ id: 2 }];
      const result = await optimizer.batch(['hit_key', 'miss_key'], async () => data);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle invalid keys in batch', async () => {
      await expect(optimizer.batch(['valid_key', 'invalid key'], async () => []))
        .rejects.toThrow('Invalid cache key');
    });
  });

  describe('clearCache method', () => {
    it('should clear specific key', async () => {
      await optimizer.cache('key_to_clear', async () => ({ test: 'value' }));
      await optimizer.clearCache('key_to_clear');
      
      const result = await optimizer.cache('key_to_clear', async () => ({ test: 'fallback' }));
      expect(result).toEqual({ test: 'fallback' });
    });

    it('should clear all cache', async () => {
      await optimizer.cache('key1', async () => ({ id: 1 }));
      await optimizer.cache('key2', async () => ({ id: 2 }));
      
      await optimizer.clearCache();
      
      const result1 = await optimizer.cache('key1', async () => ({ id: 3 }));
      const result2 = await optimizer.cache('key2', async () => ({ id: 4 }));
      
      expect(result1).toEqual({ id: 3 });
      expect(result2).toEqual({ id: 4 });
    });
  });
});