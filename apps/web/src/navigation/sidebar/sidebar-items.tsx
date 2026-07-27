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
  Plus,
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
  UsersRound,
  ClipboardCheck,
  GraduationCap,
  UserPlus,
  Upload,
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
  UsersRound,
  ClipboardCheck,
  GraduationCap,
  UserPlus,
  Upload,
  Plus,
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
  requiredPermission?: { module: string; action: string };
}

export interface NavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof ICON_MAP;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  requiredPermission?: { module: string; action: string };
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
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Todos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Nuevo", path: "/dashboard/inventory/new", icon: "Package", requiredPermission: { module: "inventory", action: "create" } },
          { title: "Ajustes", path: "/dashboard/inventory/adjustments", icon: "Wrench", requiredPermission: { module: "inventory", action: "update" } },
          { title: "Reporte Stock", path: "/dashboard/inventory/stock-report", icon: "FileBarChart", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Etiquetas", path: "/dashboard/inventory/label-designer", icon: "Tag", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Valorizacion", path: "/dashboard/inventory/valuation", icon: "CircleDollarSign", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Serialización", path: "/dashboard/inventory/serials", icon: "ClipboardList", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Lotes", path: "/dashboard/inventory/batches", icon: "Boxes", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Devoluciones", path: "/dashboard/inventory/returns", icon: "ArrowLeftRight", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Importar", path: "/dashboard/inventory/import", icon: "ClipboardList", requiredPermission: { module: "inventory", action: "create" } },
          { title: "Categorías", path: "/dashboard/inventory/categories", icon: "Tag", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Variantes", path: "/dashboard/inventory/variants", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "UdM", path: "/dashboard/inventory/uom", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Tags", path: "/dashboard/inventory/tags", icon: "Tag", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Reservas", path: "/dashboard/inventory/reservations", icon: "ClipboardList", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Listas de Precio", path: "/dashboard/price-lists", icon: "Tag", requiredPermission: { module: "price_lists", action: "read" } },
        ],
      },
      {
        title: "Operaciones Bodega",
        path: "/dashboard/bodega",
        icon: "Warehouse",
        requiredPermission: { module: "warehouses", action: "read" },
        subItems: [
          { title: "Dashboard", path: "/dashboard/bodega", icon: "Warehouse", requiredPermission: { module: "warehouses", action: "read" } },
          { title: "Costos Aterrizados", path: "/dashboard/bodega/landed-cost", icon: "Truck", requiredPermission: { module: "warehouses", action: "read" } },
          { title: "Consignacion", path: "/dashboard/bodega/consignment", icon: "Handshake", requiredPermission: { module: "warehouses", action: "read" } },
          { title: "Libro SII", path: "/dashboard/bodega/sii-book", icon: "FileText", requiredPermission: { module: "warehouses", action: "read" } },
        ],
      },
      {
        title: "Bodegas",
        path: "/dashboard/warehouses",
        icon: "Warehouse",
        requiredPermission: { module: "warehouses", action: "read" },
        subItems: [
          { title: "Todas", path: "/dashboard/warehouses", icon: "Warehouse", requiredPermission: { module: "warehouses", action: "read" } },
          { title: "Nueva", path: "/dashboard/warehouses/new", icon: "Warehouse", requiredPermission: { module: "warehouses", action: "create" } },
        ],
      },
      {
        title: "Transferencias",
        path: "/dashboard/transfers",
        icon: "ArrowLeftRight",
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Todas", path: "/dashboard/transfers", icon: "ArrowLeftRight", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Nueva", path: "/dashboard/transfers/new", icon: "ArrowLeftRight", requiredPermission: { module: "inventory", action: "create" } },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Ventas",
    items: [
      {
        title: "Clientes",
        path: "/dashboard/customers",
        icon: "Users",
        requiredPermission: { module: "customers", action: "read" },
        subItems: [
          { title: "Listado de Clientes", path: "/dashboard/customers", icon: "Users", requiredPermission: { module: "customers", action: "read" } },
        ],
      },
      {
        title: "Productos",
        path: "/dashboard/inventory",
        icon: "Package",
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Artículos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Servicios", path: "/dashboard/inventory?type=service", icon: "Wrench", requiredPermission: { module: "inventory", action: "read" } },
        ],
      },
      {
        title: "Cotizaciones",
        path: "/dashboard/sales/quotations",
        icon: "FileText",
        requiredPermission: { module: "quotations", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/quotations", icon: "FileText", requiredPermission: { module: "quotations", action: "read" } },
          { title: "Informes de Cotizaciones", path: "/dashboard/sales/quotations/reports", icon: "BarChart3", requiredPermission: { module: "quotations", action: "read" } },
        ],
      },
      {
        title: "Pedidos",
        path: "/dashboard/sales/pedidos",
        icon: "ClipboardList",
        requiredPermission: { module: "internal_orders", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/pedidos", icon: "ClipboardList", requiredPermission: { module: "internal_orders", action: "read" } },
          { title: "Nuevo Pedido", path: "/dashboard/sales/pedidos/new", icon: "Plus", requiredPermission: { module: "internal_orders", action: "create" } },
          { title: "Importar Pedidos", path: "/dashboard/sales/pedidos/import", icon: "Upload", requiredPermission: { module: "internal_orders", action: "create" } },
          { title: "Informe de Pedidos", path: "/dashboard/sales/pedidos/reports", icon: "BarChart3", requiredPermission: { module: "internal_orders", action: "read" } },
        ],
      },
      {
        title: "Ventas",
        path: "/dashboard/sales",
        icon: "ShoppingCart",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Órdenes", path: "/dashboard/sales?tab=orders", icon: "ShoppingCart", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Nueva Orden", path: "/dashboard/sales/new", icon: "ShoppingCart", requiredPermission: { module: "sales_orders", action: "create" } },
          { title: "Facturas", path: "/dashboard/sales?tab=invoices", icon: "Receipt", requiredPermission: { module: "invoices", action: "read" } },
          { title: "Devoluciones", path: "/dashboard/sales?tab=returns", icon: "ArrowLeftRight", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Registro", path: "/dashboard/sales/register", icon: "ClipboardList", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Guías de Despacho",
        path: "/dashboard/sales/delivery-guides",
        icon: "Truck",
        requiredPermission: { module: "delivery_guides", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/delivery-guides", icon: "FileText", requiredPermission: { module: "delivery_guides", action: "read" } },
          { title: "Nueva Guía", path: "/dashboard/sales/delivery-guides/new", icon: "Plus", requiredPermission: { module: "delivery_guides", action: "create" } },
        ],
      },
      {
        title: "POS",
        path: "/dashboard/pos",
        icon: "Monitor",
        requiredPermission: { module: "pos", action: "read" },
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
        requiredPermission: { module: "purchase_orders", action: "read" },
        subItems: [
          { title: "Órdenes de Compra", path: "/dashboard/purchases", icon: "ShoppingBag", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Proveedores", path: "/dashboard/suppliers", icon: "Truck", requiredPermission: { module: "suppliers", action: "read" } },
          { title: "Artículos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Recepción de Artículos", path: "/dashboard/purchases/receipts", icon: "Boxes", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Documentos", path: "/dashboard/purchases/documents", icon: "FileText", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Informes", path: "/dashboard/purchases/reports", icon: "BarChart3", requiredPermission: { module: "purchase_orders", action: "read" } },
        ],
      },
      {
        title: "Libro de Compras",
        path: "/dashboard/purchases/purchase-book",
        icon: "BookOpen",
        requiredPermission: { module: "purchase_orders", action: "read" },
        subItems: [
          { title: "Listado de Proveedores", path: "/dashboard/suppliers", icon: "Truck", requiredPermission: { module: "suppliers", action: "read" } },
          { title: "Listado de Productos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Informe de Libro", path: "/dashboard/purchases/purchase-book", icon: "BarChart3", requiredPermission: { module: "purchase_orders", action: "read" } },
        ],
      },
    ],
  },
  {
    id: 7,
    label: "Finanzas",
    items: [
      {
        title: "Contabilidad",
        path: "/dashboard/accounting",
        icon: "Calculator",
        requiredPermission: { module: "accounting", action: "read" },
        subItems: [
          { title: "Plan de Cuentas", path: "/dashboard/accounting", icon: "Calculator", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Asientos Contables", path: "/dashboard/accounting/journal-entries", icon: "FileText", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Nuevo Asiento", path: "/dashboard/accounting/journal-entries/new", icon: "FileText", requiredPermission: { module: "accounting", action: "create" } },
        ],
      },
      {
        title: "Facturación",
        path: "/dashboard/billing",
        icon: "CreditCard",
        requiredPermission: { module: "invoices", action: "read" },
      },
      {
        title: "Remuneraciones",
        path: "/dashboard/payroll",
        icon: "Wallet",
        requiredPermission: { module: "payroll", action: "read" },
        subItems: [
          { title: "Empleados", path: "/dashboard/payroll?tab=employees", requiredPermission: { module: "payroll", action: "read" } },
          { title: "Períodos de Nómina", path: "/dashboard/payroll?tab=periods", requiredPermission: { module: "payroll", action: "read" } },
          { title: "Vacaciones", path: "/dashboard/payroll?tab=vacation", requiredPermission: { module: "payroll", action: "read" } },
        ],
      },
    ],
  },
  {
    id: 8,
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
        requiredPermission: { module: "reports", action: "read" },
      },
      {
        title: "CRM",
        path: "/dashboard/crm",
        icon: "Handshake",
        requiredPermission: { module: "crm", action: "read" },
      },
      {
        title: "Auditoría",
        path: "/dashboard/audit",
        icon: "ScrollText",
        requiredPermission: { module: "audit", action: "read" },
      },
    ],
  },
  {
    id: 9,
    label: "Proyectos",
    items: [
      {
        title: "Proyectos",
        path: "/dashboard/projects",
        icon: "FolderKanban",
        requiredPermission: { module: "projects", action: "read" },
        subItems: [
          { title: "Todos", path: "/dashboard/projects", icon: "FolderKanban", requiredPermission: { module: "projects", action: "read" } },
          { title: "Nuevo", path: "/dashboard/projects/new", icon: "FolderKanban", requiredPermission: { module: "projects", action: "create" } },
          { title: "Reportes", path: "/dashboard/projects/reports", icon: "BarChart3", requiredPermission: { module: "projects", action: "read" } },
          { title: "Asignacion", path: "/dashboard/projects/allocation", icon: "Users", requiredPermission: { module: "projects", action: "read" } },
        ],
      },
    ],
  },
  {
    id: 10,
    label: "Costos",
    items: [
      {
        title: "Centros de Costo",
        path: "/dashboard/cost-centers",
        icon: "CircleDollarSign",
        requiredPermission: { module: "accounting", action: "read" },
      },
    ],
  },
  {
    id: 11,
    label: "Sistema",
    items: [
      {
        title: "Configuración",
        path: "/dashboard/settings",
        icon: "Settings",
        requiredPermission: { module: "settings", action: "read" },
        subItems: [
          { title: "General", path: "/dashboard/settings", icon: "Settings", requiredPermission: { module: "settings", action: "read" } },
          { title: "Webhooks", path: "/dashboard/settings/webhooks", icon: "Webhook", requiredPermission: { module: "settings", action: "read" } },
        ],
      },
    ],
  },
];
