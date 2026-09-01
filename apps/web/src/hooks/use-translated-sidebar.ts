'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { NavGroup } from '@/navigation/sidebar/sidebar-items';

function translateIfNeeded(t: (key: string) => string, value: string): string {
  // If the value matches a known nav key, translate it
  return t(`nav.${value}`) !== `nav.${value}` ? t(`nav.${value}`) : value;
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
