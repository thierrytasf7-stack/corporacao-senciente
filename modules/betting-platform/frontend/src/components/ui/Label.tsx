import React from 'react';
import { cn } from '@@/lib/utils';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-gray-700 dark:text-gray-100',
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export default Label;