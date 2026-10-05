'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  Bell,
  Library,
  Bus,
  FileText,
  Settings,
  Home,
  UserCheck,
  ClipboardList,
} from 'lucide-react';

const menuItems = [
  { href: '/educacion', icon: Home, label: 'Dashboard' },
  { href: '/educacion/estudiantes', icon: Users, label: 'Estudiantes' },
  { href: '/educacion/apoderados', icon: UserCheck, label: 'Apoderados' },
  { href: '/educacion/cursos', icon: GraduationCap, label: 'Cursos' },
  { href: '/educacion/profesores', icon: BookOpen, label: 'Profesores' },
  { href: '/educacion/asignaturas', icon: ClipboardList, label: 'Asignaturas' },
  { href: '/educacion/asistencia', icon: Calendar, label: 'Asistencia' },
  { href: '/educacion/calificaciones', icon: FileText, label: 'Calificaciones' },
  { href: '/educacion/comunicados', icon: Bell, label: 'Comunicados' },
  { href: '/educacion/pensiones', icon: DollarSign, label: 'Pensiones' },
  { href: '/educacion/matriculas', icon: FileText, label: 'Matrículas' },
  { href: '/educacion/eventos', icon: Calendar, label: 'Eventos' },
  { href: '/educacion/biblioteca', icon: Library, label: 'Biblioteca' },
  { href: '/educacion/admision', icon: Users, label: 'Admisión' },
  { href: '/educacion/transporte', icon: Bus, label: 'Transporte' },
  { href: '/educacion/subvenciones', icon: DollarSign, label: 'Subvenciones' },
  { href: '/educacion/reportes', icon: FileText, label: 'Reportes' },
  { href: '/educacion/configuracion', icon: Settings, label: 'Configuración' },
];

export function EducacionSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900">Educación</h2>
        <p className="text-xs text-gray-500">Gestión Escolar</p>
      </div>
      <nav className="px-2">
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
    </div>
  );
}
