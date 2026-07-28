'use client';

import { Suspense, useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { miCuentaSidebarItems } from "@/navigation/sidebar/mi-cuenta-sidebar-items";
import MiCuentaSidebarFooterMenu from "./mi-cuenta-sidebar-footer-menu";
import MiCuentaSidebarBrandHeader from "./mi-cuenta-sidebar-header";
import MiCuentaSidebarNavigation from "./mi-cuenta-sidebar-navigation";

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

export function MiCuentaSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '', role: 'member' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <MiCuentaSidebarBrandHeader />
        <SidebarSeparator className="mx-3 opacity-30" />
      </SidebarHeader>
      <SidebarContent>
        <Suspense fallback={<div className="p-2 text-xs text-slate-400">Cargando...</div>}>
          <MiCuentaSidebarNavigation sidebarItems={miCuentaSidebarItems} />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-3 opacity-30" />
        <div className="px-2 py-1">
          <MiCuentaSidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
