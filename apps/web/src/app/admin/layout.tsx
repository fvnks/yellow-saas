'use client';

import { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  Shield, Building2, Users, KeyRound, Settings, LogOut,
  LayoutDashboard, Menu, X, Headphones, Bell, CreditCard, ScrollText, BookOpen, Search
} from 'lucide-react';
import { useAuthToken } from '@/hooks/use-auth-token';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [supportPending, setSupportPending] = useState(0);
  const [supportUnassigned, setSupportUnassigned] = useState(0);
  const seenTicketsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const session = useAuthToken();

  const fetchSupportSummary = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
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
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100 select-none">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-[#0F172A] border-r border-slate-800 z-50 transition-all duration-300 shadow-xl flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-3 border-b border-slate-800/80 bg-slate-900/40">
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 shrink-0 hover:scale-105 transition-transform">
            <Image src="/logo/yellow-cube.svg" alt="Yellow Admin" width={28} height={28} className="drop-shadow-sm" />
          </Link>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">Yellow ERP</span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded-full border border-rose-500/20">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <p className="text-xs font-bold text-slate-100 truncate mt-0.5">Control Global SaaS</p>
            </div>
          )}
        </div>

        {/* Quick Search */}
        {sidebarOpen && (
          <div className="p-3 pb-0">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en Admin..."
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
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {filteredSidebarItems.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-slate-800 text-white font-bold border-l-4 border-[#FACC15] shadow-sm shadow-amber-500/10'
                          : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.title}</span>}
                      {item.path === '/admin/support' && supportPending > 0 && (
                        <span className={`ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[9px] font-black ${
                          supportUnassigned > 0
                            ? 'bg-rose-500 text-white'
                            : 'bg-[#FACC15] text-slate-950'
                        }`}>
                          {supportPending}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FACC15] via-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-inner text-slate-950 font-black text-xs">
                {userName?.charAt(0) || 'S'}
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                <span className="inline-flex items-center mt-0.5 px-1.5 py-0 rounded-full text-[8px] uppercase tracking-wider font-black bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Super Admin
                </span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors p-1" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top bar */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-[#FACC15]" />
              <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">Super Admin Console</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-all px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm"
            >
              Ir al ERP
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}