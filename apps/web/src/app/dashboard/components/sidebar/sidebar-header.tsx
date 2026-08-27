'use client';

import { ShieldCheck } from 'lucide-react';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';

export default function SidebarBrandHeader() {
  return <ModuleSidebarHeader moduleKey="dashboard" icon={ShieldCheck} />;
}
