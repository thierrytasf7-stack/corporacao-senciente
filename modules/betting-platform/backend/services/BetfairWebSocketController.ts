import { betfairWebSocketService } from './BetfairWebSocketService';
import { logger } from '@/utils/logger';

export class BetfairWebSocketController {
  private static instance: BetfairWebSocketController;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): BetfairWebSocketController {
    if (!BetfairWebSocketController.instance) {
      BetfairWebSocketController.instance = new BetfairWebSocketController();
    }
    return BetfairWebSocketController.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Betfair WebSocket Controller is already initialized');
      return;
    }

    try {
      await betfairWebSocketService.initialize();
      this.isInitialized = true;
      logger.info('Betfair WebSocket Controller initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Betfair WebSocket Controller:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    await this.initialize();
  }

  public async stop(): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Betfair WebSocket Controller is not initialized');
      return;
    }

    try {
      await betfairWebSocketService.stop();
      this.isInitialized = false;
      logger.info('Betfair WebSocket Controller stopped successfully');
    } catch (error) {
      logger.error('Failed to stop Betfair WebSocket Controller:', error);
      throw error;
    }
  }

  public async restart(): Promise<void> {
    logger.info('Restarting Betfair WebSocket Controller...');
    
    await this.stop();
    await this.start();
  }

  public async getHealthStatus(): Promise<{
    isHealthy: boolean;
    status: string;
    latency: any | null;
    lastCheck: number;
    consecutiveFailures: number;
    metrics: any;
    isRunning: boolean;
  }> {
    const healthStatus = await betfairWebSocketService.getHealthStatus();
    
    return {
      ...healthStatus,
      isRunning: betfairWebSocketService.isRunning()
    };
  }

  public async getHealthScore(): Promise<number> {
    return betfairWebSocketService.getHealthScore();
  }

  public async subscribeToOddsUpdates(callback: (update: any) => void): Promise<void> {
    await betfairWebSocketService.subscribeToOddsUpdates(callback);
  }

  public async getCachedOdds(marketId: string, runnerId: string): Promise<any | null> {
    return betfairWebSocketService.getCachedOdds(marketId, runnerId);
  }

  public async getAllCachedOdds(): Promise<Record<string, any>> {
    return betfairWebSocketService.getAllCachedOdds();
  }

  public async updateMarketSubscriptions(marketIds: string[]): Promise<void> {
    await betfairWebSocketService.updateMarketSubscriptions(marketIds);
  }

  public async clearCache(): Promise<void> {
    await betfairWebSocketService.clearCache();
  }

  public async setCacheTTL(seconds: number): Promise<void> {
    await betfairWebSocketService.setCacheTTL(seconds);
  }

  public async getCacheStats(): Promise<{ keys: number; memory: number; hitRate: number } | null> {
    return betfairWebSocketService.getCacheStats();
  }

  public isRunning(): boolean {
    return betfairWebSocketService.isRunning();
  }

  public async exportMetrics(): Promise<Record<string, any>> {
    return betfairWebSocketService.exportMetrics();
  }

  public async resetMetrics(): Promise<void> {
    await betfairWebSocketService.resetMetrics();
  }

  public async testConnection(): Promise<boolean> {
    try {
      const status = await betfairWebSocketService.getHealthStatus();
      return status.isHealthy;
    } catch (error) {
      logger.error('Connection test failed:', error);
      return false;
    }
  }

  public async getConfiguration(): Promise<{
    cacheTTL: number;
    marketIds: string[];
    healthCheckInterval: number;
    metricsInterval: number;
  }> {
    // Implementation depends on actual configuration
    return {
      cacheTTL: 60,
      marketIds: [],
      healthCheckInterval: 30000,
      metricsInterval: 60000
    };
  }

  public async updateConfiguration(config: Partial<{
    cacheTTL: number;
    marketIds: string[];
    healthCheckInterval: number;
    metricsInterval: number;
  }>): Promise<void> {
    // Implementation depends on actual configuration
    logger.info('Updating configuration:', config);
  }
}

export const betfairWebSocketController = BetfairWebSocketController.getInstance();