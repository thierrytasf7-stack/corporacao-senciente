import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface BetfairStreamConfig {
  endpoint: string;
  appKey: string;
  sessionToken: string;
}

export default class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: BetfairStreamConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: BetfairStreamConfig) {
    super();
    this.config = config;
  }

  public connect(): void {
    try {
      this.ws = new WebSocket(this.config.endpoint);

      this.ws.on('open', () => {
        this.emit('connected');
        this.authenticate();
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        this.emit('message', message);
      });

      this.ws.on('error', (error: Error) => {
        this.emit('error', error);
      });

      this.ws.on('close', () => {
        this.emit('disconnected');
        this.handleReconnect();
      });
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  private authenticate(): void {
    if (!this.ws) return;

    const authMessage = {
      op: 'authentication',
      appKey: this.config.appKey,
      session: this.config.sessionToken
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  public subscribe(marketIds: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const subscribeMessage = {
      op: 'marketSubscription',
      marketIds: marketIds,
      marketDataFilter: {
        fields: ['EX_BEST_OFFERS', 'EX_MARKET_DEF']
      }
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max_reconnect_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}