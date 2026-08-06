'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  Shield, Building2, Users, KeyRound, Settings, LogOut,
  LayoutDashboard, Menu, X, UserCog, Headphones, Bell, CreditCard, ScrollText, BookOpen
} from 'lucide-react';
import { useAuthToken } from '@/hooks/use-auth-token';

const sidebarItems = [
  { label: 'Plataforma', items: [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Empresas', path: '/admin/companies', icon: Building2 },
    { title: 'Usuarios', path: '/admin/users', icon: Users },
    { title: 'Accesos', path: '/admin/grants', icon: KeyRound },
  ]},
  { label: 'Operaciones', items: [
    { title: 'Soporte', path: '/admin/support', icon: Headphones },
    { title: 'Centro de Ayuda', path: '/admin/support/faq', icon: BookOpen },
    { title: 'Notificaciones', path: '/admin/notifications', icon: Bell },
    { title: 'Billing', path: '/admin/billing', icon: CreditCard },
  ]},
  { label: 'Sistema', items: [
    { title: 'Audit Log', path: '/admin/audit', icon: ScrollText },
    { title: 'Configuración', path: '/admin/settings', icon: Settings },
  ]},
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-primary border-r border-border z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-white block truncate">Yellow ERP</span>
              <span className="text-[9px] text-primary/70 font-semibold uppercase tracking-wider">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-6">
          {sidebarItems.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary/20 text-primary/70'
                          : 'text-muted-foreground hover:text-white hover:bg-primary/90/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.title}</span>}
                      {item.path === '/admin/support' && supportPending > 0 && (
                        <span className={`ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[9px] font-bold ${
                          supportUnassigned > 0
                            ? 'bg-rose-500 text-white'
                            : 'bg-primary text-white'
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
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{userName?.charAt(0) || 'S'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-rose-400 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top bar */}
        <header className="h-16 bg-primary/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">Super Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/90"
            >
              Ver Dashboard
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
