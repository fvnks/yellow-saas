import {
  UsersRound,
  FileText,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  UserPlus,
  Settings,
  ArrowLeft,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

export const HR_ICON_MAP = {
  UsersRound,
  FileText,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  UserPlus,
  Settings,
  ArrowLeft,
  AlertTriangle,
};

export const resolveHRIcon = (iconName: keyof typeof HR_ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return AlertTriangle;
  return HR_ICON_MAP[iconName] || AlertTriangle;
};

export interface HRNavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof HR_ICON_MAP;
}

export interface HRNavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof HR_ICON_MAP;
  subItems?: HRNavSubItem[];
}

export interface HRNavGroup {
  id: number;
  label?: string;
  items: HRNavMainItem[];
}

export const hrSidebarItems: HRNavGroup[] = [
  {
    id: 1,
    label: "Navegación",
    items: [
      {
        title: "Volver al selector",
        path: "/select",
        icon: "ArrowLeft",
      },
    ],
  },
  {
    id: 2,
    label: "Recursos Humanos",
    items: [
      {
        title: "Contratos",
        path: "/hr?tab=contracts",
        icon: "FileText",
        subItems: [
          { title: "Todos", path: "/hr?tab=contracts", icon: "FileText" },
        ],
      },
      {
        title: "Asistencia",
        path: "/hr?tab=attendance",
        icon: "ClipboardCheck",
        subItems: [
          { title: "Registro Diario", path: "/hr?tab=attendance", icon: "ClipboardCheck" },
        ],
      },
      {
        title: "Evaluaciones",
        path: "/hr?tab=evaluations",
        icon: "BarChart3",
        subItems: [
          { title: "Desempeño", path: "/hr?tab=evaluations", icon: "BarChart3" },
        ],
      },
      {
        title: "Capacitación",
        path: "/hr?tab=training",
        icon: "GraduationCap",
        subItems: [
          { title: "Programas", path: "/hr?tab=training", icon: "GraduationCap" },
        ],
      },
      {
        title: "Onboarding",
        path: "/hr?tab=onboarding",
        icon: "UserPlus",
        subItems: [
          { title: "Procesos", path: "/hr?tab=onboarding", icon: "UserPlus" },
        ],
      },
    ],
  },
];
