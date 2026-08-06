'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function ShimmerButton({ children, className, variant = 'primary' }: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 active:scale-[0.98]',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-slate-900/25',
        variant === 'secondary' && 'border border-border bg-card text-foreground hover:bg-muted hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
        className
      )}
    >
      {children}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </button>
  );
}
