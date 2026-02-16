import { BetfairWebSocketManager } from './BetfairWebSocketManager';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

export class BetfairWebSocketMetrics {
  private static instance: BetfairWebSocketMetrics;
  private metrics: {
    messagesReceived: number;
    messagesProcessed: number;
    errors: number;
    reconnects: number;
    latencySamples: number[];
    lastMessageTime: number;
    lastReconnectTime: number;
  };
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.metrics = {
      messagesReceived: 0,
      messagesProcessed: 0,
      errors: 0,
      reconnects: 0,
      latencySamples: [],
      lastMessageTime: Date.now(),
      lastReconnectTime: Date.now()
    };
  }

  public static getInstance(): BetfairWebSocketMetrics {
    if (!BetfairWebSocketMetrics.instance) {
      BetfairWebSocketMetrics.instance = new BetfairWebSocketMetrics();
    }
    return BetfairWebSocketMetrics.instance;
  }

  public async start(): Promise<void> {
    if (this.metricsInterval) {
      logger.warn('Metrics collection is already running');
      return;
    }

    logger.info('Starting Betfair WebSocket metrics collection');
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, config.monitoring.metricsInterval || 60000);

    // Initialize metrics
    this.collectMetrics();
  }

  public stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      logger.info('Betfair WebSocket metrics collection stopped');
    }
  }

  private collectMetrics(): void {
    const manager = BetfairWebSocketManager.getInstance();
    
    if (!manager.isRunning()) {
      logger.warn('WebSocket manager not running, cannot collect metrics');
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastMessage = currentTime - this.metrics.lastMessageTime;
    const timeSinceLastReconnect = currentTime - this.metrics.lastReconnectTime;

    logger.info('Betfair WebSocket Metrics:', {
      messagesReceived: this.metrics.messagesReceived,
      messagesProcessed: this.metrics.messagesProcessed,
      errors: this.metrics.errors,
      reconnects: this.metrics.reconnects,
      avgLatency: this.calculateAverageLatency(),
      timeSinceLastMessage: timeSinceLastMessage,
      timeSinceLastReconnect: timeSinceLastReconnect
    });

    // Reset counters for next interval
    this.metrics.messagesReceived = 0;
    this.metrics.messagesProcessed = 0;
    this.metrics.errors = 0;
  }

  public recordMessageReceived(): void {
    this.metrics.messagesReceived++;
    this.metrics.lastMessageTime = Date.now();
  }

  public recordMessageProcessed(): void {
    this.metrics.messagesProcessed++;
  }

  public recordError(): void {
    this.metrics.errors++;
  }

  public recordReconnect(): void {
    this.metrics.reconnects++;
    this.metrics.lastReconnectTime = Date.now();
  }

  public recordLatency(latency: number): void {
    this.metrics.latencySamples.push(latency);
    
    // Keep only last 1000 samples
    if (this.metrics.latencySamples.length > 1000) {
      this.metrics.latencySamples.shift();
    }
  }

  private calculateAverageLatency(): number {
    if (this.metrics.latencySamples.length === 0) {
      return 0;
    }

    const sum = this.metrics.latencySamples.reduce((acc, val) => acc + val, 0);
    return sum / this.metrics.latencySamples.length;
  }

  public getMetrics(): {
    messagesReceived: number;
    messagesProcessed: number;
    errors: number;
    reconnects: number;
    avgLatency: number;
    maxLatency: number;
    minLatency: number;
    messageRate: number;
    errorRate: number;
    uptime: number;
  } {
    const uptime = (Date.now() - this.metrics.lastReconnectTime) / 1000;
    const messageRate = this.metrics.messagesReceived / (config.monitoring.metricsInterval || 60);
    const errorRate = this.metrics.errors / (config.monitoring.metricsInterval || 60);
    const maxLatency = Math.max(...this.metrics.latencySamples) || 0;
    const minLatency = Math.min(...this.metrics.latencySamples) || 0;

    return {
      messagesReceived: this.metrics.messagesReceived,
      messagesProcessed: this.metrics.messagesProcessed,
      errors: this.metrics.errors,
      reconnects: this.metrics.reconnects,
      avgLatency: this.calculateAverageLatency(),
      maxLatency,
      minLatency,
      messageRate,
      errorRate,
      uptime
    };
  }

  public async exportMetrics(): Promise<Record<string, any>> {
    const metrics = this.getMetrics();
    
    // Export to external monitoring system
    // Example: Prometheus, DataDog, etc.
    logger.info('Exporting Betfair WebSocket metrics', metrics);
    
    return metrics;
  }

  public async resetMetrics(): Promise<void> {
    this.metrics = {
      messagesReceived: 0,
      messagesProcessed: 0,
      errors: 0,
      reconnects: 0,
      latencySamples: [],
      lastMessageTime: Date.now(),
      lastReconnectTime: Date.now()
    };
    logger.info('Betfair WebSocket metrics reset');
  }

  public async getHealthScore(): Promise<number> {
    const metrics = this.getMetrics();
    
    // Calculate health score (0-100)
    let score = 100;
    
    // Deduct points for errors
    if (metrics.errors > 0) {
      score -= Math.min(metrics.errors * 10, 30);
    }
    
    // Deduct points for high latency
    if (metrics.avgLatency > 500) {
      score -= Math.min((metrics.avgLatency - 500) * 0.1, 20);
    }
    
    // Deduct points for low message rate
    if (metrics.messageRate < 10) {
      score -= 10;
    }
    
    // Deduct points for uptime
    if (metrics.uptime < 300) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }
}

export const betfairWebSocketMetrics = BetfairWebSocketMetrics.getInstance();