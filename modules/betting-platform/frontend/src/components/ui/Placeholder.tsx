import React from 'react';
import { cn } from '@@/lib/utils';

export interface PlaceholderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Placeholder = React.forwardRef<HTMLDivElement, PlaceholderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center space-y-2 px-4 py-6 text-center text-gray-500 dark:text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);
Placeholder.displayName = 'Placeholder';

export interface PlaceholderIconProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const PlaceholderIcon = React.forwardRef<HTMLDivElement, PlaceholderIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);
PlaceholderIcon.displayName = 'PlaceholderIcon';

export interface PlaceholderTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export const PlaceholderTitle = React.forwardRef<HTMLHeadingElement, PlaceholderTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-sm font-medium text-gray-900 dark:text-white',
          className
        )}
        {...props}
      />
    );
  }
);
PlaceholderTitle.displayName = 'PlaceholderTitle';

export interface PlaceholderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const PlaceholderDescription = React.forwardRef<HTMLParagraphElement, PlaceholderDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm text-gray-700 dark:text-gray-300',
          className
        )}
        {...props}
      />
    );
  }
);
PlaceholderDescription.displayName = 'PlaceholderDescription';

export default Placeholder;