import React from 'react';
import { cn } from '@/lib/utils';

export interface MenuProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          className
        )}
        {...props}
      />
    );
  }
);
Menu.displayName = 'Menu'

export interface MenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-blue-500/50',
          className
        )}
        {...props}
      />
    );
  }
);
MenuButton.displayName = 'MenuButton'

export interface MenuItemsProps
  extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export const MenuItems = React.forwardRef<HTMLUListElement, MenuItemsProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          'absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);
MenuItems.displayName = 'MenuItems'

export interface MenuItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  className?: string;
}

export const MenuItem = React.forwardRef<HTMLLIElement, MenuItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          'relative py-2 px-3 text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
MenuItem.displayName = 'MenuItem'

export interface MenuItemButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const MenuItemButton = React.forwardRef<HTMLButtonElement, MenuItemButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'w-full text-left flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700 dark:focus:ring-blue-500/50',
          className
        )}
        {...props}
      />
    );
  }
);
MenuItemButton.displayName = 'MenuItemButton'

export interface MenuGroupProps
  extends React.HTMLAttributes<HTMLLIElement> {
  className?: string;
}

export const MenuGroup = React.forwardRef<HTMLLIElement, MenuGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          'px-3 py-2 text-sm text-gray-700 font-semibold dark:text-gray-300',
          className
        )}
        {...props}
      />
    );
  }
);
MenuGroup.displayName = 'MenuGroup'

export interface MenuSeparatorProps
  extends React.HTMLAttributes<HTHROptGroupElement> {
  className?: string;
}

export const MenuSeparator = React.forwardRef<HTHROptGroupElement, MenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          'my-2 min-w-full border-gray-200/50 dark:border-gray-700/50',
          className
        )}
        {...props}
      />
    );
  }
);
MenuSeparator.displayName = 'MenuSeparator'

export default Menu;