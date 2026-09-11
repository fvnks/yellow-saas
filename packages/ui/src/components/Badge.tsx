import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'secondary' | 'violet';
}

export const Badge = ({ className, variant = 'neutral', children, ...props }: BadgeProps) => {
  const variants = {
    success: 'bg-[#bcfe90]/30 text-forest border-[#bcfe90]/50',
    warning: 'bg-[#ff8940]/15 text-[#cc5500] border-[#ff8940]/30',
    danger: 'bg-[#e24444]/10 text-[#e24444] border-[#e24444]/20',
    info: 'bg-[#abf0ff]/30 text-[#006680] border-[#abf0ff]/50',
    neutral: 'bg-cloud text-slate-text border-mist',
    secondary: 'bg-cloud text-slate-text border-mist',
    violet: 'bg-monday-violet/10 text-monday-violet border-monday-violet/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
