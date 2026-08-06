'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy, BookOpen, Ticket, ArrowLeft, Headphones } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { getCompanyIdFromToken } from '@/lib/api-client';

function AyudaSidebar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
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
    { href: '/ayuda/tickets', label: 'Mis Tickets', icon: Ticket },
  ];

  return (
    <div className="w-60 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <Link href="/ayuda" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Ayuda</p>
            <p className="text-[9px] text-slate-400">Soporte y FAQ</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <Link href="/select"
          className="flex items-center gap-2 px-3 py-2 mb-2 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al selector
        </Link>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.href === '/ayuda'
            ? pathname === '/ayuda'
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <Icon className="w-4 h-4" />
              {item.label}
              {item.href === '/ayuda/tickets' && unread > 0 && (
                <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[9px] font-bold bg-slate-900 text-white">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
        <p className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-400">
          <Headphones className="w-4 h-4" />
          Respuestas pendientes: {unread}
        </p>
      </nav>
    </div>
  );
}

export default function AyudaLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-slate-50 min-h-screen transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <AyudaSidebar />
      <div className="ml-60">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm text-slate-500">Ayuda y Soporte</span>
          </div>
          <div className="ml-auto pr-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </main>
  );
}