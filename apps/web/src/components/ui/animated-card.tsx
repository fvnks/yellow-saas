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
        'border border-border rounded-3xl shadow-card bg-snow',
        'animate-fade-in-up',
        hover && 'hover:shadow-card-hover hover:border-fog transition-all duration-300',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

