import React from 'react';
import { cn } from '@@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'appearance-none relative w-full pl-3 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = 'Select';

export interface SelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {
  className?: string;
}

export const SelectOption = React.forwardRef<
  HTMLOptionElement,
  SelectOptionProps
>(({ className, ...props }, ref) => {
  return (
    <option
      ref={ref}
      className={cn('text-gray-900', className)}
      {...props}
    />
  );
});
SelectOption.displayName = 'SelectOption';

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute left-0 right-0 z-50 mt-1 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
        className
      )}
      {...props}
    />
  );
});
SelectContent.displayName = 'SelectContent';

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'flex h-full items-center justify-between w-full pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
        className
      )}
      {...props}
    />
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export interface SelectValueProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SelectValue = React.forwardRef<
  HTMLDivElement,
  SelectValueProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('block truncate', className)}
      {...props}
    />
  );
});
SelectValue.displayName = 'SelectValue';

export interface SelectIconProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SelectIcon = React.forwardRef<
  HTMLDivElement,
  SelectIconProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none',
        className
      )}
      {...props}
    />
  );
});
SelectIcon.displayName = 'SelectIcon';

export interface SelectItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  className?: string;
}

export const SelectItem = React.forwardRef<
  HTMLLIElement,
  SelectItemProps
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(
        'relative py-2 pl-8 pr-3 text-left cursor-default select-none rounded-md text-sm',
        className
      )}
      {...props}
    />
  );
});
SelectItem.displayName = 'SelectItem';

export interface SelectGroupProps
  extends React.HTMLAttributes<HTMLLIElement> {
  className?: string;
}

export const SelectGroup = React.forwardRef<
  HTMLLIElement,
  SelectGroupProps
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(
        'py-2 border-b border-gray-200/50 last:border-b-0',
        className
      )}
      {...props}
    />
  );
});
SelectGroup.displayName = 'SelectGroup';

export interface SelectGroupLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SelectGroupLabel = React.forwardRef<
  HTMLDivElement,
  SelectGroupLabelProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'py-2 pl-3 pr-3 text-sm font-semibold text-gray-900',
        className
      )}
      {...props}
    />
  );
});
SelectGroupLabel.displayName = 'SelectGroupLabel';

export interface SelectGroupChildrenProps
  extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export const SelectGroupChildren = React.forwardRef<
  HTMLUListElement,
  SelectGroupChildrenProps
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn('py-1', className)}
      {...props}
    />
  );
});
SelectGroupChildren.displayName = 'SelectGroupChildren';

export interface SelectSeparatorProps
  extends React.HTMLAttributes<HTHROptGroupElement> {
  className?: string;
}

export const SelectSeparator = React.forwardRef<
  HTHROptGroupElement,
  SelectSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <hr
      ref={ref}
      className={cn(
        'my-2 min-w-full border-gray-200/50',
        className
      )}
      {...props}
    />
  );
});
SelectSeparator.displayName = 'SelectSeparator';

export default Select;