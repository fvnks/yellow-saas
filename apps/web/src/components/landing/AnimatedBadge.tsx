'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedBadgeProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function AnimatedBadge({ children, className, icon }: AnimatedBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-50/80 px-4 py-2 text-sm font-medium text-amber-700 backdrop-blur-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
        'animate-fade-in-up',
        className
      )}
    >
      {icon}
      {children}
    </div>
  );
}
