import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Clock,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";

export const PROJECT_ICON_MAP = {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Clock,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2,
};

export const resolveProjectIcon = (iconName: keyof typeof PROJECT_ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return AlertTriangle;
  return PROJECT_ICON_MAP[iconName] || AlertTriangle;
};

export interface ProjectNavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof PROJECT_ICON_MAP;
}

export interface ProjectNavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof PROJECT_ICON_MAP;
  subItems?: ProjectNavSubItem[];
}

export interface ProjectNavGroup {
  id: number;
  label?: string;
  items: ProjectNavMainItem[];
}

export const projectSidebarItems: ProjectNavGroup[] = [
  {
    id: 1,
    label: "Navegación",
    items: [
      {
        title: "Volver al ERP",
        path: "/select",
        icon: "ArrowLeft",
      },
    ],
  },
  {
    id: 2,
    label: "Gestión de Proyectos",
    items: [
      {
        title: "Panel Principal",
        path: "/projects",
        icon: "LayoutDashboard",
      },
      {
        title: "Proyectos",
        path: "/projects/list",
        icon: "FolderKanban",
        subItems: [
          { title: "Todos", path: "/projects/list", icon: "FolderKanban" },
          { title: "Nuevo Proyecto", path: "/projects/new", icon: "FolderKanban" },
        ],
      },
      {
        title: "Tareas",
        path: "/projects/tasks",
        icon: "ListTodo",
        subItems: [
          { title: "Todas", path: "/projects/tasks", icon: "ListTodo" },
        ],
      },
      {
        title: "Tiempo",
        path: "/projects/time",
        icon: "Clock",
        subItems: [
          { title: "Registro de Tiempo", path: "/projects/time", icon: "Clock" },
        ],
      },
      {
        title: "Plantillas",
        path: "/projects/templates",
        icon: "FileText",
        subItems: [
          { title: "Gestionar", path: "/projects/templates", icon: "FileText" },
        ],
      },
      {
        title: "Reportes",
        path: "/projects/reports",
        icon: "BarChart3",
        subItems: [
          { title: "Informes", path: "/projects/reports", icon: "BarChart3" },
        ],
      },
    ],
  },
];
