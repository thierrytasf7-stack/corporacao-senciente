import { Badge } from '@/components/ui/badge';
import { twMerge } from 'tailwind-merge';

export interface StatusBadgeProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'reconnecting':
        return 'warning';
      case 'disconnected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Live';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge 
      variant={getVariant(status)}
      className={twMerge(
        'text-xs font-medium',
        status === 'connected' && 'text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-900',
        status === 'reconnecting' && 'text-yellow-800 bg-yellow-100 dark:text-yellow-100 dark:bg-yellow-900',
        status === 'disconnected' && 'text-red-800 bg-red-100 dark:text-red-100 dark:bg-red-900'
      )}
    >
      {getText(status)}
    </Badge>
  );
}