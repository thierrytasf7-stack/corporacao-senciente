import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 highcontrast:focus:ring-offset-0';
    
    const sizeClasses = {
      sm: 'h-8 px-3 py-1.5 text-xs',
      md: 'h-10 px-4 py-2.5 text-sm',
      lg: 'h-12 px-6 py-3 text-base',
    };

    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-blue-600 dark:bg-blue-700 dark:border-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-500/50',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-red-600 dark:bg-red-700 dark:border-red-700 dark:hover:bg-red-600 dark:focus:ring-red-500/50',
      outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:focus:ring-blue-500/50',
      ghost: 'text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:focus:ring-blue-500/50',
      link: 'text-blue-600 hover:text-blue-700 focus:ring-blue-500 bg-transparent py-0.5 padding-left-0 padding-right-0 dark:text-blue-400 dark:hover:text-blue-300 dark:focus:ring-blue-500/50',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;