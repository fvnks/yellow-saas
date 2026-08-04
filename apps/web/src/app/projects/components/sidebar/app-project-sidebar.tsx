'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { projectSidebarItems } from "@/navigation/sidebar/project-sidebar-items";
import ProjectSidebarFooterMenu from "./project-sidebar-footer-menu";
import ProjectSidebarBrandHeader from "./project-sidebar-header";
import ProjectSidebarNavigation from "./project-sidebar-navigation";

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

export function ProjectSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '', role: 'member' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSidebarBrandHeader />
        <SidebarSeparator className="mx-3 opacity-30" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 mb-1">
          <SidebarMenuItem>
            <Link href="/select">
              <SidebarMenuButton
                tooltip="Volver al selector"
                className="rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al selector</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <ProjectSidebarNavigation sidebarItems={projectSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-3 opacity-30" />
        <div className="px-2 py-1">
          <ProjectSidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
