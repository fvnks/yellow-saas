'use client';

import { MODULE_SIDEBAR_THEMES, ModuleType } from '@/lib/sidebar-theme';
import { useTranslations } from 'next-intl';

interface Props {
  moduleKey: ModuleType;
  user: { name: string; email?: string; role?: string };
}

export default function ModuleSidebarFooter({ moduleKey, user }: Props) {
  const t = useTranslations('common');
  const theme = MODULE_SIDEBAR_THEMES[moduleKey];
  const initials = (user.name || 'Admin').slice(0, 2).toUpperCase();
  const defaultRole = t('usuario');

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 group-data-[collapsible=icon]:justify-center">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${theme.avatarClass}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
        <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
        <p className="text-[10px] text-slate-400 truncate">{user.role || defaultRole}</p>
      </div>
    </div>
  );
}
