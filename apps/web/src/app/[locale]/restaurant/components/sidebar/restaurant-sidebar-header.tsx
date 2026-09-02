'use client';

import { UtensilsCrossed } from 'lucide-react';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';

export default function RestaurantSidebarHeader() {
  return <ModuleSidebarHeader moduleKey="restaurante" icon={UtensilsCrossed} />;
}
