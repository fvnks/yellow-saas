import { Car, Users, Clock, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: typeof Car;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  className = '',
}: StatCardProps) {
  return (
    <div className={`
      bg-surface-card rounded-2xl p-6 shadow-card hover:shadow-card-hover
      border border-surface-border transition-shadow duration-200
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-label font-medium text-ink-muted uppercase tracking-wider">
            {title}
          </p>
          <p className="text-metric font-bold text-ink tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-body font-medium text-ink-muted">{subtitle}</p>
          )}
          {trendValue && (
            <p className={`text-body font-medium flex items-center gap-1 ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-ink-muted'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        <div className="p-3 bg-brand-glow rounded-xl border border-brand/20">
          <Icon className="w-5 h-5 text-brand-dark" />
        </div>
      </div>
    </div>
  );
}