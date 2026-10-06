import { NavGroup } from './sidebar-items';

/**
 * Items de navegación del módulo de Educación.
 * Formato `NavGroup[]` consumido por `UnifiedSidebar`.
 */
export const educacionSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: 'Navegación Principal',
    items: [
      { title: 'Dashboard', path: '/educacion', icon: 'LayoutDashboard' },
      { title: 'Estudiantes', path: '/educacion/estudiantes', icon: 'Users' },
      { title: 'Apoderados', path: '/educacion/apoderados', icon: 'UserCheck' },
      { title: 'Cursos', path: '/educacion/cursos', icon: 'GraduationCap' },
      { title: 'Profesores', path: '/educacion/profesores', icon: 'BookOpen' },
      { title: 'Asignaturas', path: '/educacion/asignaturas', icon: 'ClipboardList' },
    ],
  },
  {
    id: 2,
    label: 'Académico',
    items: [
      { title: 'Asistencia', path: '/educacion/asistencia', icon: 'ClipboardCheck' },
      { title: 'Calificaciones', path: '/educacion/calificaciones', icon: 'FileText' },
      { title: 'Comunicados', path: '/educacion/comunicados', icon: 'Bell' },
      { title: 'Eventos', path: '/educacion/eventos', icon: 'Calendar' },
      { title: 'Biblioteca', path: '/educacion/biblioteca', icon: 'Library' },
    ],
  },
  {
    id: 3,
    label: 'Administración',
    items: [
      { title: 'Matrículas', path: '/educacion/matriculas', icon: 'FileSpreadsheet' },
      { title: 'Admisión', path: '/educacion/admision', icon: 'UserPlus' },
      { title: 'Pensiones', path: '/educacion/pensiones', icon: 'DollarSign' },
      { title: 'Subvenciones', path: '/educacion/subvenciones', icon: 'Wallet' },
      { title: 'Transporte', path: '/educacion/transporte', icon: 'Bus' },
    ],
  },
  {
    id: 4,
    label: 'Sistema',
    items: [
      { title: 'Reportes', path: '/educacion/reportes', icon: 'BarChart3' },
      { title: 'Configuración', path: '/educacion/configuracion', icon: 'SettingsIcon' },
    ],
  },
];
