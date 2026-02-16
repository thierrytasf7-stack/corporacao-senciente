import { RedisClient } from 'redis';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

export interface RedisConfig {
  url: string;
  username: string;
  password: string;
  tls: boolean;
}

export class RedisConfigManager {
  private static instance: RedisConfigManager;
  private config: RedisConfig;

  private constructor() {
    this.config = {
      url: config.redis.url,
      username: config.redis.username,
      password: config.redis.password,
      tls: config.redis.tls || true
    };
  }

  public static getInstance(): RedisConfigManager {
    if (!RedisConfigManager.instance) {
      RedisConfigManager.instance = new RedisConfigManager();
    }
    return RedisConfigManager.instance;
  }

  public getConfig(): RedisConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<RedisConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Redis configuration updated', newConfig);
  }

  public validateConfig(): boolean {
    const { url, username, password } = this.config;
    
    if (!url || !username || !password) {
      logger.error('Invalid Redis configuration: missing required fields');
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch (error) {
      logger.error('Invalid Redis URL:', error);
      return false;
    }
  }
}

export class RedisConnectionPool {
  private static instance: RedisConnectionPool;
  private pool: RedisClient[] = [];
  private maxConnections: number;

  private constructor() {
    this.maxConnections = config.redis.maxConnections || 10;
  }

  public static getInstance(): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      RedisConnectionPool.instance = new RedisConnectionPool();
    }
    return RedisConnectionPool.instance;
  }

  public async getConnection(): Promise<RedisClient> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    const config = RedisConfigManager.getInstance().getConfig();
    
    const client = new RedisClient({
      url: config.url,
      username: config.username,
      password: config.password,
      tls: { servername: new URL(config.url).hostname }
    });

    await client.connect();
    return client;
  }

  public releaseConnection(client: RedisClient): void {
    if (this.pool.length < this.maxConnections) {
      this.pool.push(client);
    } else {
      client.disconnect();
    }
  }

  public async closeAllConnections(): Promise<void> {
    const closePromises = this.pool.map(client >> client.disconnect());
    await Promise.all(closePromises);
    this.pool = [];
    logger.info('Closed all Redis connections');
  }
}

export const initializeRedis = async (): Promise<void> {
  try {
    const configManager = RedisConfigManager.getInstance();
    
    if (!configManager.validateConfig()) {
      throw new Error('Invalid Redis configuration');
    }

    const connection = await RedisConnectionPool.getInstance().getConnection();
    await connection.ping();
    
    logger.info('Redis initialized successfully');
    
    RedisConnectionPool.getInstance().releaseConnection(connection);
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    throw error;
  }
};

export const getRedisClient = async (): Promise<RedisClient> {
  return RedisConnectionPool.getInstance().getConnection();
};

export const releaseRedisClient = (client: RedisClient): void => {
  RedisConnectionPool.getInstance().releaseConnection(client);
};

export const closeRedis = async (): Promise<void> => {
  await RedisConnectionPool.getInstance().closeAllConnections();
};

export const testRedisConnection = async (): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const pong = await client.ping();
    releaseRedisClient(client);
    
    return pong === 'PONG';
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    return false;
  }
};