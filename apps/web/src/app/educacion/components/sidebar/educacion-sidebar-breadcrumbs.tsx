'use client';

import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  estudiantes: 'Estudiantes',
  apoderados: 'Apoderados',
  cursos: 'Cursos',
  profesores: 'Profesores',
  asignaturas: 'Asignaturas',
  asistencia: 'Asistencia',
  calificaciones: 'Calificaciones',
  comunicados: 'Comunicados',
  eventos: 'Eventos',
  biblioteca: 'Biblioteca',
  matriculas: 'Matrículas',
  admision: 'Admisión',
  pensiones: 'Pensiones',
  subvenciones: 'Subvenciones',
  transporte: 'Transporte',
  reportes: 'Reportes',
  configuracion: 'Configuración',
};

export default function EducacionSidebarBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentKey = segments[1] || '';
  const currentLabel = PAGE_LABELS[currentKey] || 'Dashboard';

  return (
    <div className="flex items-center gap-2 text-sm text-slate-text">
      <GraduationCap className="w-4 h-4" />
      <span>/</span>
      <span className="text-ink font-semibold">Educación</span>
      <span>/</span>
      <span className="text-ink font-semibold">{currentLabel}</span>
    </div>
  );
}
