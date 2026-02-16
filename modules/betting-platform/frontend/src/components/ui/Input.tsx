import React from 'react';
import { cn } from '@@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full pl-3 pr-10 py-2.5 text-sm placeholder:text-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export default Input;