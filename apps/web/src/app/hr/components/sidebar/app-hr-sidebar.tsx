'use client';

import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { hrSidebarItems } from "@/navigation/sidebar/hr-sidebar-items";
import HRSidebarBrandHeader from "./hr-sidebar-header";
import HRSidebarNavigation from "./hr-sidebar-navigation";
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';

function getUserFromCookie() {
  if (typeof window === 'undefined') return { name: 'Usuario', email: '', avatar: '', role: 'Admin RRHH' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: 'Usuario', email: '', avatar: '', role: 'Admin RRHH' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || 'Usuario',
      email: payload.email || '',
      avatar: '',
      role: 'Admin RRHH',
    };
  } catch {
    return { name: 'Usuario', email: '', avatar: '', role: 'Admin RRHH' };
  }
}

export function HRSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '', role: 'Admin RRHH' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <HRSidebarBrandHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>

      <SidebarContent className="bg-[#0F172A] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <ModuleSidebarBackButton moduleKey="hr" />
        <HRSidebarNavigation sidebarItems={hrSidebarItems} />
      </SidebarContent>

      <SidebarFooter className="bg-[#0F172A] p-3 border-t border-slate-800/80">
        <ModuleSidebarFooter moduleKey="hr" user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
