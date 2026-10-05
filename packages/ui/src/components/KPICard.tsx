import { cn } from '../lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  /** @deprecated use changeType + change */
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: 'violet' | 'mint' | 'sky' | 'apricot' | 'lavender' | 'aqua' | 'amber' | 'rose' | 'slate';
  className?: string;
}

const iconColors: Record<string, string> = {
  // Mapeo a la paleta refinada (fondo 60% neutral, 30% borders, 10% acción)
  violet:   'bg-amber-50 text-amber-600 border border-amber-200/60',        // acción principal
  amber:    'bg-amber-50 text-amber-600 border border-amber-200/60',
  mint:     'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  sky:      'bg-sky-50 text-sky-600 border border-sky-200/60',
  aqua:     'bg-cyan-50 text-cyan-600 border border-cyan-200/60',
  apricot:  'bg-orange-50 text-orange-600 border border-orange-200/60',
  rose:     'bg-rose-50 text-rose-600 border border-rose-200/60',
  lavender: 'bg-violet-50 text-violet-600 border border-violet-200/60',
  slate:    'bg-slate-100 text-slate-600 border border-slate-200',
};

const changeColors: Record<'positive' | 'negative' | 'neutral', string> = {
  positive: 'text-emerald-600',
  negative: 'text-rose-600',
  neutral: 'text-slate-500',
};

export function KPICard({ label, value, change, changeType, trend, trendUp, icon: Icon, iconColor = 'violet', className }: KPICardProps) {
  const resolvedChangeType = changeType ?? (trendUp === true ? 'positive' : trendUp === false ? 'negative' : 'neutral');
  const resolvedChange = change ?? trend;

  return (
    <div className={cn(
      'relative bg-white border border-slate-200 rounded-xl p-5 transition-shadow duration-200',
      'hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]',
      className
    )}>
      <div className="flex items-start justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
            {value}
          </p>
          {resolvedChange && (
            <p className={cn('text-xs mt-1.5', changeColors[resolvedChangeType])}>
              {resolvedChange}
            </p>
          )}
        </div>
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3',
          iconColors[iconColor as keyof typeof iconColors] || iconColors.amber
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Micro-accent ribbon en la barra superior (aparece en hover) */}
      <span className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-amber-500/40 scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
    </div>
  );
}
