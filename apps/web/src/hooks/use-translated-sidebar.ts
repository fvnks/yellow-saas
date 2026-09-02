'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { NavGroup } from '@/navigation/sidebar/sidebar-items';

function translateIfNeeded(t: (key: string) => string, value: string): string {
  try {
    const translated = t(`nav.${value}`);
    return translated !== `nav.${value}` ? translated : value;
  } catch {
    return value;
  }
}

export function useTranslatedSidebar(items: NavGroup[]): NavGroup[] {
  const t = useTranslations('nav');

  return useMemo(() => {
    const translateGroup = (group: NavGroup): NavGroup => ({
      ...group,
      label: translateIfNeeded(t, group.label || ''),
      items: group.items.map(item => ({
        ...item,
        title: translateIfNeeded(t, item.title),
        subItems: item.subItems?.map(sub => ({
          ...sub,
          title: translateIfNeeded(t, sub.title),
          subItems: sub.subItems?.map(nested => ({
            ...nested,
            title: translateIfNeeded(t, nested.title),
          })),
        })),
      })),
    });

    return items.map(translateGroup);
  }, [items, t]);
}
