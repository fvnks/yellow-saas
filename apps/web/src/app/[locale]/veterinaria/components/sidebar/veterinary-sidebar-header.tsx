'use client';

import React from 'react';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';
import { Stethoscope } from 'lucide-react';

export default function VeterinarySidebarHeader() {
  return <ModuleSidebarHeader moduleKey="veterinaria" icon={Stethoscope} />;
}
