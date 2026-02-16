import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatus } from './ui/ConnectionStatus';

export function ConnectionIndicator() {
  const { status } = useWebSocket('wss://your-websocket-url.com');
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      setShowIndicator(status.status !== 'CONNECTED');
    };

    handleVisibility();

    const interval = setInterval(() => {
      handleVisibility();
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ConnectionStatus status={status.status} />
    </div>
  );
}