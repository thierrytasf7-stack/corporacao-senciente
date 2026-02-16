import React from 'react';
import { cn } from '@@/lib/utils';

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={cn(
          'w-full text-left table-fixed',
          className
        )}
        {...props}
      />
    );
  }
);
Table.displayName = 'Table';

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          'border-b border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);
TableHeader.displayName = 'TableHeader';

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn(
          '',
          className
        )}
        {...props}
      />
    );
  }
);
TableBody.displayName = 'TableBody';

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
  className?: string;
}

export const TableCell = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'py-3 px-6 text-sm text-gray-900 dark:text-gray-100',
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

export interface TableColumnProps
  extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  className?: string;
}

export const TableColumn = React.forwardRef<HTMLTableHeaderCellElement, TableColumnProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'py-3.5 pl-6 pr-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100',
          className
        )}
        {...props}
      />
    );
  }
);
TableColumn.displayName = 'TableColumn';

export default Table;