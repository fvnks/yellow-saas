import { cn } from '../lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  className?: string;
}

export function KPICard({ label, value, change, changeType, trend, trendUp, icon: Icon, iconColor = 'violet', className }: KPICardProps) {
  const resolvedChangeType = changeType ?? (trendUp === true ? 'positive' : trendUp === false ? 'negative' : 'neutral');
  const resolvedChange = change ?? trend;

  const iconColors = {
    violet: 'bg-monday-violet/10 text-monday-violet',
    mint: 'bg-mint/30 text-forest',
    sky: 'bg-sky-accent/30 text-[#006680]',
    apricot: 'bg-apricot/15 text-[#cc5500]',
    lavender: 'bg-lavender text-[#7c3aed]',
    aqua: 'bg-aqua/30 text-[#006680]',
  };

  const changeColors = {
    positive: 'text-forest',
    negative: 'text-[#e24444]',
    neutral: 'text-iron',
  };

  return (
    <div className={cn('bg-snow border border-mist rounded-3xl shadow-card p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold text-iron uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-ink mt-1">
            {value}
          </p>
          {resolvedChange && (
            <p className={cn('text-xs mt-1', changeColors[resolvedChangeType])}>
              {resolvedChange}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconColors[iconColor as keyof typeof iconColors] || iconColors.violet)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
