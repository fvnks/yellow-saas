'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
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
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <SidebarBrandHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>
      <SidebarContent className="bg-[#0F172A] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <SidebarMenu className="px-2 mb-2 space-y-1">
          <SidebarMenuItem>
            <Link href="/select">
              <SidebarMenuButton
                tooltip="Cambiar de Empresa / Selector"
                className="rounded-xl transition-all duration-150 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 group-data-[collapsible=icon]:justify-center"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium">Volver a Empresas</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarNavigation sidebarItems={filteredSidebarItems} />
      </SidebarContent>
      <SidebarFooter className="bg-[#0F172A] pb-3">
        <SidebarSeparator className="mx-3 bg-slate-800/80 mb-2" />
        <div className="px-1 py-0.5">
          <SidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}