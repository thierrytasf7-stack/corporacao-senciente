import { WebSocket, WebSocketServer } from 'ws';
import { RedisClient } from 'redis';
import { BetfairClient } from './BetfairClient';
import { RedisOddsCache } from './RedisOddsCache';
import { logger } from '../utils/logger';

export interface OddsUpdate {
  marketId: string;
  runnerId: string;
  odds: number;
  timestamp: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export interface BetfairStreamConfig {
  sessionToken: string;
  appKey: string;
  marketIds: string[];
  redisConfig: RedisClient;
  reconnectDelay: number;
  maxReconnectAttempts: number;
}

export class BetfairWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private isReconnecting = false;
  private lastMessageTime = 0;
  private metrics = {
    messagesReceived: 0,
    messagesPerSecond: 0,
    totalLatency: 0,
    latencySamples: 0,
    connectionTime: 0,
  };

  constructor(private config: BetfairStreamConfig) {}

  async connect(): Promise<void> {
    try {
      await this.establishConnection();
      this.setupHeartbeat();
      this.startMetricsCollection();
      logger.info('Betfair WebSocket connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Betfair WebSocket:', error);
      await this.scheduleReconnect();
    }
  }

  private async establishConnection(): Promise<void> {
    const url = `wss://stream-api.betfair.com/api/v1.0?session=${this.config.sessionToken}&appKey=${this.config.appKey}`;
    
    this.ws = new WebSocket(url);
    
    this.ws.on('open', () => {
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      this.lastMessageTime = Date.now();
      this.metrics.connectionTime = Date.now();
      
      logger.info('WebSocket connection opened');
      this.subscribeToMarkets();
    });

    this.ws.on('message', (data: string) => {
      this.handleMessage(data);
    });

    this.ws.on('close', (code: number, reason: string) => {
      logger.warn(`WebSocket closed: code=${code}, reason=${reason}`);
      this.handleDisconnect();
    });

    this.ws.on('error', (error: Error) => {
      logger.error('WebSocket error:', error);
      this.handleDisconnect();
    });
  }

  private subscribeToMarkets(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('Cannot subscribe - WebSocket not open');
      return;
    }

    const subscription = {
      op: 'subscribe',
      id: 1,
      marketIds: this.config.marketIds,
      segmentation: 'BASIC',
      conflateMs: 500,
    };

    this.ws.send(JSON.stringify(subscription));
    logger.info('Subscribed to markets:', this.config.marketIds);
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.op === 'mcm') {
        this.processMarketChange(message);
      } else if (message.op === 'status') {
        this.handleStatusUpdate(message);
      }
      
      this.metrics.messagesReceived++;
      this.lastMessageTime = Date.now();
      
    } catch (error) {
      logger.error('Failed to parse WebSocket message:', error);
    }
  }

  private processMarketChange(message: any): void {
    try {
      const marketId = message.id;
      const runners = message.mc[0].rc;
      
      runners.forEach((runner: any) => {
        const oddsUpdate: OddsUpdate = {
          marketId,
          runnerId: runner.id,
          odds: runner.ltp,
          timestamp: Date.now(),
          status: runner.status,
        };

        this.cacheOddsUpdate(oddsUpdate);
        this.publishToSubscribers(oddsUpdate);
      });

      this.metrics.totalLatency += Date.now() - message.pt;
      this.metrics.latencySamples++;
      
    } catch (error) {
      logger.error('Failed to process market change:', error);
    }
  }

  private handleStatusUpdate(message: any): void {
    if (message.status === 'CONNECTED') {
      logger.info('Betfair stream status: CONNECTED');
    } else if (message.status === 'RECOVERING') {
      logger.warn('Betfair stream status: RECOVERING');
    } else if (message.status === 'DISCONNECTED') {
      logger.error('Betfair stream status: DISCONNECTED');
      this.handleDisconnect();
    }
  }

  private async cacheOddsUpdate(oddsUpdate: OddsUpdate): Promise<void> {
    try {
      await RedisOddsCache.storeOddsUpdate(oddsUpdate, this.config.redisConfig);
    } catch (error) {
      logger.error('Failed to cache odds update:', error);
    }
  }

  private publishToSubscribers(oddsUpdate: OddsUpdate): void {
    try {
      RedisOddsCache.publishOddsUpdate(oddsUpdate, this.config.redisConfig);
    } catch (error) {
      logger.error('Failed to publish odds update:', error);
    }
  }

  private handleDisconnect(): void {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    this.scheduleReconnect();
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached. Giving up.');
      return;
    }

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    logger.info(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 'heartbeat' }));
      }
    }, 30000);

    setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      if (timeSinceLastMessage > 60000) {
        logger.warn('No messages received for 60 seconds, checking connection...');
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.handleDisconnect();
        }
      }
    }, 30000);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      const timeElapsed = (Date.now() - this.metrics.connectionTime) / 1000;
      this.metrics.messagesPerSecond = this.metrics.messagesReceived / timeElapsed;
      
      logger.info('WebSocket Metrics:', {
        messagesPerSecond: this.metrics.messagesPerSecond.toFixed(2),
        avgLatency: this.metrics.latencySamples > 0 ? (this.metrics.totalLatency / this.metrics.latencySamples).toFixed(2) : 0,
        messagesReceived: this.metrics.messagesReceived,
      });
    }, 30000);
  }

  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    logger.info('WebSocket connection closed');
  }

  getMetrics(): any {
    return {
      ...this.metrics,
      uptime: (Date.now() - this.metrics.connectionTime) / 1000,
      isConnected: this.ws?.readyState === WebSocket.OPEN,
    };
  }
}

export function createBetfairWebSocket(config: BetfairStreamConfig): BetfairWebSocket {
  return new BetfairWebSocket(config);
}