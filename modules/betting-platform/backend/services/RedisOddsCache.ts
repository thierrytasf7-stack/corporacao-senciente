import { RedisClient } from 'redis';
import { logger } from '../utils/logger';

export interface OddsUpdate {
  marketId: string;
  runnerId: string;
  odds: number;
  timestamp: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export class RedisOddsCache {
  private static readonly ODDS_KEY_PREFIX = 'odds:';
  private static readonly ODDS_CHANNEL = 'odds-updates';
  private static readonly DEFAULT_TTL = 60; // seconds

  static async storeOddsUpdate(oddsUpdate: OddsUpdate, redisClient: RedisClient): Promise<void> {
    try {
      const key = `${this.ODDS_KEY_PREFIX}${oddsUpdate.marketId}:${oddsUpdate.runnerId}`;
      const value = JSON.stringify(oddsUpdate);
      
      await redisClient.setex(key, this.DEFAULT_TTL, value);
      
      logger.debug(`Cached odds update for ${oddsUpdate.marketId}:${oddsUpdate.runnerId}`);
    } catch (error) {
      logger.error('Failed to store odds update in Redis:', error);
      throw error;
    }
  }

  static async getOddsUpdate(marketId: string, runnerId: string, redisClient: RedisClient): Promise<OddsUpdate | null> {
    try {
      const key = `${this.ODDS_KEY_PREFIX}${marketId}:${runnerId}`;
      const value = await redisClient.get(key);
      
      if (!value) {
        return null;
      }
      
      return JSON.parse(value) as OddsUpdate;
    } catch (error) {
      logger.error('Failed to get odds update from Redis:', error);
      throw error;
    }
  }

  static async publishOddsUpdate(oddsUpdate: OddsUpdate, redisClient: RedisClient): Promise<void> {
    try {
      const message = JSON.stringify(oddsUpdate);
      await redisClient.publish(this.ODDS_CHANNEL, message);
      
      logger.debug(`Published odds update to channel ${this.ODDS_CHANNEL}`);
    } catch (error) {
      logger.error('Failed to publish odds update:', error);
      throw error;
    }
  }

  static async subscribeToOddsUpdates(callback: (oddsUpdate: OddsUpdate) => void, redisClient: RedisClient): Promise<void> {
    try {
      redisClient.subscribe(this.ODDS_CHANNEL, (err, count) => {
        if (err) {
          logger.error('Failed to subscribe to odds updates:', err);
          throw err;
        }
        
        logger.info(`Subscribed to odds updates channel. Subscribers count: ${count}`);
      });

      redisClient.on('message', (channel, message) => {
        if (channel === this.ODDS_CHANNEL) {
          try {
            const oddsUpdate = JSON.parse(message) as OddsUpdate;
            callback(oddsUpdate);
          } catch (error) {
            logger.error('Failed to parse odds update message:', error);
          }
        }
      });

      redisClient.on('error', (err) => {
        logger.error('Redis subscription error:', err);
      });

    } catch (error) {
      logger.error('Failed to set up odds updates subscription:', error);
      throw error;
    }
  }

  static async getAllMarketOdds(marketId: string, redisClient: RedisClient): Promise<OddsUpdate[]> {
    try {
      const pattern = `${this.ODDS_KEY_PREFIX}${marketId}:*`;
      const keys = await redisClient.keys(pattern);
      
      if (keys.length === 0) {
        return [];
      }
      
      const values = await redisClient.mget(keys);
      const oddsUpdates = values.map((value, index) => {
        return {
          marketId,
          runnerId: keys[index].split(':')[2],
          ...JSON.parse(value),
        } as OddsUpdate;
      });
      
      return oddsUpdates;
    } catch (error) {
      logger.error('Failed to get all market odds:', error);
      throw error;
    }
  }

  static async clearMarketOdds(marketId: string, redisClient: RedisClient): Promise<void> {
    try {
      const pattern = `${this.ODDS_KEY_PREFIX}${marketId}:*`;
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Cleared odds cache for market ${marketId}`);
      }
    } catch (error) {
      logger.error('Failed to clear market odds:', error);
      throw error;
    }
  }

  static async getCacheStats(redisClient: RedisClient): Promise<any> {
    try {
      const info = await redisClient.info();
      const lines = info.split('\r\n');
      const stats = {};
      
      lines.forEach(line => {
        if (line.startsWith('db')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      });
      
      return {
        ...stats,
        oddsKeys: await redisClient.keys(`${this.ODDS_KEY_PREFIX}*`),
        oddsCount: await redisClient.keys(`${this.ODDS_KEY_PREFIX}*`).then(keys => keys.length),
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  static async flushAll(redisClient: RedisClient): Promise<void> {
    try {
      await redisClient.flushall();
      logger.info('Redis cache flushed successfully');
    } catch (error) {
      logger.error('Failed to flush Redis cache:', error);
      throw error;
    }
  }

  static async setTTL(seconds: number): Promise<void> {
    this.DEFAULT_TTL = seconds;
    logger.info(`Odds cache TTL set to ${seconds} seconds`);
  }

  static getTTL(): number {
    return this.DEFAULT_TTL;
  }