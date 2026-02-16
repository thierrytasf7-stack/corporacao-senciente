import React from 'react';
import { cn } from '@@/lib/utils';

export interface ToasterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:items-start sm:justify-center z-[10000]',
          className
        )}
        {...props}
      />
    );
  }
);
Toaster.displayName = 'Toaster';

export default Toaster;