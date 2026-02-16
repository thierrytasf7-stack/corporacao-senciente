import Redis from 'ioredis';

export default class QueryOptimizer {
  private redis: Redis.Redis;
  private pool: Redis.Redis[] = [];
  private batchSize: number = 100;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    if (!process.env.REDIS_URL) console.warn('Using default Redis URL: redis://localhost:6379');
    this.redis = new Redis(redisUrl);
    this.redis.on('error', (err) => console.error('Redis connection error:', err));
  }

  private validateKey(key: string): void {
    if (!/^[a-zA-Z0-9:_-]+$/.test(key)) throw new Error('Invalid cache key');
  }

  private validateCacheKey(key: string): void {
    if (typeof key !== 'string' || key.length === 0 || key.length > 256) {
      throw new Error('Invalid cache key: must be a non-empty string up to 256 characters');
    }
    if (!/^[a-zA-Z0-9_-:]+$/.test(key)) {
      throw new Error('Invalid cache key: only alphanumeric, dash, underscore, and colon allowed');
    }
    if (key.includes('\0')) {
      throw new Error('Invalid cache key: null bytes not allowed');
    }
    if (/[\x00-\x1F\x7F]/.test(key)) {
      throw new Error('Invalid cache key: control characters not allowed');
    }
  }

  private safeJSONParse(data: string): any {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        Object.setPrototypeOf(parsed, Object.prototype);
      }
      return parsed;
    } catch {
      return null;
    }
  }

  public async cache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> {
    this.validateKey(key);
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        const parsed = this.safeJSONParse(cached);
        if (parsed !== null) {
          return parsed;
        }
      }

      const result = await fetcher();
      await this.redis.setex(key, ttl, JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Cache error:', error);
      return await fetcher();
    }
  }

  public async batch<T>(keys: string[], fetcher: (keys: string[]) => Promise<T[]>): Promise<T[]> {
    keys.forEach(key => this.validateKey(key));
    try {
      const cachedResults: T[] = [];
      const missingKeys: string[] = [];

      for (const key of keys) {
        const cached = await this.redis.get(key);
        if (cached) {
          const parsed = this.safeJSONParse(cached);
          if (parsed !== null) {
            cachedResults.push(parsed);
          } else {
            missingKeys.push(key);
          }
        } else {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        const fetchedResults = await fetcher(missingKeys);
        
        for (let i = 0; i < missingKeys.length; i++) {
          await this.redis.setex(missingKeys[i], 300, JSON.stringify(fetchedResults[i]));
        }

        return [...cachedResults, ...fetchedResults];
      }

      return cachedResults;
    } catch (error) {
      console.error('Batch error:', error);
      return await fetcher(keys);
    }
  }

  public async pool<T>(task: (connection: Redis.Redis) => Promise<T>): Promise<T> {
    try {
      const connection = this.getConnection();
      const result = await task(connection);
      this.releaseConnection(connection);
      return result;
    } catch (error) {
      console.error('Pool error:', error);
      throw error;
    }
  }

  private getConnection(): Redis.Redis {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return new Redis();
  }

  private releaseConnection(connection: Redis.Redis): void {
    this.pool.push(connection);
  }

  public async clearCache(key?: string): Promise<void> {
    if (key) {
      this.validateKey(key);
      await this.redis.del(key);
    } else {
      await this.redis.flushdb();
    }
  }

  public async getCacheStats(): Promise<{ hits: number; misses: number; size: number }> {
    const info = await this.redis.info('memory');
    const memoryInfo = info.split('\n').find(line => line.startsWith('used_memory:'));
    const usedMemory = memoryInfo ? parseInt(memoryInfo.split(':')[1]) : 0;
    
    return {
      hits: 0,
      misses: 0,
      size: usedMemory
    };
  }

  public async close(): Promise<void> {
    await this.redis.quit();
    for (const connection of this.pool) {
      await connection.quit();
    }
  }
}