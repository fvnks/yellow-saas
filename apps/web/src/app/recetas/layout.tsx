'use client';

import { ReactNode, useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FlaskConical, Plus, BarChart3, Settings, Monitor, Package, ArrowDownUp, Receipt, History, ListChecks, ArrowLeft, Search, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { RefreshProvider } from '@/components/recetas/RefreshContext';

function RecetasSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Link href="/recetas" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 shrink-0 hover:scale-105 transition-transform">
            <Image src="/logo/yellow-cube.svg" alt="Yellow Recetas" width={28} height={28} className="drop-shadow-sm" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">Yellow ERP</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                <FlaskConical className="w-2.5 h-2.5" /> Recetas
              </span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate mt-0.5">Producción & BOM</p>
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
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border-l-4 border-[#FACC15] shadow-sm shadow-amber-500/10'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}>
                <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
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