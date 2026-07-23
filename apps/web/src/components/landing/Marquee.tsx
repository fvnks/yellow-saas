'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode[];
  className?: string;
  speed?: number;
  reverse?: boolean;
}

export function Marquee({ children, className, speed = 30, reverse = false }: MarqueeProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className="flex gap-8 animate-marquee w-max"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
