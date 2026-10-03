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
            'rounded-3xl border transition-all duration-300',
            openIndex === index
              ? 'border-sunshine/30 bg-sunshine/10'
              : 'border-mist bg-snow'
          )}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-panel-${index}`}
            className="flex items-center justify-between w-full p-5 text-left cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <HelpCircle className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                openIndex === index ? 'text-sunshine-dark' : 'text-iron'
              )} />
              <span className="text-sm font-semibold text-ink">
                {item.question}
              </span>
            </span>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-iron transition-transform duration-300 flex-shrink-0',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            id={`faq-panel-${index}`}
            role="region"
            aria-label={item.question}
            className={cn(
              'grid transition-all duration-300',
              openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden min-h-0">
              <p className="px-5 pb-5 pl-12 text-sm text-slate-text leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}