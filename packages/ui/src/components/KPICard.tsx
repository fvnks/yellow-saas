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

export function KPICard({ label, value, change, changeType, trend, trendUp, icon: Icon, iconColor = 'indigo', className }: KPICardProps) {
  const resolvedChangeType = changeType ?? (trendUp === true ? 'positive' : trendUp === false ? 'negative' : 'neutral');
  const resolvedChange = change ?? trend;

  const iconColors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    neutral: 'text-slate-500',
  };

  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl shadow-sm p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>
          {resolvedChange && (
            <p className={cn('text-xs mt-1', changeColors[resolvedChangeType])}>
              {resolvedChange}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[iconColor as keyof typeof iconColors])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}