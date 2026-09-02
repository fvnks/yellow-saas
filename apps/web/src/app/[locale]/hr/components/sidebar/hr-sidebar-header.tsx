'use client';

import { Users } from 'lucide-react';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';

export default function HRSidebarBrandHeader() {
  return <ModuleSidebarHeader moduleKey="hr" icon={Users} />;
}
