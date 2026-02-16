export enum WebSocketState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  DISCONNECTED = 'DISCONNECTED'
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private url: string) {}

  connect(): void {
    if (this.state === WebSocketState.CONNECTING || this.state === WebSocketState.CONNECTED) {
      return;
    }

    this.state = WebSocketState.CONNECTING;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.state = WebSocketState.CONNECTED;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.ws.onclose = () => {
      this.state = WebSocketState.DISCONNECTED;
      this.reconnect();
    };

    this.ws.onerror = () => {
      if (this.ws) {
        this.ws.close();
      }
      this.state = WebSocketState.DISCONNECTED;
      this.reconnect();
    };
  }

  private reconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= 5) {
      this.reconnectDelay = this.maxReconnectDelay;
    } else {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }

    this.state = WebSocketState.RECONNECTING;
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state = WebSocketState.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  getState(): WebSocketState {
    return this.state;
  }

  send(data: string): void {
    if (this.ws && this.state === WebSocketState.CONNECTED) {
      this.ws.send(data);
    }
  }

  onMessage(callback: (event: MessageEvent) => void): void {
    if (this.ws) {
      this.ws.onmessage = callback;
    }
  }
}