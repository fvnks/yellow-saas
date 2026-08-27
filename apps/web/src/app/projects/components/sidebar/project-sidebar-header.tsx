'use client';

import { FolderKanban } from 'lucide-react';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';

export default function ProjectSidebarBrandHeader() {
  return <ModuleSidebarHeader moduleKey="proyectos" icon={FolderKanban} />;
}
