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
  Clock,
  List,
  Lock,
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
  Clock,
  List,
  Lock,
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
        title: "Artículos",
        path: "/dashboard/inventory",
        icon: "Package",
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Listado de Productos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Nuevo Producto", path: "/dashboard/inventory/new", icon: "Plus", requiredPermission: { module: "inventory", action: "create" } },
          { title: "Categorías", path: "/dashboard/inventory/categories", icon: "Tag", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Variantes", path: "/dashboard/inventory/variants", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "UdM", path: "/dashboard/inventory/uom", icon: "Package", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Tags", path: "/dashboard/inventory/tags", icon: "Tag", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Serialización", path: "/dashboard/inventory/serials", icon: "ClipboardList", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Lotes", path: "/dashboard/inventory/batches", icon: "Boxes", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Etiquetas", path: "/dashboard/inventory/label-designer", icon: "Tag", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Importar", path: "/dashboard/inventory/import", icon: "Upload", requiredPermission: { module: "inventory", action: "create" } },
        ],
      },
      {
        title: "Listado de Documentos",
        path: "/dashboard/inventory/adjustments",
        icon: "FileText",
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Ajustes de Stock", path: "/dashboard/inventory/adjustments", icon: "Wrench", requiredPermission: { module: "inventory", action: "update" } },
          { title: "Nuevo Ajuste", path: "/dashboard/inventory/adjustments/new", icon: "Plus", requiredPermission: { module: "inventory", action: "create" } },
          { title: "Devoluciones", path: "/dashboard/inventory/returns", icon: "ArrowLeftRight", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Conteos Físicos", path: "/dashboard/inventory/counts", icon: "ClipboardCheck", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Nuevo Conteo", path: "/dashboard/inventory/counts/new", icon: "Plus", requiredPermission: { module: "inventory", action: "create" } },
          { title: "Reservas", path: "/dashboard/inventory/reservations", icon: "ClipboardList", requiredPermission: { module: "inventory", action: "read" } },
        ],
      },
      {
        title: "Corrección Monetaria",
        path: "/dashboard/inventory/monetary-correction",
        icon: "CircleDollarSign",
        requiredPermission: { module: "inventory", action: "read" },
      },
      {
        title: "Cierres",
        path: "/dashboard/inventory/closings",
        icon: "Lock",
        requiredPermission: { module: "inventory", action: "read" },
      },
      {
        title: "Informes de Inventario",
        path: "/dashboard/inventory/stock-report",
        icon: "BarChart3",
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Reporte de Stock", path: "/dashboard/inventory/stock-report", icon: "FileBarChart", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Valorización", path: "/dashboard/inventory/valuation", icon: "CircleDollarSign", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Stock Muerto", path: "/dashboard/inventory/dead-stock", icon: "AlertTriangle", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Pronóstico", path: "/dashboard/inventory/forecasting", icon: "TrendingUp", requiredPermission: { module: "inventory", action: "read" } },
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
          { title: "Listado de Documentos", path: "/dashboard/sales/invoices", icon: "FileText", requiredPermission: { module: "invoices", action: "read" } },
          { title: "Nuevo Documento", path: "/dashboard/sales/invoices/new", icon: "Plus", requiredPermission: { module: "invoices", action: "create" } },
          { title: "Informes de Ventas", path: "/dashboard/sales/sales-reports", icon: "BarChart3", requiredPermission: { module: "invoices", action: "read" } },
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
        title: "Lista de Precios",
        path: "/dashboard/sales/price-lists",
        icon: "Tag",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Listado de Listas", path: "/dashboard/sales/price-lists", icon: "List", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Cobranza",
        path: "/dashboard/sales/cobranza",
        icon: "DollarSign",
        requiredPermission: { module: "invoices", action: "read" },
        subItems: [
          { title: "Cuenta Corriente", path: "/dashboard/sales/cobranza", icon: "Clock", requiredPermission: { module: "invoices", action: "read" } },
          { title: "Notas de Crédito", path: "/dashboard/sales/cobranza/credit-notes", icon: "FileText", requiredPermission: { module: "invoices", action: "read" } },
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
