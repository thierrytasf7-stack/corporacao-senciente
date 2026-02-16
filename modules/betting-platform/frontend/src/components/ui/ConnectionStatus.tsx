import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  status: 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusColor = (): 'green' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
      case 'CONNECTED':
        return 'green';
      case 'CONNECTING':
      case 'RECONNECTING':
        return 'yellow';
      case 'DISCONNECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'CONNECTED':
        return 'Live';
      case 'CONNECTING':
        return 'Connecting...';
      case 'RECONNECTING':
        return 'Reconnecting...';
      case 'DISCONNECTED':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getStatusColor()}>
      {getStatusText()}
    </Badge>
  );
}