import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Dog,
  Users,
  BedDouble,
  Syringe,
  FileText,
  Briefcase,
  UserCheck,
  Bell,
  LucideIcon,
  PlusCircle,
  FileCheck,
  Dna,
  ClipboardList,
  FlaskConical,
  FileSpreadsheet,
  DoorOpen,
  Pill,
  DollarSign,
  Key,
  ListOrdered,
  BarChart3,
  Scan,
} from "lucide-react";

export interface VeterinaryNavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export interface VeterinaryNavGroup {
  groupLabel: string;
  items: VeterinaryNavItem[];
}

export const veterinarySidebarItems: VeterinaryNavGroup[] = [
  {
    groupLabel: "Operación Clínica",
    items: [
      {
        title: "Dashboard Vet",
        path: "/veterinaria",
        icon: LayoutDashboard,
      },
      {
        title: "Agenda & Citas",
        path: "/veterinaria/agenda",
        icon: Calendar,
        badge: "Hoy",
      },
      {
        title: "Consultas Clínicas",
        path: "/veterinaria/consultas",
        icon: Stethoscope,
      },
      {
        title: "Sala de Espera",
        path: "/veterinaria/cola",
        icon: ListOrdered,
      },
      {
        title: "Evolución & Notas SOAP",
        path: "/veterinaria/evoluciones",
        icon: ClipboardList,
      },
    ],
  },
  {
    groupLabel: "Fichas & Tutores",
    items: [
      {
        title: "Pacientes / Mascotas",
        path: "/veterinaria/pacientes",
        icon: Dog,
      },
      {
        title: "Tutores / Clientes",
        path: "/veterinaria/clientes",
        icon: Users,
      },
      {
        title: "Carnet de Vacunación",
        path: "/veterinaria/vacunas",
        icon: Syringe,
      },
    ],
  },
  {
    groupLabel: "Hospitalización & Recetas",
    items: [
      {
        title: "Hospitalización & UCI",
        path: "/veterinaria/hospitalizacion",
        icon: BedDouble,
      },
      {
        title: "Cirugías & Quirófano",
        path: "/veterinaria/cirugias",
        icon: Syringe,
      },
      {
        title: "Recetas Médicas",
        path: "/veterinaria/recetas",
        icon: FileText,
      },
      {
        title: "Farmacia",
        path: "/veterinaria/farmacia",
        icon: Pill,
      },
    ],
  },
  {
    groupLabel: "Diagnóstico & Facturación",
    items: [
      {
        title: "Laboratorio Clínico",
        path: "/veterinaria/laboratorio",
        icon: FlaskConical,
      },
      {
        title: "Imagenología",
        path: "/veterinaria/imagenologia",
        icon: Scan,
      },
      {
        title: "Presupuestos & Estimaciones",
        path: "/veterinaria/presupuestos",
        icon: FileSpreadsheet,
      },
      {
        title: "Pagos & Cobranzas",
        path: "/veterinaria/pagos",
        icon: DollarSign,
      },
    ],
  },
  {
    groupLabel: "Administración & Catálogos",
    items: [
      {
        title: "Catálogo de Especies",
        path: "/veterinaria/configuracion/especies",
        icon: Dna,
      },
      {
        title: "Servicios & Aranceles",
        path: "/veterinaria/configuracion/servicios",
        icon: Briefcase,
      },
      {
        title: "Profesionales Vet",
        path: "/veterinaria/profesionales",
        icon: UserCheck,
      },
      {
        title: "Recordatorios",
        path: "/veterinaria/recordatorios",
        icon: Bell,
      },
      {
        title: "Boxes & Salas",
        path: "/veterinaria/rooms",
        icon: DoorOpen,
      },
      {
        title: "Portal de Tutores",
        path: "/veterinaria/portal-tokens",
        icon: Key,
      },
      {
        title: "Reportes & Analytics",
        path: "/veterinaria/reportes",
        icon: BarChart3,
      },
    ],
  },
];
