'use client'; import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import SidebarFooterMenu from "./sidebar-footer-menu";
import SidebarBrandHeader from "./sidebar-header";
import SidebarNavigation from "./sidebar-navigation";
import { getCompanyIdFromToken } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

const DEFAULT_USER = { name: 'Usuario', email: '', avatar: '', role: 'member' };
let cachedCookie = '';
let cachedUser = DEFAULT_USER;

function getUserFromCookie() {
  if (typeof window === 'undefined') return DEFAULT_USER;
  const cookies = document.cookie.split(';');
  const profileCookie = cookies.find(c => c.trim().startsWith('yellow-profile='));
  if (profileCookie) {
    try {
      const decoded = decodeURIComponent(profileCookie.split('=')[1]);
      const profile = JSON.parse(decoded);
      return { name: profile.name || 'Usuario', email: profile.email || '', avatar: profile.avatar || '', role: profile.role || 'member' };
    } catch {}
  }
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return DEFAULT_USER;
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { name: payload.name || 'Usuario', email: payload.email || '', avatar: '', role: payload.role || 'member' };
  } catch {
    return DEFAULT_USER;
  }
}

function getUserSnapshot() {
  if (typeof window === 'undefined') return DEFAULT_USER;
  if (document.cookie === cachedCookie) return cachedUser;
  cachedCookie = document.cookie;
  cachedUser = getUserFromCookie();
  return cachedUser;
}

function getServerUserSnapshot() {
  return DEFAULT_USER;
}

function subscribeToCookie() {
  return () => {};
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useSyncExternalStore(subscribeToCookie, getUserSnapshot, getServerUserSnapshot);
  const companyId = getCompanyIdFromToken();
  const modulesQuery = useQuery({
    queryKey: ['company-modules', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/modules`);
      if (!res.ok) throw new Error('No se pudieron cargar los módulos');
      return res.json();
    },
  });
  const activatedModules = useMemo(
    () =>
      new Set<string>(
        (modulesQuery.data?.data?.modules || [])
          .filter((m: any) => m.status === 'active')
          .map((m: any) => m.module_name)
      ),
    [modulesQuery.data]
  );
  const filteredSidebarItems = useMemo(() => {
    if (activatedModules.size === 0) return sidebarItems;
    return sidebarItems.filter(group => {
      if (!group.requiredModule) return true;
      return activatedModules.has(group.requiredModule);
    });
  }, [activatedModules]);

  return (
    <Sidebar className="border-r border-border" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrandHeader />
        <SidebarSeparator className="mx-3 bg-border" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 mb-1 space-y-0.5">
          <SidebarMenuItem>
            <Link href="/select">
              <SidebarMenuButton tooltip="Volver al selector" className="rounded-xl transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-muted">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al selector</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarNavigation sidebarItems={filteredSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-3 bg-border" />
        <div className="px-2 py-1">
          <SidebarFooterMenu user={user} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
