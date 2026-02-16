/**
 * AIOS Monitor WebSocket Hook
 *
 * Connects to the monitor-server via WebSocket for real-time events.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMonitorStore, type MonitorEvent } from '@/stores/monitor-store';

const MONITOR_WS_URL = process.env.NEXT_PUBLIC_MONITOR_WS_URL || 'ws://localhost:21302/stream';
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

interface WebSocketMessage {
  type: 'event' | 'init';
  event?: MonitorEvent;
  events?: MonitorEvent[];
}

export function useMonitorEvents() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    connected,
    connecting,
    error,
    events,
    setConnected,
    setConnecting,
    setError,
    addEvent,
    setEvents,
  } = useMonitorStore();

  const connectRef = useRef<(() => void) | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(MONITOR_WS_URL);

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          // Ignore pong responses (plain text, not JSON)
          if (event.data === 'pong') {
            return;
          }

          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'init' && message.events) {
            // Initial load of recent events
            setEvents(message.events);
          } else if (message.type === 'event' && message.event) {
            // New event received
            addEvent(message.event);
          }
        } catch {
          // Silently ignore unparseable messages
        }
      };

      ws.onerror = () => {
        // Silently handle - browser logs WebSocket errors automatically
        setError('Connection error');
      };

      ws.onclose = () => {
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_INTERVAL * Math.min(reconnectAttemptsRef.current + 1, 3);
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        } else {
          setError('Monitor server offline. Inicie com: cd apps/monitor-server && bun run dev');
        }
      };

      wsRef.current = ws;
    } catch {
      setConnecting(false);
      setError('Failed to connect to monitor server');
    }
  }, [setConnected, setConnecting, setError, addEvent, setEvents]);

  // Keep connectRef in sync
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
  }, [setConnected, setConnecting]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Ping/pong to keep connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [connected]);

  return {
    connected,
    connecting,
    error,
    events,
    connect,
    disconnect,
    reconnect,
  };
}
