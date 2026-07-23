'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'rounded-xl border transition-all duration-300',
            openIndex === index
              ? 'border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5'
              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
          )}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex items-center justify-between w-full p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                openIndex === index ? 'text-amber-500' : 'text-slate-400'
              )} />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.question}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <p className="px-5 pb-5 pl-13 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
