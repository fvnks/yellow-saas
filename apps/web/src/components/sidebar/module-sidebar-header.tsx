'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import { MODULE_SIDEBAR_THEMES, ModuleType } from '@/lib/sidebar-theme';

interface Props {
  moduleKey: ModuleType;
  icon?: LucideIcon;
}

export default function ModuleSidebarHeader({ moduleKey, icon: Icon }: Props) {
  const theme = MODULE_SIDEBAR_THEMES[moduleKey];

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
      <Link
        href="/select"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 shrink-0 hover:scale-105 transition-transform"
      >
        <Image src="/logo/yellow-cube.svg" alt="Yellow ERP" width={28} height={28} className="drop-shadow-sm" />
      </Link>

      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">Yellow ERP</span>
          <span
            className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${theme.headerBadgeBg} ${theme.headerBadgeText} ${theme.headerBadgeBorder}`}
          >
            {Icon && <Icon className="w-2.5 h-2.5 shrink-0" />}
            {theme.badgeLabel}
          </span>
        </div>
        <p className="text-xs font-bold text-slate-100 truncate mt-0.5">{theme.subtitle}</p>
      </div>
    </div>
  );
}
