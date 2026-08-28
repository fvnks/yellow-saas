'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/restaurant': 'POS Garzón',
  '/restaurant/dashboard': 'Dashboard Restaurante',
  '/restaurant/waiter': 'POS Garzón & Mesas',
  '/restaurant/kiosk': 'Kiosco Autoservicio QR',
  '/restaurant/kitchen': 'KDS Cocina',
  '/restaurant/bar': 'KDS Bar',
  '/restaurant/sales': 'Boletas Electrónicas SII',
  '/restaurant/cashier': 'Cierre de Caja',
  '/restaurant/reservations': 'Reservas Web',
  '/restaurant/admin': 'Consola Admin',
  '/restaurant/reports': 'Reportes & Garzones',
  '/restaurant/users': 'Usuarios & Roles',
};

export default function RestaurantSidebarBreadcrumbs() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname] || 'Restaurante';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500">
      <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
        ERP
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-semibold text-slate-900">{currentLabel}</span>
    </nav>
  );
}
