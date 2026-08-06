import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({ children, className, hover = true, delay = 0 }: AnimatedCardProps) {
  return (
    <div
      className={cn(
        'border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900',
        'animate-fade-in-up',
        hover && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
