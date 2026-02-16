import React from 'react';
import { cn } from '@@/lib/utils';

export interface PopoverProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          className
        )}
        {...props}
      />
    );
  }
);
Popover.displayName = 'Popover';

export interface PopoverOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const PopoverOverlay = React.forwardRef<HTMLDivElement, PopoverOverlayProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-40 bg-black bg-opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
PopoverOverlay.displayName = 'PopoverOverlay';

export interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 w-56 rounded-lg border bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export interface PopoverArrowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const PopoverArrow = React.forwardRef<HTMLDivElement, PopoverArrowProps>(
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
PopoverArrow.displayName = 'PopoverArrow';

export default Popover;