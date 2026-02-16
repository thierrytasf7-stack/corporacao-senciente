import { useState, useEffect, useCallback } from 'react';
import { WebSocketManager, WebSocketEvent, WebSocketMessage } from '../services/WebSocketManager';

export interface WebSocketStatus {
  status: 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  isConnected: boolean;
  attempts: number;
}

export function useWebSocket(url: string): {
  status: WebSocketStatus;
  sendMessage: (message: WebSocketMessage) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
  onConnect: (callback: () => void) => () => void;
  onDisconnect: (callback: () => void) => () => void;
  onError: (callback: (error: Error) => void) => () => void;
} {
  const [status, setStatus] = useState<WebSocketStatus>({
    status: 'DISCONNECTED',
    isConnected: false,
    attempts: 0
  });

  const [manager] = useState(() => new WebSocketManager(url));

  const updateStatus = useCallback((newStatus: WebSocketStatus) => {
    setStatus(newStatus);
  }, []);

  useEffect(() => {
    const handleStatusChange = (event: WebSocketEvent) => {
      if (event.type === 'connect') {
        updateStatus({
          status: 'CONNECTED',
          isConnected: true,
          attempts: manager.attempts
        });
      } else if (event.type === 'disconnect') {
        updateStatus({
          status: 'DISCONNECTED',
          isConnected: false,
          attempts: manager.attempts
        });
      } else if (event.type === 'error') {
        updateStatus({
          status: manager.status,
          isConnected: manager.isConnected,
          attempts: manager.attempts
        });
      }
    };

    manager.addEventListener('connect', handleStatusChange);
    manager.addEventListener('disconnect', handleStatusChange);
    manager.addEventListener('error', handleStatusChange);

    return () => {
      manager.removeEventListener('connect', handleStatusChange);
      manager.removeEventListener('disconnect', handleStatusChange);
      manager.removeEventListener('error', handleStatusChange);
    };
  }, [manager, updateStatus]);

  useEffect(() => {
    manager.connect();

    return () => {
      manager.destroy();
    };
  }, [manager]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    manager.sendMessage(message);
  }, [manager]);

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    manager.addEventListener('message', callback);
    return () => manager.removeEventListener('message', callback);
  }, [manager]);

  const onConnect = useCallback((callback: () => void) => {
    manager.addEventListener('connect', callback);
    return () => manager.removeEventListener('connect', callback);
  }, [manager]);

  const onDisconnect = useCallback((callback: () => void) => {
    manager.addEventListener('disconnect', callback);
    return () => manager.removeEventListener('disconnect', callback);
  }, [manager]);

  const onError = useCallback((callback: (error: Error) => void) => {
    manager.addEventListener('error', callback);
    return () => manager.removeEventListener('error', callback);
  }, [manager]);

  return {
    status,
    sendMessage,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  };
}