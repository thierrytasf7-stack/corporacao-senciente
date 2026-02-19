import React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const baseClasses = 'relative flex items-center rounded-lg border p-4';
    
    const variantClasses = {
      default: 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/50 dark:text-blue-300',
      destructive: 'border-red-100 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/50 dark:text-red-300',
      success: 'border-green-100 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/50 dark:text-green-300',
      warning: 'border-yellow-100 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-900/50 dark:text-yellow-300',
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'font-medium',
          className
        )}
        {...props}
      />
    );
  }
);
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
AlertDescription.displayName = 'AlertDescription';

export interface AlertIconProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const AlertIcon = React.forwardRef<HTMLDivElement, AlertIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mr-3 flex h-5 w-5',
          className
        )}
        {...props}
      />
    );
  }
);
AlertIcon.displayName = 'AlertIcon';

export interface AlertActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const AlertActions = React.forwardRef<HTMLDivElement, AlertActionsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 first:mt-0 first:pt-0 first:border-t-0',
          className
        )}
        {...props}
      />
    );
  }
);
AlertActions.displayName = 'AlertActions';

export default Alert;