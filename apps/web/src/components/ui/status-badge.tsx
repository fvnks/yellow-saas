import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-mint/30 text-forest border-mint/50',
  warning: 'bg-peach/30 text-[#c64d00] border-peach/50',
  danger: 'bg-peach/30 text-[#c64d00] border-peach/50',
  info: 'bg-sky-accent/30 text-[#006680] border-sky-accent/50',
  neutral: 'bg-muted text-foreground border-border/20',
};

const dotColors: Record<StatusVariant, string> = {
  success: 'bg-forest',
  warning: 'bg-sunshine',
  danger: 'bg-[#c64d00]',
  info: 'bg-[#006680]',
  neutral: 'bg-muted',
};

export function StatusBadge({ label, variant = 'neutral', className, pulse = false }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border transition-colors',
      variantStyles[variant],
      className
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        dotColors[variant],
        pulse && 'animate-pulse'
      )} />
      {label}
    </span>
  );
}
