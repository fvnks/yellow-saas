'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

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
        'flex-shrink-0 w-[380px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600',
        className
      )}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{author}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
}
