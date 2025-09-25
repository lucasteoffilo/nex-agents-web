'use client';

import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('w-full border-collapse', className)}>
      {children}
    </div>
  );
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <div className={cn('bg-muted/50 font-medium', className)}>
      {children}
    </div>
  );
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <div className={cn('divide-y', className)}>
      {children}
    </div>
  );
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <div className={cn('flex items-center border-b transition-colors hover:bg-muted/50', className)}>
      {children}
    </div>
  );
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <div className={cn(
      'flex-1 px-4 py-2 text-left align-middle font-medium text-muted-foreground',
      'text-sm',
      className
    )}>
      {children}
    </div>
  );
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <div className={cn(
      'flex-1 px-4 py-2 align-middle',
      className
    )}>
      {children}
    </div>
  );
}