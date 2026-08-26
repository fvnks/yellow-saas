'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
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
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <MiCuentaSidebarBrandHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>
      <SidebarContent className="bg-[#0F172A] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <SidebarMenu className="px-2 mb-2 space-y-1">
          <SidebarMenuItem>
            <Link href="/select">
              <SidebarMenuButton
                tooltip="Volver al selector"
                className="rounded-xl transition-all duration-150 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 group-data-[collapsible=icon]:justify-center"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium">Volver a Empresas</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <Suspense fallback={<div className="p-2 text-xs text-slate-400">Cargando...</div>}>
          <MiCuentaSidebarNavigation sidebarItems={miCuentaSidebarItems} />
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="bg-[#0F172A] pb-3">
        <SidebarSeparator className="mx-3 bg-slate-800/80 mb-2" />
        <div className="px-1 py-0.5">
          <MiCuentaSidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}