'use client';

import { User } from 'lucide-react';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';

export default function MiCuentaSidebarBrandHeader() {
  return <ModuleSidebarHeader moduleKey="micuenta" icon={User} />;
}
