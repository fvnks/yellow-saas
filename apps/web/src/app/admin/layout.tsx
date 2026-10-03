'use client';

import { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { toast, Toaster } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Building2, Users, KeyRound, Settings,
  LayoutDashboard, Headphones, Bell, CreditCard, ScrollText, BookOpen, Search, X
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/animate-ui/components/radix/sidebar';
import { getAuthToken } from '@/lib/auth-token';
import { useAuthToken } from '@/hooks/use-auth-token';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';
import { MODULE_SIDEBAR_THEMES } from '@/lib/sidebar-theme';
import esMessages from '@/messages/es.json';

const sidebarItems = [
  { label: 'Plataforma', items: [
    { title: 'Dashboard ERP', path: '/admin', icon: LayoutDashboard },
    { title: 'Empresas SaaS', path: '/admin/companies', icon: Building2 },
    { title: 'Usuarios Globales', path: '/admin/users', icon: Users },
    { title: 'Accesos & Roles', path: '/admin/grants', icon: KeyRound },
  ]},
  { label: 'Operaciones', items: [
    { title: 'Soporte Clientes', path: '/admin/support', icon: Headphones },
    { title: 'Base Conocimiento', path: '/admin/support/faq', icon: BookOpen },
    { title: 'Notificaciones', path: '/admin/notifications', icon: Bell },
    { title: 'Facturación SaaS', path: '/admin/billing', icon: CreditCard },
  ]},
  { label: 'Sistema', items: [
    { title: 'Audit Log SII', path: '/admin/audit', icon: ScrollText },
    { title: 'Configuración System', path: '/admin/settings', icon: Settings },
  ]},
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [supportPending, setSupportPending] = useState(0);
  const [supportUnassigned, setSupportUnassigned] = useState(0);
  const seenTicketsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const session = useAuthToken();
  const theme = MODULE_SIDEBAR_THEMES.admin;

  const fetchSupportSummary = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch('/api/super-admin/support/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) return;
      setSupportPending(Number(data.data.pending) || 0);
      setSupportUnassigned(Number(data.data.unassigned) || 0);

      const isFirstLoad = !initializedRef.current;
      initializedRef.current = true;

      const recent = data.data.recent || [];
      for (const t of recent) {
        if (seenTicketsRef.current.has(t.id)) continue;
        seenTicketsRef.current.add(t.id);
        if (!isFirstLoad) {
          toast.info(`Nuevo ticket de soporte: ${t.subject}`, {
            description: `${t.company_name} · ${String(t.priority).toUpperCase()} · ${new Date(t.created_at).toLocaleString('es-CL')}`,
            action: { label: 'Ver', onClick: () => window.open('/admin/support', '_self') },
          });
        }
      }
    } catch (err) {
      console.error('Failed to load support summary:', err);
    }
  };

  useEffect(() => {
    if (!session || session.role_type !== 'super_admin') {
      router.push('/login');
      return;
    }

    setUserName(session.name || 'Super Admin');
    setUserEmail(session.email || '');

    fetchSupportSummary();
    const interval = setInterval(fetchSupportSummary, 20000);
    return () => clearInterval(interval);
  }, [router, session]);

  const isActive = (path: string) => {
    const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/)/, '');
    if (path === '/admin') return cleanPathname === '/admin';
    if (cleanPathname === path) return true;
    const pathSegments = path.split('/').filter(Boolean);
    const pathnameSegments = cleanPathname.split('/').filter(Boolean);
    if (pathnameSegments.length === pathSegments.length + 1 && cleanPathname.startsWith(path + '/')) {
      return true;
    }
    return false;
  };

  const filteredSidebarItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sidebarItems;

    return sidebarItems
      .map((group) => {
        const matchingItems = group.items.filter((item) => item.title.toLowerCase().includes(query));
        if (matchingItems.length === 0) return null;
        return { ...group, items: matchingItems };
      })
      .filter(Boolean) as typeof sidebarItems;
  }, [searchQuery]);

  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
      <main className="bg-cloud min-h-screen text-ink transition-colors">
        <Toaster position="top-right" richColors closeButton />
        <SidebarProvider>
          <Sidebar className="border-r border-mist bg-snow text-ink select-none" collapsible="icon">
            <SidebarHeader className="bg-snow pt-3">
              <ModuleSidebarHeader moduleKey="admin" icon={Shield} />
              <div className="px-1 pt-2 group-data-[collapsible=icon]:hidden">
                <ModuleSidebarBackButton moduleKey="admin" />
                <div className="relative flex items-center mt-2">
                  <Search className="absolute left-2.5 w-3.5 h-3.5 text-iron pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar en Admin..."
                    className="w-full bg-cloud border border-mist text-xs text-ink placeholder:text-iron rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-sunshine-dark focus:ring-1 focus:ring-sunshine-dark/20 transition-all"
                  />
                  {searchQuery ? (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 text-iron hover:text-ink">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="absolute right-2 text-[9px] font-mono font-bold text-iron bg-mist/50 px-1.5 py-0.5 rounded">⌘K</span>
                  )}
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="bg-snow">
              {filteredSidebarItems.map((group) => (
                <SidebarGroup key={group.label}>
                  <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-iron px-3 group-data-[collapsible=icon]:hidden">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarMenu className="space-y-0.5 px-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={active}
                            tooltip={item.title}
                            asChild
                            className={
                              active
                                ? 'bg-cloud text-ink font-bold border-l-4 border-sunshine-dark shadow-xs rounded-xl py-2.5 px-3 text-xs'
                                : 'text-iron hover:text-ink hover:bg-cloud rounded-xl py-2.5 px-3 text-xs font-semibold'
                            }
                          >
                            <Link href={item.path} className="flex items-center gap-2.5 w-full">
                              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-sunshine-dark' : ''}`} />
                              <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                              {item.path === '/admin/support' && supportPending > 0 && (
                                <span className={`ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[9px] font-black group-data-[collapsible=icon]:hidden ${
                                  supportUnassigned > 0
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'bg-sunshine text-ink'
                                }`}>
                                  {supportPending}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroup>
              ))}
            </SidebarContent>

            <SidebarFooter className="bg-snow p-3 border-t border-mist">
              <ModuleSidebarFooter moduleKey="admin" user={{ name: userName || 'Super Admin', email: userEmail, role: 'Super Admin' }} />
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          <SidebarInset className="bg-cloud">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-mist bg-snow/90 backdrop-blur-xl px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-slate-text hover:text-ink" />
                <Separator orientation="vertical" className="h-4 bg-mist" />
                <div className="flex items-center gap-2 px-3 py-1 bg-cloud border border-mist rounded-xl">
                  <Shield className="w-3.5 h-3.5 text-sunshine-dark" />
                  <span className="text-[10px] font-black text-ink uppercase tracking-wider">Super Admin Console</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-iron hover:text-ink transition-all px-3.5 py-1.5 rounded-xl bg-cloud hover:bg-mist border border-mist shadow-sm"
                >
                  Ir al ERP
                </Link>
              </div>
            </header>
            <div className="p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </main>
    </NextIntlClientProvider>
  );
}
