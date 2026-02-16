export interface OddsData {
  market: string;
  selection: string;
  odds: number;
  updated_at: string;
}

export interface WebSocketMessage {
  data: string;
  type: string;
  target: WebSocket;
}

export interface WebSocketHook {
  data: any[];
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: string) => void;
}