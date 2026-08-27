'use client';

import { ReactNode, useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, Plus, BarChart3, Settings, Monitor, Package, ArrowDownUp, Receipt, History, ListChecks, Search, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { RefreshProvider } from '@/components/recetas/RefreshContext';
import ModuleSidebarHeader from '@/components/sidebar/module-sidebar-header';
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';
import { MODULE_SIDEBAR_THEMES } from '@/lib/sidebar-theme';

function RecetasSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const theme = MODULE_SIDEBAR_THEMES.recetas;

  const navItems = [
    { href: '/recetas', label: 'Recetas', icon: ListChecks },
    { href: '/recetas/inventory', label: 'Inventario BOM', icon: Package },
    { href: '/recetas/new', label: 'Nueva Receta', icon: Plus },
    { href: '/recetas/produce', label: 'Lotes Producir', icon: Settings },
    { href: '/recetas/stock', label: 'Entrada Stock', icon: ArrowDownUp },
    { href: '/recetas/expenses', label: 'Gastos / Insumos', icon: Receipt },
    { href: '/recetas/sales', label: 'Historial Producción', icon: History },
    { href: '/recetas/settings', label: 'Configuración Stock', icon: BarChart3 },
    { href: '/recetas/pos', label: 'Módulo POS', icon: Monitor },
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
        <ModuleSidebarHeader moduleKey="recetas" icon={FlaskConical} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <ModuleSidebarBackButton moduleKey="recetas" />

        {/* Quick Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en Recetas..."
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

        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 pt-2">Gestión de Producción</p>

        <div className="space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = item.href === '/recetas'
              ? pathname === '/recetas'
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-sm shadow-amber-500/10`
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? theme.iconActiveColorClass : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0F172A]">
        <ModuleSidebarFooter moduleKey="recetas" user={{ name: 'Operador BOM', role: 'Gestor Recetas' }} />
      </div>
    </div>
  );
}

export default function RecetasLayout({ children }: { children: ReactNode }) {
  return (
    <RefreshProvider>
      <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
        <Toaster position="top-right" richColors closeButton />
        <RecetasSidebar />
        <div className="ml-64">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <FlaskConical className="w-3.5 h-3.5 text-amber-600" /> Recetas / BOM
              </span>
              <span className="text-xs text-slate-500">Formulación y Órdenes de Producción</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </div>
      </main>
    </RefreshProvider>
  );
}
