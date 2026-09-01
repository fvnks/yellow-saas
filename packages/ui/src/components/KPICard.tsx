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

export function KPICard({ label, value, change, changeType, trend, trendUp, icon: Icon, iconColor = 'blue', className }: KPICardProps) {
  const resolvedChangeType = changeType ?? (trendUp === true ? 'positive' : trendUp === false ? 'negative' : 'neutral');
  const resolvedChange = change ?? trend;

  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground dark:text-white mt-1">
            {value}
          </p>
          {resolvedChange && (
            <p className={cn('text-xs mt-1', changeColors[resolvedChangeType])}>
              {resolvedChange}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconColors[iconColor as keyof typeof iconColors])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}