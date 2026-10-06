'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECONDARY_ACTION } from '@/components/educacion/button-classes';
import { limpiarSesionPortal } from '@/lib/portal-session';

/**
 * Shell del portal autenticado: encabezado + navegación. Vive en un componente
 * cliente (usa `usePathname` para el ítem activo) y lo renderiza el layout
 * server del grupo `(protegido)` después de validar la sesión.
 *
 * Estilos alineados con el resto de la app: encabezado blanco, tinta en el
 * título y activo resaltado con el cyan del tema educación.
 */

const NAV = [
  { href: '/portal-apoderado/dashboard', label: 'Dashboard' },
  { href: '/portal-apoderado/hijos', label: 'Mis hijos' },
  { href: '/portal-apoderado/notas', label: 'Notas' },
  { href: '/portal-apoderado/asistencia', label: 'Asistencia' },
  { href: '/portal-apoderado/pagos', label: 'Pagos' },
  { href: '/portal-apoderado/comunicados', label: 'Comunicados' },
];

export default function ShellApoderado({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const salir = () => {
    limpiarSesionPortal('apoderado');
    window.location.href = '/portal-apoderado';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href="/portal-apoderado/dashboard" className="block">
                <h1 className="text-xl font-black text-ink">Portal del Apoderado</h1>
              </Link>
              <p className="text-sm text-slate-500">
                Notas, asistencia y pagos de tus hijos
              </p>
            </div>
            <button
              onClick={salir}
              className={`${SECONDARY_ACTION} px-3 py-1.5 text-sm`}
            >
              Cerrar sesión
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-x-2 gap-y-2 pb-3 pt-3 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? 'rounded-xl bg-electric-cyan/15 px-3 py-1.5 font-bold text-[#006680]'
                    : 'rounded-xl px-3 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
