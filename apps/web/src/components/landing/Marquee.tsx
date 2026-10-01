'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';

interface MarqueeProps {
 children: ReactNode[];
 className?: string;
 speed?: number;
 reverse?: boolean;
}

export function Marquee({ children, className, speed = 30, reverse = false }: MarqueeProps) {
 const [shouldAnimate, setShouldAnimate] = useState(true);

 useEffect(() => {
 const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
 const handleChange = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches);
 setShouldAnimate(!mediaQuery.matches);
 mediaQuery.addEventListener('change', handleChange);
 return () => mediaQuery.removeEventListener('change', handleChange);
 }, []);

 return (
 <div className={cn('overflow-hidden', className)}>
 <div
 className={cn('flex gap-8 w-max', shouldAnimate ? 'animate-marquee' : '')}
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
