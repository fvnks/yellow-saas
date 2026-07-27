'use client';

import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { hrSidebarItems } from "@/navigation/sidebar/hr-sidebar-items";
import HRSidebarFooterMenu from "./hr-sidebar-footer-menu";
import HRSidebarBrandHeader from "./hr-sidebar-header";
import HRSidebarNavigation from "./hr-sidebar-navigation";

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

export function HRSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '', role: 'member' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <HRSidebarBrandHeader />
        <SidebarSeparator className="mx-3 opacity-30" />
      </SidebarHeader>
      <SidebarContent>
        <HRSidebarNavigation sidebarItems={hrSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-3 opacity-30" />
        <div className="px-2 py-1">
          <HRSidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
