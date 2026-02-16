import { BetfairWebSocketManager } from './BetfairWebSocketManager';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

export class BetfairWebSocketHealthMonitor {
  private static instance: BetfairWebSocketHealthMonitor;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastSuccessfulCheck = Date.now();
  private consecutiveFailures = 0;
  private readonly maxConsecutiveFailures = 5;
  private readonly checkIntervalMs = config.monitoring.healthCheckInterval || 30000;

  private constructor() {}

  public static getInstance(): BetfairWebSocketHealthMonitor {
    if (!BetfairWebSocketHealthMonitor.instance) {
      BetfairWebSocketHealthMonitor.instance = new BetfairWebSocketHealthMonitor();
    }
    return BetfairWebSocketHealthMonitor.instance;
  }

  public async start(): Promise<void> {
    if (this.checkInterval) {
      logger.warn('Health monitor is already running');
      return;
    }

    logger.info('Starting Betfair WebSocket health monitor');
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.checkIntervalMs);

    // Perform initial check
    await this.performHealthCheck();
  }

  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Betfair WebSocket health monitor stopped');
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const manager = BetfairWebSocketManager.getInstance();
      
      if (!manager.isRunning()) {
        logger.warn('WebSocket manager is not running');
        this.handleFailure('Manager not running');
        return;
      }

      const status = await manager.getConnectionStatus();
      const latencyMetrics = await manager.getLatencyMetrics();
      
      if (status === 'connected') {
        this.handleSuccess(latencyMetrics);
      } else {
        this.handleFailure(`Connection status: ${status}`);
      }
    } catch (error) {
      logger.error('Health check failed:', error);
      this.handleFailure('Health check exception');
    }
  }

  private handleSuccess(latencyMetrics: any | null): void {
    this.consecutiveFailures = 0;
    this.lastSuccessfulCheck = Date.now();
    
    if (latencyMetrics) {
      logger.info('Health check passed', {
        latency: latencyMetrics.average,
        maxLatency: latencyMetrics.max,
        minLatency: latencyMetrics.min,
        count: latencyMetrics.count
      });
    } else {
      logger.info('Health check passed - connected');
    }

    this.checkForAlerts(latencyMetrics);
  }

  private handleFailure(reason: string): void {
    this.consecutiveFailures++;
    logger.warn(`Health check failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${reason}`);
    
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      this.triggerAlert(reason);
    }
  }

  private async checkForAlerts(latencyMetrics: any | null): Promise<void> {
    if (!latencyMetrics) return;

    const { average, max } = latencyMetrics;
    
    if (average > 300) {
      logger.warn('High average latency detected:', average);
      // Trigger alert for high average latency
    }

    if (max > 1000) {
      logger.warn('High max latency detected:', max);
      // Trigger alert for high max latency
    }

    if (latencyMetrics.count < 10) {
      logger.warn('Low message volume detected:', latencyMetrics.count);
      // Trigger alert for low message volume
    }
  }

  private async triggerAlert(reason: string): Promise<void> {
    logger.error('CRITICAL: Betfair WebSocket health alert triggered:', reason);
    
    // Send alert via configured channels
    await this.sendAlert(reason);
    
    // Attempt restart
    try {
      logger.info('Attempting WebSocket restart...');
      const manager = BetfairWebSocketManager.getInstance();
      await manager.restart();
      logger.info('WebSocket restart completed');
    } catch (error) {
      logger.error('Failed to restart WebSocket:', error);
    }
  }

  private async sendAlert(message: string): Promise<void> {
    // Implementation depends on alerting system
    // Example: Send to Slack, email, PagerDuty, etc.
    logger.info('Sending alert:', message);
    
    // Mock alert sending
    console.log('ALERT:', message);
  }

  public async getHealthStatus(): Promise<{
    isHealthy: boolean;
    status: string;
    latency: any | null;
    lastCheck: number;
    consecutiveFailures: number;
  }> {
    const manager = BetfairWebSocketManager.getInstance();
    const status = await manager.getConnectionStatus();
    const latency = await manager.getLatencyMetrics();
    
    const isHealthy = status === 'connected' && this.consecutiveFailures === 0;
    
    return {
      isHealthy,
      status: status || 'unknown',
      latency,
      lastCheck: this.lastSuccessfulCheck,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  public async resetFailures(): Promise<void> {
    this.consecutiveFailures = 0;
    logger.info('Health monitor failures reset');
  }
}

export const betfairWebSocketHealthMonitor = BetfairWebSocketHealthMonitor.getInstance();