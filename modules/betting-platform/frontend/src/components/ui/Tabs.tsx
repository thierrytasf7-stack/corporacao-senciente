import React from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex border-b border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);
Tabs.displayName = 'Tabs';

export interface TabsListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export const TabsList = React.forwardRef<HTMLUListElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          'flex border-b border-transparent m-0 p-0 list-none select-none',
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center justify-center whitespace-nowrap py-2 px-1 border-transparent border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger'

export interface TabsPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-6',
          className
        )}
        {...props}
      />
    );
  }
);
TabsPanel.displayName = 'TabsPanel'

export default Tabs;