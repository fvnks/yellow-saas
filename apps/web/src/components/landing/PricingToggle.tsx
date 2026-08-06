'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PricingToggleProps {
  monthlyLabel?: string;
  yearlyLabel?: string;
  onToggle: (isYearly: boolean) => void;
  className?: string;
}

export function PricingToggle({ monthlyLabel = 'Mensual', yearlyLabel = 'Anual', onToggle, className }: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(false);

  const handleToggle = () => {
    const newValue = !isYearly;
    setIsYearly(newValue);
    onToggle(newValue);
  };

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <span className={cn('text-sm font-medium transition-colors', !isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
        {monthlyLabel}
      </span>
      <button
        onClick={handleToggle}
        aria-pressed={isYearly}
        className={cn(
          'relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300',
          isYearly ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300',
            isYearly ? 'translate-x-[26px]' : 'translate-x-0.5'
          )}
        />
      </button>
      <span className={cn('text-sm font-medium transition-colors', isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
        {yearlyLabel}
        <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          -20%
        </span>
      </span>
    </div>
  );
}
