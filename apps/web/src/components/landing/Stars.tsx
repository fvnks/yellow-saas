import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarsProps {
  rating?: number;
  className?: string;
}

export function Stars({ rating = 5, className }: StarsProps) {
  return (
    <div className={cn('flex gap-1', className)} aria-hidden="true">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}
