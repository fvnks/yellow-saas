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
              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5'
              : 'border-border bg-card dark:border-border dark:bg-card/50'
          )}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-panel-${index}`}
            className="flex items-center justify-between w-full p-5 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                openIndex === index ? 'text-blue-600' : 'text-muted-foreground'
              )} />
              <span className="text-sm font-semibold text-foreground dark:text-white">
                {item.question}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            id={`faq-panel-${index}`}
            role="region"
            aria-label={item.question}
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <p className="px-5 pb-5 pl-13 text-sm text-foreground dark:text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
