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
        'flex-shrink-0 w-[380px] rounded-3xl border border-mist bg-snow p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-fog',
        className
      )}
    >
      <Stars rating={rating} className="mb-4" />
      <p className="text-sm text-ink leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sunshine/10 flex items-center justify-center text-sunshine-dark font-bold text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{author}</p>
          <p className="text-xs text-slate-text">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
}