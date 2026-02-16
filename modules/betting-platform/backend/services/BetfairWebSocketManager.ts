import { BetfairWebSocket } from './BetfairWebSocket';
import { RedisOddsCache } from './RedisOddsCache';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

export class BetfairWebSocketManager {
  private static instance: BetfairWebSocketManager;
  private websocket: BetfairWebSocket | null = null;
  private cache: RedisOddsCache | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): BetfairWebSocketManager {
    if (!BetfairWebSocketManager.instance) {
      BetfairWebSocketManager.instance = new BetfairWebSocketManager();
    }
    return BetfairWebSocketManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.setupCache();
      await this.setupWebSocket();
      this.isRunning = true;
      logger.info('Betfair WebSocket Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Betfair WebSocket Manager:', error);
      throw error;
    }
  }

  private async setupCache(): Promise<void> {
    this.cache = new RedisOddsCache(config.redis.ttl || 60);
    await this.cache.initialize();
    logger.info('Redis cache initialized with TTL: ${config.redis.ttl || 60}s');
  }

  private async setupWebSocket(): Promise<void> {
    if (!this.cache) {
      throw new Error('Cache not initialized');
    }

    this.websocket = new BetfairWebSocket(
      this.cache,
      config.betfair.sessionToken,
      config.betfair.appKey
    );

    await this.websocket.connect();
    logger.info('Betfair WebSocket connection established');
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('WebSocket is already running');
      return;
    }

    try {
      await this.initialize();
      logger.info('Betfair WebSocket started successfully');
    } catch (error) {
      logger.error('Failed to start Betfair WebSocket:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('WebSocket is not running');
      return;
    }

    try {
      await this.cleanup();
      this.isRunning = false;
      logger.info('Betfair WebSocket stopped successfully');
    } catch (error) {
      logger.error('Failed to stop Betfair WebSocket:', error);
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.websocket) {
        // WebSocket cleanup handled internally
      }

      if (this.cache) {
        await this.cache.close();
      }
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  public async restart(): Promise<void> {
    logger.info('Restarting Betfair WebSocket...');
    
    await this.stop();
    await this.start();
  }

  public async getLatencyMetrics(): Promise<{ average: number; max: number; min: number; count: number } | null> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot get latency metrics');
      return null;
    }

    return this.cache.getLatencyMetrics();
  }

  public async getConnectionStatus(): Promise<string | null> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot get connection status');
      return null;
    }

    return this.cache.getConnectionStatus();
  }

  public async subscribeToOddsUpdates(callback: (update: any) => void): Promise<void> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot subscribe to updates');
      return;
    }

    await this.cache.subscribeToUpdates(callback);
  }

  public isRunning(): boolean {
    return this.isRunning;
  }

  public async updateMarketSubscriptions(marketIds: string[]): Promise<void> {
    // This would require WebSocket reconnection with new marketIds
    // Implementation depends on Betfair API capabilities
    logger.info('Updating market subscriptions to:', marketIds);
    // TODO: Implement market subscription updates
  }

  public async getCachedOdds(marketId: string, runnerId: string): Promise<any | null> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot get cached odds');
      return null;
    }

    return this.cache.getOddsUpdate(marketId, runnerId);
  }

  public async getAllCachedOdds(): Promise<Record<string, any>> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot get all cached odds');
      return {};
    }

    // This would require scanning Redis keys - implementation depends on scale
    logger.info('Getting all cached odds (implementation needed)');
    return {};
  }

  public async clearCache(): Promise<void> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot clear cache');
      return;
    }

    logger.info('Clearing Redis cache...');
    // Implementation depends on cache structure
  }

  public async setCacheTTL(seconds: number): Promise<void> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot set TTL');
      return;
    }

    this.cache.setTTL(seconds);
    logger.info('Cache TTL set to:', seconds);
  }

  public async getCacheStats(): Promise<{ keys: number; memory: number; hitRate: number } | null> {
    if (!this.cache) {
      logger.warn('Cache not initialized, cannot get stats');
      return null;
    }

    // Implementation depends on Redis info commands
    logger.info('Getting cache stats (implementation needed)');
    return null;
  }
}

export const betfairWebSocketManager = BetfairWebSocketManager.getInstance();