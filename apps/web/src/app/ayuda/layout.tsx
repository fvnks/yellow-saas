'use client';

import { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy, BookOpen, Ticket, Search, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { getCompanyIdFromToken } from '@/lib/api-client';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';
import { MODULE_SIDEBAR_THEMES } from '@/lib/sidebar-theme';

function AyudaSidebar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const seenTicketsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const theme = MODULE_SIDEBAR_THEMES.ayuda;

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchSummary = async () => {
    const companyId = getCompanyIdFromToken();
    const token = getToken();
    if (!companyId || !token) return;
    try {
      const res = await fetch(`/api/companies/${companyId}/support/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) return;

      setUnread(Number(data.data.unread) || 0);

      const isFirstLoad = !initializedRef.current;
      initializedRef.current = true;

      const recent = data.data.recent || [];
      for (const t of recent) {
        if (seenTicketsRef.current.has(t.id)) continue;
        seenTicketsRef.current.add(t.id);
        if (!isFirstLoad) {
          toast.info('Nueva respuesta de soporte', {
            description: t.subject,
            action: { label: 'Ver', onClick: () => (window.location.href = `/ayuda/tickets/${t.id}`) },
          });
        }
      }
    } catch (err) {
      console.error('Failed to load support summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 20000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/ayuda', label: 'Centro de Ayuda', icon: BookOpen },
    { href: '/ayuda/tickets', label: 'Mis Tickets Soporte', icon: Ticket },
  ];

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return navItems;
    return navItems.filter(item => item.label.toLowerCase().includes(query));
  }, [navItems, searchQuery]);

  return (
    <div className="w-64 bg-[#0F172A] border-r border-slate-800 h-screen fixed left-0 top-0 z-40 flex flex-col text-slate-300 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
        <ModuleSidebarHeader moduleKey="ayuda" icon={LifeBuoy} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <ModuleSidebarBackButton moduleKey="ayuda" />

        {/* Quick Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en Ayuda..."
            className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 text-slate-400 hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2 text-[9px] font-mono font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">⌘K</span>
          )}
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 pt-2">Soporte & Documentación</p>

        <div className="space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = item.href === '/ayuda'
              ? pathname === '/ayuda'
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-sm shadow-emerald-500/10`
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? theme.iconActiveColorClass : 'text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.href === '/ayuda/tickets' && unread > 0 && (
                  <span className="ml-auto bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0F172A]">
        <ModuleSidebarFooter moduleKey="ayuda" user={{ name: 'Usuario Soporte', role: 'Atención al Cliente' }} />
      </div>
    </div>
  );
}

export default function AyudaLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <AyudaSidebar />
      <div className="ml-64">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" /> Centro de Ayuda
            </span>
            <span className="text-xs text-slate-500">Base de Conocimientos y Consultas</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </main>
  );
}
