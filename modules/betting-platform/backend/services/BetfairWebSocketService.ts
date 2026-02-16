import { BetfairWebSocketManager } from './BetfairWebSocketManager';
import { BetfairWebSocketHealthMonitor } from './BetfairWebSocketHealthMonitor';
import { BetfairWebSocketMetrics } from './BetfairWebSocketMetrics';
import { logger } from '@/utils/logger';

export class BetfairWebSocketService {
  private static instance: BetfairWebSocketService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): BetfairWebSocketService {
    if (!BetfairWebSocketService.instance) {
      BetfairWebSocketService.instance = new BetfairWebSocketService();
    }
    return BetfairWebSocketService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Betfair WebSocket Service is already initialized');
      return;
    }

    try {
      await this.setupWebSocket();
      await this.setupHealthMonitor();
      await this.setupMetrics();
      
      this.isInitialized = true;
      logger.info('Betfair WebSocket Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Betfair WebSocket Service:', error);
      throw error;
    }
  }

  private async setupWebSocket(): Promise<void> {
    const manager = BetfairWebSocketManager.getInstance();
    await manager.start();
    logger.info('Betfair WebSocket started');
  }

  private async setupHealthMonitor(): Promise<void> {
    const healthMonitor = BetfairWebSocketHealthMonitor.getInstance();
    await healthMonitor.start();
    logger.info('Betfair WebSocket health monitor started');
  }

  private async setupMetrics(): Promise<void> {
    const metrics = BetfairWebSocketMetrics.getInstance();
    await metrics.start();
    logger.info('Betfair WebSocket metrics collection started');
  }

  public async start(): Promise<void> {
    await this.initialize();
  }

  public async stop(): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Betfair WebSocket Service is not initialized');
      return;
    }

    try {
      await this.cleanup();
      this.isInitialized = false;
      logger.info('Betfair WebSocket Service stopped successfully');
    } catch (error) {
      logger.error('Failed to stop Betfair WebSocket Service:', error);
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    const manager = BetfairWebSocketManager.getInstance();
    const healthMonitor = BetfairWebSocketHealthMonitor.getInstance();
    const metrics = BetfairWebSocketMetrics.getInstance();

    await manager.stop();
    healthMonitor.stop();
    metrics.stop();
  }

  public async restart(): Promise<void> {
    logger.info('Restarting Betfair WebSocket Service...');
    
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
  }> {
    const healthMonitor = BetfairWebSocketHealthMonitor.getInstance();
    const metrics = BetfairWebSocketMetrics.getInstance();
    
    const healthStatus = await healthMonitor.getHealthStatus();
    const metricsData = metrics.getMetrics();
    
    return {
      ...healthStatus,
      metrics: metricsData
    };
  }

  public async getHealthScore(): Promise<number> {
    const metrics = BetfairWebSocketMetrics.getInstance();
    return metrics.getHealthScore();
  }

  public async subscribeToOddsUpdates(callback: (update: any) => void): Promise<void> {
    const manager = BetfairWebSocketManager.getInstance();
    await manager.subscribeToOddsUpdates(callback);
  }

  public async getCachedOdds(marketId: string, runnerId: string): Promise<any | null> {
    const manager = BetfairWebSocketManager.getInstance();
    return manager.getCachedOdds(marketId, runnerId);
  }

  public async getAllCachedOdds(): Promise<Record<string, any>> {
    const manager = BetfairWebSocketManager.getInstance();
    return manager.getAllCachedOdds();
  }

  public async updateMarketSubscriptions(marketIds: string[]): Promise<void> {
    const manager = BetfairWebSocketManager.getInstance();
    await manager.updateMarketSubscriptions(marketIds);
  }

  public async clearCache(): Promise<void> {
    const manager = BetfairWebSocketManager.getInstance();
    await manager.clearCache();
  }

  public async setCacheTTL(seconds: number): Promise<void> {
    const manager = BetfairWebSocketManager.getInstance();
    await manager.setCacheTTL(seconds);
  }

  public async getCacheStats(): Promise<{ keys: number; memory: number; hitRate: number } | null> {
    const manager = BetfairWebSocketManager.getInstance();
    return manager.getCacheStats();
  }

  public isRunning(): boolean {
    const manager = BetfairWebSocketManager.getInstance();
    return manager.isRunning();
  }

  public async exportMetrics(): Promise<Record<string, any>> {
    const metrics = BetfairWebSocketMetrics.getInstance();
    return metrics.exportMetrics();
  }

  public async resetMetrics(): Promise<void> {
    const metrics = BetfairWebSocketMetrics.getInstance();
    await metrics.resetMetrics();
  }
}

export const betfairWebSocketService = BetfairWebSocketService.getInstance();