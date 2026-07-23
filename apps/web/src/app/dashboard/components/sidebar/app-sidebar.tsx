'use client';

import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import SidebarFooterMenu from "./sidebar-footer-menu";
import SidebarBrandHeader from "./sidebar-header";
import SidebarNavigation from "./sidebar-navigation";

function getUserFromCookie() {
  if (typeof window === 'undefined') return { name: 'Usuario', email: '', avatar: '' };
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return { name: 'Usuario', email: '', avatar: '' };
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name || 'Usuario',
      email: payload.email || '',
      avatar: '',
    };
  } catch {
    return { name: 'Usuario', email: '', avatar: '' };
  }
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: 'Usuario', email: '', avatar: '' });

  useEffect(() => {
    setUser(getUserFromCookie());
  }, []);

  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrandHeader />
        <SidebarSeparator className="mx-3 opacity-30" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation sidebarItems={sidebarItems} />
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
