'use client';

import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbListProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbItemProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbLinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}

interface BreadcrumbPageProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ children, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex', className)}>
      {children}
    </nav>
  );
}

export function BreadcrumbList({ children, className }: BreadcrumbListProps) {
  return (
    <ol className={cn('flex items-center gap-1.5 text-sm', className)}>
      {children}
    </ol>
  );
}

export function BreadcrumbItem({ children, className }: BreadcrumbItemProps) {
  return (
    <li className={cn('inline-flex items-center gap-1.5', className)}>
      {children}
    </li>
  );
}

export function BreadcrumbLink({ 
  children, 
  href, 
  className, 
  onClick 
}: BreadcrumbLinkProps) {
  if (href) {
    return (
      <a 
        href={href}
        className={cn('transition-colors hover:text-foreground', className)}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button 
      className={cn('transition-colors hover:text-foreground', className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function BreadcrumbPage({ children, className }: BreadcrumbPageProps) {
  return (
    <span className={cn('font-normal text-foreground', className)}>
      {children}
    </span>
  );
}

export function BreadcrumbSeparator({ 
  children = '/', 
  className 
}: BreadcrumbSeparatorProps) {
  return (
    <span className={cn('text-muted-foreground', className)}>
      {children}
    </span>
  );
}