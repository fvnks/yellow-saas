'use client';

import { cn } from '@/lib/utils';
import { Stars } from './Stars';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({ quote, author, role, company, rating = 5, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-[380px] rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600',
        className
      )}
    >
      <Stars rating={rating} className="mb-4" />
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground dark:text-white">{author}</p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
}
