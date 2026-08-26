'use client';

import { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LifeBuoy, BookOpen, Ticket, ArrowLeft, Headphones, Search, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { getCompanyIdFromToken } from '@/lib/api-client';

function AyudaSidebar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const seenTicketsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

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
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Link href="/ayuda" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 shrink-0 hover:scale-105 transition-transform">
            <Image src="/logo/yellow-cube.svg" alt="Yellow Ayuda" width={28} height={28} className="drop-shadow-sm" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">Yellow ERP</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                <LifeBuoy className="w-2.5 h-2.5" /> Ayuda
              </span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate mt-0.5">Soporte & Base Conocimiento</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <Link href="/select"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800/80 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          Volver a Empresas
        </Link>

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

        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 pt-2">Atención & Consultas</p>

        <div className="space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = item.href === '/ayuda'
              ? pathname === '/ayuda'
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border-l-4 border-[#FACC15] shadow-sm shadow-amber-500/10'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}>
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item.label}</span>
                {item.href === '/ayuda/tickets' && unread > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[9px] font-black bg-[#FACC15] text-slate-950 shadow-sm">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <p className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
            Respuestas pendientes
          </p>
          <p className="text-lg font-black text-[#FACC15] mt-1">{unread} <span className="text-[10px] text-slate-400 font-normal">ticket(s)</span></p>
        </div>
      </nav>
    </div>
  );
}

export default function AyudaLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <AyudaSidebar />
      <div className="ml-64">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Centro de Ayuda & Soporte Técnico SII</span>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </main>
  );
}