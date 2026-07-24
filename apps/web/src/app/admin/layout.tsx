'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import {
  Shield, Building2, Users, KeyRound, Settings, LogOut,
  LayoutDashboard, Menu, X, UserCog, Headphones, Bell, CreditCard, ScrollText
} from 'lucide-react';

function getClientSession(): { role_type?: string; name?: string; email?: string } | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return null;
  const token = authCookie.split('=')[1];
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

const sidebarItems = [
  { label: 'Plataforma', items: [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Empresas', path: '/admin/companies', icon: Building2 },
    { title: 'Usuarios', path: '/admin/users', icon: Users },
    { title: 'Accesos', path: '/admin/grants', icon: KeyRound },
  ]},
  { label: 'Operaciones', items: [
    { title: 'Soporte', path: '/admin/support', icon: Headphones },
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

  useEffect(() => {
    const session = getClientSession();
    if (!session || session.role_type !== 'super_admin') {
      router.push('/super-admin/login');
      return;
    }

    setUserName(session.name || 'Super Admin');
    setUserEmail(session.email || '');
  }, [router]);

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/super-admin/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-white block truncate">Yellow ERP</span>
              <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-6">
          {sidebarItems.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
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
                          ? 'bg-indigo-600/20 text-indigo-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{userName?.charAt(0) || 'S'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Super Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
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
