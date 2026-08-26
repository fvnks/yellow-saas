'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Building } from 'lucide-react';

const routesMap: Record<string, string> = {
  '/condominio': 'Layout & Unidades',
  '/condominio/gastos-comunes': 'Gastos Comunes',
  '/condominio/pagos': 'Pagos & Conciliación',
  '/condominio/importar': 'Importar Planillas',
  '/condominio/comunicaciones': 'Comunicaciones',
  '/condominio/portal': 'Portal Residentes',
};

export default function CondominioSidebarBreadcrumbs() {
  const pathname = usePathname();
  const title = routesMap[pathname] || 'Mi Condominio';

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium select-none">
      <Link href="/condominio" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
        <Building className="w-3.5 h-3.5 text-cyan-600" />
        <span className="font-bold text-slate-700">Mi Condominio</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-semibold text-slate-900">{title}</span>
    </div>
  );
}