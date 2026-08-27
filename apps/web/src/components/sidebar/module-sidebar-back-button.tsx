'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MODULE_SIDEBAR_THEMES, ModuleType } from '@/lib/sidebar-theme';

interface Props {
  moduleKey: ModuleType;
  label?: string;
  href?: string;
}

export default function ModuleSidebarBackButton({ moduleKey, label = 'Volver a Módulos', href = '/select' }: Props) {
  const theme = MODULE_SIDEBAR_THEMES[moduleKey];

  return (
    <div className="px-2 mb-2">
      <Link
        href={href}
        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800/80 transition-colors group-data-[collapsible=icon]:justify-center"
      >
        <ArrowLeft className={`w-4 h-4 shrink-0 ${theme.backIconColorClass}`} />
        <span className="group-data-[collapsible=icon]:hidden text-xs font-medium">{label}</span>
      </Link>
    </div>
  );
}
