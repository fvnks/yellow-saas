'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import CondominioSidebarHeader from "./condominio-sidebar-header";
import CondominioSidebarNavigation from "./condominio-sidebar-navigation";

function getUserFromCookie() {
  if (typeof window === 'undefined') return { name: 'Administrador', email: '', role: 'admin' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: 'Administrador', email: '', role: 'admin' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || 'Administrador',
      email: payload.email || '',
      role: payload.role || 'admin',
    };
  } catch {
    return { name: 'Administrador', email: '', role: 'admin' };
  }
}

export function AppCondominioSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Administrador', email: '', role: 'admin' });

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
        <SidebarMenu className="px-2 mb-2 space-y-1">
          <SidebarMenuItem>
            <Link href="/select">
              <SidebarMenuButton
                tooltip="Volver al selector"
                className="rounded-xl transition-all duration-150 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 group-data-[collapsible=icon]:justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden text-xs font-medium">Volver a Módulos</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <CondominioSidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="bg-[#0F172A] p-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 group-data-[collapsible=icon]:justify-center">
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-xs shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">Admin Condominio</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}