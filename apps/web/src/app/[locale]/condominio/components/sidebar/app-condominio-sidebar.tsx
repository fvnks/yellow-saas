'use client';

import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import CondominioSidebarHeader from "./condominio-sidebar-header";
import CondominioSidebarNavigation from "./condominio-sidebar-navigation";
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';

function getUserFromCookie() {
  if (typeof window === 'undefined') return { name: 'Administrador', email: '', role: 'Admin Condominio' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: 'Administrador', email: '', role: 'Admin Condominio' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || 'Administrador',
      email: payload.email || '',
      role: 'Admin Condominio',
    };
  } catch {
    return { name: 'Administrador', email: '', role: 'Admin Condominio' };
  }
}

export function AppCondominioSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Administrador', email: '', role: 'Admin Condominio' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <CondominioSidebarHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>

      <SidebarContent className="bg-[#0F172A]">
        <ModuleSidebarBackButton moduleKey="condominio" />
        <CondominioSidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="bg-[#0F172A] p-3 border-t border-slate-800/80">
        <ModuleSidebarFooter moduleKey="condominio" user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
