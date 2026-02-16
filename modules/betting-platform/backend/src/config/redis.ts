import Redis from 'ioredis';
import { env } from '../config/env-validator';
import { logger } from '../utils/logger';

export const redis = new Redis({
  url: env.redisUrl,
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  retryDelayOnClusterDown: 100,
  retryDelayOnTryAgain: 100,
  enableOfflineQueue: true,
  lazyConnect: true,
  showFriendlyErrorStack: env.nodeEnv !== 'production',
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    logger.info('✅ Redis connection established successfully');
  } catch (error) {
    logger.error('❌ Unable to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redis.disconnect();
    logger.info('✅ Redis connection closed');
  } catch (error) {
    logger.error('❌ Error closing Redis connection:', error);
  }
}

export const redisHealthCheck = async (): Promise<boolean> => {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error('❌ Redis health check failed:', error);
    return false;
  }
};