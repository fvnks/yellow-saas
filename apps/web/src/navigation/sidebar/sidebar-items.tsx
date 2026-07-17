import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  Users,
  Truck,
  Handshake,
  Wallet,
  Calculator,
  FolderKanban,
  Monitor,
  CreditCard,
  Settings,
  ScrollText,
  AlertTriangle,
  LucideIcon,
  FileText,
  Receipt,
  BarChart3,
  MapPin,
  DollarSign,
  TrendingUp,
  Tag,
  BookOpen,
  UserCheck,
  Shield,
  Bell,
  Webhook,
  Globe,
  ArrowLeftRight,
  Boxes,
  Wrench,
  History,
  ClipboardList,
  FileBarChart,
  TruckIcon,
  CircleDollarSign,
  Building2,
} from "lucide-react";

export const ICON_MAP = {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  Users,
  Truck,
  Handshake,
  Wallet,
  Calculator,
  FolderKanban,
  Monitor,
  CreditCard,
  Settings,
  ScrollText,
  AlertTriangle,
  FileText,
  Receipt,
  BarChart3,
  MapPin,
  DollarSign,
  TrendingUp,
  Tag,
  BookOpen,
  UserCheck,
  Shield,
  Bell,
  Webhook,
  Globe,
  ArrowLeftRight,
  Boxes,
  Wrench,
  History,
  ClipboardList,
  FileBarChart,
  TruckIcon,
  CircleDollarSign,
  Building2,
};

export const resolveIcon = (iconName: keyof typeof ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return AlertTriangle;
  return ICON_MAP[iconName] || AlertTriangle;
};

export interface NavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof ICON_MAP;
  comingSoon?: boolean;
}

export interface NavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof ICON_MAP;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    id: 2,
    label: "Inventario",
    items: [
      {
        title: "Productos",
        path: "/dashboard/inventory",
        icon: "Package",
        subItems: [
          { title: "Todos", path: "/dashboard/inventory", icon: "Package" },
          { title: "Nuevo", path: "/dashboard/inventory/new", icon: "Package" },
          { title: "Ajustes", path: "/dashboard/inventory/adjustments", icon: "Wrench" },
          { title: "Reporte Stock", path: "/dashboard/inventory/stock-report", icon: "FileBarChart" },
          { title: "Etiquetas", path: "/dashboard/inventory/label-designer", icon: "Tag" },
          { title: "Valorización", path: "/dashboard/inventory/valuation", icon: "CircleDollarSign" },
        ],
      },
      {
        title: "Bodegas",
        path: "/dashboard/warehouses",
        icon: "Warehouse",
        subItems: [
          { title: "Todas", path: "/dashboard/warehouses", icon: "Warehouse" },
          { title: "Nueva", path: "/dashboard/warehouses/new", icon: "Warehouse" },
        ],
      },
      {
        title: "Transferencias",
        path: "/dashboard/transfers",
        icon: "ArrowLeftRight",
        subItems: [
          { title: "Todas", path: "/dashboard/transfers", icon: "ArrowLeftRight" },
          { title: "Nueva", path: "/dashboard/transfers/new", icon: "ArrowLeftRight" },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Ventas",
    items: [
      {
        title: "Ventas",
        path: "/dashboard/sales",
        icon: "ShoppingCart",
        subItems: [
          { title: "Órdenes", path: "/dashboard/sales?tab=orders", icon: "ShoppingCart" },
          { title: "Nueva Orden", path: "/dashboard/sales/new", icon: "ShoppingCart" },
          { title: "Cotizaciones", path: "/dashboard/sales?tab=quotations", icon: "FileText" },
          { title: "Guias de Despacho", path: "/dashboard/sales?tab=delivery", icon: "Truck" },
          { title: "Facturas", path: "/dashboard/sales?tab=invoices", icon: "Receipt" },
          { title: "Devoluciones", path: "/dashboard/sales?tab=returns", icon: "ArrowLeftRight" },
          { title: "Registro", path: "/dashboard/sales/register", icon: "ClipboardList" },
        ],
      },
      {
        title: "POS",
        path: "/dashboard/pos",
        icon: "Monitor",
      },
    ],
  },
  {
    id: 4,
    label: "Compras",
    items: [
      {
        title: "Compras",
        path: "/dashboard/purchases",
        icon: "ShoppingBag",
        subItems: [
          { title: "Órdenes de Compra", path: "/dashboard/purchases", icon: "ShoppingBag" },
          { title: "Recepciones", path: "/dashboard/purchases/receipts", icon: "Boxes" },
          { title: "Cotizaciones", path: "/dashboard/purchases/quotations", icon: "FileText" },
          { title: "Registro", path: "/dashboard/purchases/register", icon: "ClipboardList" },
        ],
      },
    ],
  },
  {
    id: 5,
    label: "Personas",
    items: [
      {
        title: "Clientes",
        path: "/dashboard/customers",
        icon: "Users",
        subItems: [
          { title: "Todos", path: "/dashboard/customers", icon: "Users" },
          { title: "Nuevo", path: "/dashboard/customers/new", icon: "Users" },
        ],
      },
      {
        title: "Proveedores",
        path: "/dashboard/suppliers",
        icon: "Truck",
        subItems: [
          { title: "Todos", path: "/dashboard/suppliers", icon: "Truck" },
          { title: "Nuevo", path: "/dashboard/purchases/suppliers/new", icon: "Truck" },
        ],
      },
    ],
  },
  {
    id: 6,
    label: "Finanzas",
    items: [
      {
        title: "Contabilidad",
        path: "/dashboard/accounting",
        icon: "Calculator",
      },
      {
        title: "Facturación",
        path: "/dashboard/billing",
        icon: "CreditCard",
      },
      {
        title: "Remuneraciones",
        path: "/dashboard/payroll",
        icon: "Wallet",
        subItems: [
          { title: "Empleados", path: "/dashboard/payroll?tab=employees" },
          { title: "Períodos de Nómina", path: "/dashboard/payroll?tab=periods" },
          { title: "Vacaciones", path: "/dashboard/payroll?tab=vacation" },
        ],
      },
    ],
  },
  {
    id: 7,
    label: "Herramientas",
    items: [
      {
        title: "Alertas",
        path: "/dashboard/alerts",
        icon: "Bell",
      },
      {
        title: "Reportes",
        path: "/dashboard/reports",
        icon: "FileBarChart",
      },
      {
        title: "CRM",
        path: "/dashboard/crm",
        icon: "Handshake",
      },
      {
        title: "Auditoría",
        path: "/dashboard/audit",
        icon: "ScrollText",
      },
      {
        title: "Proyectos",
        path: "/dashboard/projects",
        icon: "FolderKanban",
        comingSoon: true,
      },
    ],
  },
  {
    id: 8,
    label: "Sistema",
    items: [
      {
        title: "Configuración",
        path: "/dashboard/settings",
        icon: "Settings",
        subItems: [
          { title: "General", path: "/dashboard/settings", icon: "Settings" },
          { title: "Webhooks", path: "/dashboard/settings/webhooks", icon: "Webhook", comingSoon: true },
        ],
      },
    ],
  },
];
