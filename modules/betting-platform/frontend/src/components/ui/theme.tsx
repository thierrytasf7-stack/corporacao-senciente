import React from 'react';
import { cn } from '@@/lib/utils';

export interface ThemeProviderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ThemeProvider = React.forwardRef<HTMLDivElement, ThemeProviderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors',
          className
        )}
        {...props}
      />
    );
  }
);
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;