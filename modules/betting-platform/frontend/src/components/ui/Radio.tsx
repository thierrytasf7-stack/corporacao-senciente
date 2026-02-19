import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:border-blue-500 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-colors',
          className
        )}
        {...props}
      />
    );
  }
);
Radio.displayName = 'Radio';

export default Radio;