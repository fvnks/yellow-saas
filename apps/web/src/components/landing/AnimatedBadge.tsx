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
        'inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300',
        'animate-fade-in-up',
        className
      )}
    >
      {icon}
      {children}
    </div>
  );
}
