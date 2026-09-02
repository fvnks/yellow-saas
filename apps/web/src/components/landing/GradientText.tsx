import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span className={cn('bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300', className)}>
      {children}
    </span>
  );
}
