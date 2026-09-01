'use client';

import { useEffect, useState, useMemo } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { useTranslations } from 'next-intl';
import SidebarBrandHeader from "./sidebar-header";
import SidebarNavigation from "./sidebar-navigation";
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';
import { getApiClient } from '@/lib/api-client';
import { useTranslatedSidebar } from '@/hooks/use-translated-sidebar';

function getUserFromCookie(getText: (key: string) => string) {
  if (typeof window === 'undefined') return { name: getText('usuario'), email: '', avatar: '', role: 'Admin ERP' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: getText('usuario'), email: '', avatar: '', role: 'Admin ERP' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || getText('usuario'),
      email: payload.email || '',
      avatar: '',
      role: 'Admin ERP',
    };
  } catch {
    return { name: getText('usuario'), email: '', avatar: '', role: 'Admin ERP' };
  }
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('common');
  const [user, setUser] = useState({ name: t('usuario'), email: '', avatar: '', role: 'Admin ERP' });
  const [activatedModules, setActivatedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUser(getUserFromCookie(t));

    const api = getApiClient();
    const companyId = api['companyId'];
    const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
    if (companyId && token) {
      fetch(`/api/companies/${companyId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          const active = new Set<string>(
            (data.data?.modules || [])
              .filter((m: any) => m.status === 'active')
              .map((m: any) => m.module_name)
          );
          setActivatedModules(active);
        })
        .catch(() => {});
    }
  }, []);

  const translatedItems = useTranslatedSidebar(sidebarItems);

  const filteredSidebarItems = useMemo(() => {
    if (activatedModules.size === 0) return translatedItems;
    return translatedItems.filter(group => {
      if (!group.requiredModule) return true;
      return activatedModules.has(group.requiredModule);
    });
  }, [activatedModules, translatedItems]);

  return (
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <SidebarBrandHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>

      <SidebarContent className="bg-[#0F172A]">
        <ModuleSidebarBackButton moduleKey="dashboard" />
        <SidebarNavigation sidebarItems={filteredSidebarItems} />
      </SidebarContent>

      <SidebarFooter className="bg-[#0F172A] p-3 border-t border-slate-800/80">
        <ModuleSidebarFooter moduleKey="dashboard" user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
