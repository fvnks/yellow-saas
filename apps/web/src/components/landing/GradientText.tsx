import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span className={cn('bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500', className)}>
      {children}
    </span>
  );
}
