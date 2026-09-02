import {
  LayoutDashboard,
  Wrench,
  Car,
  FileText,
  Users,
  Calendar,
  Clock,
  Package,
  ShieldCheck,
  Settings,
  Building2,
  LucideIcon,
} from "lucide-react";

export const MODULE_ICON_MAP = {
  LayoutDashboard,
  Wrench,
  Car,
  FileText,
  Users,
  Calendar,
  Clock,
  Package,
  ShieldCheck,
  Settings,
  Building2,
};

export const resolveModuleIcon = (iconName: keyof typeof MODULE_ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return Wrench;
  return MODULE_ICON_MAP[iconName] || Wrench;
};

export interface ModuleNavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof MODULE_ICON_MAP;
}

export interface ModuleNavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof MODULE_ICON_MAP;
  subItems?: ModuleNavSubItem[];
}

export interface ModuleNavGroup {
  id: number;
  label?: string;
  items: ModuleNavMainItem[];
}

export const autoTalleresSidebarItems: ModuleNavGroup[] = [
  {
    id: 1,
    label: "Operación",
    items: [
      {
        title: "Dashboard",
        path: "/auto-talleres",
        icon: "LayoutDashboard",
      },
      {
        title: "Órdenes de Trabajo",
        path: "/auto-talleres/ordenes",
        icon: "Wrench",
      },
      {
        title: "Vehículos",
        path: "/auto-talleres/vehiculos",
        icon: "Car",
      },
      {
        title: "Estimados / Presupuestos",
        path: "/auto-talleres/estimados",
        icon: "FileText",
      },
      {
        title: "Inspecciones Visuales",
        path: "/auto-talleres/inspecciones",
        icon: "ShieldCheck",
      },
      {
        title: "Agenda / Citas",
        path: "/auto-talleres/agenda",
        icon: "Calendar",
      },
    ],
  },
  {
    id: 2,
    label: "Equipo",
    items: [
      {
        title: "Técnicos",
        path: "/auto-talleres/tecnicos",
        icon: "Users",
      },
      {
        title: "Bays / Talleres",
        path: "/auto-talleres/bays",
        icon: "Building2",
      },
      {
        title: "Registro de Tiempo",
        path: "/auto-talleres/tiempo",
        icon: "Clock",
      },
    ],
  },
  {
    id: 3,
    label: "Repuestos",
    items: [
      {
        title: "Pedidos de Repuestos",
        path: "/auto-talleres/pedidos-repuestos",
        icon: "Package",
      },
      {
        title: "Catálogo de Servicios",
        path: "/auto-talleres/servicios",
        icon: "Wrench",
      },
    ],
  },
  {
    id: 4,
    label: "Configuración",
    items: [
      {
        title: "Ajustes del Módulo",
        path: "/auto-talleres/configuracion",
        icon: "Settings",
      },
    ],
  },
];
