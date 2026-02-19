import React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-lg dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 sm:text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
Tooltip.displayName = 'Tooltip'

export interface TooltipArrowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TooltipArrow = React.forwardRef<HTMLDivElement, TooltipArrowProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute',
          className
        )}
        {...props}
      />
    );
  }
);
TooltipArrow.displayName = 'TooltipArrow'

export default Tooltip;