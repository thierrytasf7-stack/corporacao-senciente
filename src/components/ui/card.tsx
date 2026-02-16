import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-6 shadow-sm ring-offset-background',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

if (__DEV__) {
  Card.displayName = 'Card';
}

export { Card };