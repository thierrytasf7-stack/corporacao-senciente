import { useState, useEffect, useCallback } from 'react';

interface WebSocketMessage {
  op: string;
  data?: any;
  error?: string;
}

interface WebSocketState {
  data: any;
  connected: boolean;
  error: string | null;
}

export function useWebSocket(url: string) {
  const [state, setState] = useState<WebSocketState>({
    data: null,
    connected: false,
    error: null
  });

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setState(prev => ({ ...prev, connected: true, error: null }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setState(prev => ({ ...prev, data: message }));
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to parse message' }));
      }
    };

    ws.onerror = (error) => {
      setState(prev => ({ ...prev, error: error.message || 'WebSocket error' }));
    };

    ws.onclose = () => {
      setState(prev => ({ ...prev, connected: false, error: 'Disconnected' }));
      
      // Auto-reconnect with exponential backoff
      const maxReconnectAttempts = 5;
      let reconnectAttempts = 0;
      
      const reconnect = () => {
        if (reconnectAttempts >= maxReconnectAttempts) {
          setState(prev => ({ ...prev, error: 'Max reconnect attempts reached' }));
          return;
        }
        
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        
        setTimeout(() => {
          connect();
        }, delay);
      };
      
      reconnect();
    };

    return () => {
      ws.close();
    };
  }, [url]);

  useEffect(() => {
    connect();
    
    return () => {
      // Cleanup handled in connect return
    };
  }, [connect]);

  return state;
}