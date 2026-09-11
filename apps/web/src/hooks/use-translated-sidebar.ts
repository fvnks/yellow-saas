'use client';

import { useMemo } from 'react';
import { NavGroup } from '@/navigation/sidebar/sidebar-items';

export function useTranslatedSidebar(items: NavGroup[]): NavGroup[] {
  return useMemo(() => items, [items]);
}
