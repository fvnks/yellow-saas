'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Calendar,
  Bell,
  DollarSign,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { href: '/portal-apoderado/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/portal-apoderado/notas', icon: FileText, label: 'Notas' },
  { href: '/portal-apoderado/asistencia', icon: Calendar, label: 'Asistencia' },
  { href: '/portal-apoderado/comunicados', icon: Bell, label: 'Comunicados' },
  { href: '/portal-apoderado/pagos', icon: DollarSign, label: 'Pagos' },
];

export function PortalApoderadoSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-900">Portal Apoderado</h2>
        <p className="text-xs text-gray-500">Colegio San Andrés</p>
      </div>

      <nav className="flex-1 px-2 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
