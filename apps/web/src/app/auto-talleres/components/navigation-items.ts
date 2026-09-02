import { Car, Wrench, FileText, Calendar, ShieldCheck, Package, Users, Settings } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Car;
  badge?: number;
}

export const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Consola',
    href: '/auto-talleres',
    icon: Car,
  },
  {
    id: 'ordenes',
    label: 'Órdenes de Trabajo',
    href: '/auto-talleres/ordenes',
    icon: Wrench,
    badge: 12,
  },
  {
    id: 'vehiculos',
    label: 'Vehículos',
    href: '/auto-talleres/vehiculos',
    icon: Car,
  },
  {
    id: 'estimados',
    label: 'Estimados',
    href: '/auto-talleres/estimados',
    icon: FileText,
  },
  {
    id: 'agenda',
    label: 'Agenda',
    href: '/auto-talleres/agenda',
    icon: Calendar,
  },
  {
    id: 'tecnicos',
    label: 'Técnicos',
    href: '/auto-talleres/tecnicos',
    icon: Users,
  },
  {
    id: 'bays',
    label: 'Bays',
    href: '/auto-talleres/bays',
    icon: Settings,
  },
  {
    id: 'inspecciones',
    label: 'Inspecciones',
    href: '/auto-talleres/inspecciones',
    icon: ShieldCheck,
  },
  {
    id: 'pedidos-repuestos',
    label: 'Pedidos Repuestos',
    href: '/auto-talleres/pedidos-repuestos',
    icon: Package,
  },
];
