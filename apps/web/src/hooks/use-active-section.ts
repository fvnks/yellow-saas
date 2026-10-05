'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[], options?: {
  rootMargin?: string;
  threshold?: number;
}) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        {
          rootMargin: options?.rootMargin ?? '-20% 0px -70% 0px',
          threshold: options?.threshold ?? 0,
        }
      );

      observer.observe(el);
      return observer;
    }).filter(Boolean) as IntersectionObserver[];

    return () => {
      observers.forEach((o) => o?.disconnect());
    };
  }, [sectionIds, options?.rootMargin, options?.threshold]);

  return activeId;
}