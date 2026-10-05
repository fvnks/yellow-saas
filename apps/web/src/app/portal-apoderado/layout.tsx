'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/portal-apoderado/dashboard', label: 'Dashboard' },
  { href: '/portal-apoderado/hijos', label: 'Mis hijos' },
  { href: '/portal-apoderado/notas', label: 'Notas' },
  { href: '/portal-apoderado/asistencia', label: 'Asistencia' },
  { href: '/portal-apoderado/pagos', label: 'Pagos' },
  { href: '/portal-apoderado/comunicados', label: 'Comunicados' },
];

/**
 * El login y el registro no muestran la navegación: todavía no hay sesión.
 */
const RUTAS_SIN_NAV = ['/portal-apoderado', '/portal-apoderado/registro'];

export default function PortalApoderadoLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const conNav = !RUTAS_SIN_NAV.includes(pathname);

  const salir = () => {
    document.cookie = 'portal_token=; path=/; max-age=0';
    window.location.href = '/portal-apoderado';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Portal del Apoderado</h1>
          <p className="text-sm text-gray-500">Acceso para apoderados</p>
        </div>

        {conNav && (
          <nav className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={salir}
              className="ml-auto text-gray-500 hover:text-gray-900"
            >
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
