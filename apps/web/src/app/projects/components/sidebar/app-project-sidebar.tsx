'use client';

import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { projectSidebarItems } from "@/navigation/sidebar/project-sidebar-items";
import ProjectSidebarBrandHeader from "./project-sidebar-header";
import ProjectSidebarNavigation from "./project-sidebar-navigation";
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';

function getUserFromCookie() {
  if (typeof window === 'undefined') return { name: 'Usuario', email: '', avatar: '', role: 'Gestor Proyectos' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: 'Usuario', email: '', avatar: '', role: 'Gestor Proyectos' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || 'Usuario',
      email: payload.email || '',
      avatar: '',
      role: 'Gestor Proyectos',
    };
  } catch {
    return { name: 'Usuario', email: '', avatar: '', role: 'Gestor Proyectos' };
  }
}

export function ProjectSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '', role: 'Gestor Proyectos' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <ProjectSidebarBrandHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>

      <SidebarContent className="bg-[#0F172A] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <ModuleSidebarBackButton moduleKey="proyectos" />
        <ProjectSidebarNavigation sidebarItems={projectSidebarItems} />
      </SidebarContent>

      <SidebarFooter className="bg-[#0F172A] p-3 border-t border-slate-800/80">
        <ModuleSidebarFooter moduleKey="proyectos" user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
