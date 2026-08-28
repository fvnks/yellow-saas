'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/veterinaria': 'Dashboard Clínica',
  '/veterinaria/agenda': 'Agenda & Citas',
  '/veterinaria/consultas': 'Consultas Clínicas',
  '/veterinaria/pacientes': 'Pacientes / Mascotas',
  '/veterinaria/clientes': 'Tutores / Clientes',
  '/veterinaria/vacunas': 'Carnet de Vacunación Ley 21.020',
  '/veterinaria/hospitalizacion': 'Hospitalización & UCI',
  '/veterinaria/cirugias': 'Cirugías & Quirófano',
  '/veterinaria/recetas': 'Recetas Médicas',
  '/veterinaria/configuracion/servicios': 'Servicios & Aranceles',
  '/veterinaria/profesionales': 'Profesionales Vet',
  '/veterinaria/recordatorios': 'Recordatorios Preventivos',
};

export default function VeterinarySidebarBreadcrumbs() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname] || 'Veterinaria';

  return (
    <header className="h-14 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-900 transition-colors font-medium">
          ERP
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/veterinaria" className="hover:text-slate-900 transition-colors font-medium">
          Veterinaria
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">{currentLabel}</span>
      </nav>
    </header>
  );
}
