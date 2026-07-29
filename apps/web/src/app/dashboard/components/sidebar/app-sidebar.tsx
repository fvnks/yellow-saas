'use client';

import { useEffect, useState, useMemo } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { sidebarItems, NavGroup } from "@/navigation/sidebar/sidebar-items";
import SidebarFooterMenu from "./sidebar-footer-menu";
import SidebarBrandHeader from "./sidebar-header";
import SidebarNavigation from "./sidebar-navigation";
import { getApiClient } from '@/lib/api-client';

function getUserFromCookie() {
  if (typeof window === 'undefined') return { name: 'Usuario', email: '', avatar: '', role: 'member' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: 'Usuario', email: '', avatar: '', role: 'member' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || 'Usuario',
      email: payload.email || '',
      avatar: '',
      role: payload.role || 'member',
    };
  } catch {
    return { name: 'Usuario', email: '', avatar: '', role: 'member' };
  }
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '', role: 'member' });
  const [activatedModules, setActivatedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUser(getUserFromCookie());

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

  const filteredSidebarItems = useMemo(() => {
    if (activatedModules.size === 0) return sidebarItems;
    return sidebarItems.filter(group => {
      if (!group.requiredModule) return true;
      return activatedModules.has(group.requiredModule);
    });
  }, [activatedModules]);

  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrandHeader />
        <SidebarSeparator className="mx-3 opacity-30" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation sidebarItems={filteredSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-3 opacity-30" />
        <div className="px-2 py-1">
          <SidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
