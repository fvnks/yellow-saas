'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, Plus, BarChart3, Settings, Monitor, Package, ArrowDownUp, Receipt, History, ListChecks, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { RefreshProvider } from '@/components/recetas/RefreshContext';

function RecetasSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/recetas', label: 'Recetas', icon: ListChecks },
    { href: '/recetas/inventory', label: 'Inventario', icon: Package },
    { href: '/recetas/new', label: 'Nueva Receta', icon: Plus },
    { href: '/recetas/produce', label: 'Producir', icon: Settings },
    { href: '/recetas/stock', label: 'Entrada Stock', icon: ArrowDownUp },
    { href: '/recetas/expenses', label: 'Gastos', icon: Receipt },
    { href: '/recetas/sales', label: 'Historial Ventas', icon: History },
    { href: '/recetas/settings', label: 'Config Stock', icon: BarChart3 },
    { href: '/recetas/pos', label: 'POS', icon: Monitor },
  ];

  return (
    <div className="w-60 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <Link href="/recetas" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Recetas</p>
            <p className="text-[9px] text-slate-400">Recetas y producción</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <Link href="/select"
          className="flex items-center gap-2 px-3 py-2 mb-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al selector
        </Link>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.href === '/recetas'
            ? pathname === '/recetas'
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function RecetasLayout({ children }: { children: ReactNode }) {
  return (
    <RefreshProvider>
      <main className="bg-slate-50 min-h-screen transition-colors">
        <Toaster position="top-right" richColors closeButton />
        <RecetasSidebar />
        <div className="ml-60">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-2 px-4">
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-slate-500">Recetas</span>
            </div>
            <div className="ml-auto pr-4">
              <ThemeToggle />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </div>
      </main>
    </RefreshProvider>
  );
}
