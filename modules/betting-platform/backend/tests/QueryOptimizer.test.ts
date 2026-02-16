import QueryOptimizer from '../services/QueryOptimizer';
import Redis from 'ioredis';

describe('QueryOptimizer Security Tests', () => {
  let optimizer: QueryOptimizer;
  let redisMock: any;

  beforeEach(() => {
    redisMock = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      flushdb: jest.fn(),
      info: jest.fn(),
      quit: jest.fn()
    };
    
    optimizer = new QueryOptimizer('redis://localhost:6379');
    optimizer['redis'] = redisMock;
  });

  describe('validateCacheKey', () => {
    it('should allow valid keys', () => {
      expect(() => optimizer['validateCacheKey']('valid_key-123')).not.toThrow();
      expect(() => optimizer['validateCacheKey']('another_valid_key')).not.toThrow();
    });

    it('should reject invalid keys', () => {
      expect(() => optimizer['validateCacheKey']('invalid key')).toThrow('Invalid cache key');
      expect(() => optimizer['validateCacheKey']('key@with#special$chars')).toThrow('Invalid cache key');
      expect(() => optimizer['validateCacheKey']('key.with.dots')).toThrow('Invalid cache key');
      expect(() => optimizer['validateCacheKey']('key\with\slashes')).toThrow('Invalid cache key');
    });

    it('should reject empty keys', () => {
      expect(() => optimizer['validateCacheKey']('')).toThrow('Invalid cache key');
    });

    it('should reject null keys', () => {
      expect(() => optimizer['validateCacheKey'](null as any)).toThrow('Invalid cache key');
    });
  });

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = optimizer['safeJSONParse<{ test: string }>']('{"test": "value"}');
      expect(result).toEqual({ test: 'value' });
    });

    it('should handle invalid JSON gracefully', () => {
      const result = optimizer['safeJSONParse<{ test: string }>']('invalid json');
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = optimizer['safeJSONParse<{ test: string }>']('');
      expect(result).toBeNull();
    });
  });

  describe('cache method', () => {
    it('should validate key before caching', async () => {
      await expect(optimizer.cache('valid_key', async () => ({ test: 'value' })))
        .resolves.not.toThrow();
      
      await expect(optimizer.cache('invalid key', async () => ({ test: 'value' })))
        .rejects.toThrow('Invalid cache key');
    });

    it('should use safeJSONParse for cached data', async () => {
      redisMock.get.mockResolvedValueOnce('{"test": "value"}');
      const result = await optimizer.cache('valid_key', async () => ({ test: 'value' }));
      expect(result).toEqual({ test: 'value' });
    });

    it('should handle JSON parse errors gracefully', async () => {
      redisMock.get.mockResolvedValueOnce('invalid json');
      const result = await optimizer.cache('valid_key', async () => ({ test: 'value' }));
      expect(result).toEqual({ test: 'value' });
    });
  });

  describe('batch method', () => {
    it('should validate all keys', async () => {
      await expect(optimizer.batch(['valid_key1', 'valid_key2'], async () => []))
        .resolves.not.toThrow();
      
      await expect(optimizer.batch(['valid_key', 'invalid key'], async () => []))
        .rejects.toThrow('Invalid cache key');
    });

    it('should use safeJSONParse for all cached data', async () => {
      redisMock.get.mockResolvedValueOnce('{"test": "value1"}');
      redisMock.get.mockResolvedValueOnce('{"test": "value2"}');
      
      const result = await optimizer.batch(['key1', 'key2'], async () => []);
      expect(result).toEqual([{ test: 'value1' }, { test: 'value2' }]);
    });
  });

  describe('clearCache method', () => {
    it('should validate key when provided', async () => {
      await expect(optimizer.clearCache('valid_key')).resolves.not.toThrow();
      
      await expect(optimizer.clearCache('invalid key')).rejects.toThrow('Invalid cache key');
    });

    it('should not validate when clearing all', async () => {
      await expect(optimizer.clearCache()).resolves.not.toThrow();
    });
  });
});