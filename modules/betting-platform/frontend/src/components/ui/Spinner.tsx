import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-6 w-6',
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

export default Spinner;