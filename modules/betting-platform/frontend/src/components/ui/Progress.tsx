import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-gray-200 rounded-full h-2',
          className
        )}
        {...props}
      />
    );
  }
);
Progress.displayName = 'Progress';

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-full bg-blue-600 rounded-full transition-all duration-300',
          className
        )}
        {...props}
      />
    );
  }
);
ProgressBar.displayName = 'ProgressBar';

export default Progress;