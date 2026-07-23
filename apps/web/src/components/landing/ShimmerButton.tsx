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
        'relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-base transition-all duration-300 active:scale-[0.98]',
        variant === 'primary' && 'bg-slate-900 text-white hover:bg-black hover:shadow-lg hover:shadow-slate-900/25',
        variant === 'secondary' && 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
        className
      )}
    >
      {children}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </button>
  );
}
