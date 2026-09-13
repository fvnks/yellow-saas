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
  FlaskConical,
  Play,
  Building,
  UtensilsCrossed,
  RefreshCw,
  FileDown,
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
  UtensilsCrossed,
  RefreshCw,
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
  FlaskConical,
  Play,
  Building,
  FileDown,
};

export const resolveIcon = (iconName: keyof typeof ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return AlertTriangle;
  return ICON_MAP[iconName] || AlertTriangle;
};

export interface NavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof ICON_MAP;
  subItems?: NavSubItem[];
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
  requiredModule?: string;
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
    requiredModule: "erp",
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
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Dashboard", path: "/dashboard/bodega", icon: "Warehouse", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Órdenes de Producción", path: "/dashboard/production/orders", icon: "FlaskConical", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Costos Aterrizados", path: "/dashboard/bodega/landed-cost", icon: "Truck", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Consignacion", path: "/dashboard/bodega/consignment", icon: "Handshake", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Libro SII", path: "/dashboard/bodega/sii-book", icon: "FileText", requiredPermission: { module: "inventory", action: "read" } },
        ],
      },
      {
        title: "Bodegas",
        path: "/dashboard/warehouses",
        icon: "Warehouse",
        requiredPermission: { module: "inventory", action: "read" },
        subItems: [
          { title: "Todas", path: "/dashboard/warehouses", icon: "Warehouse", requiredPermission: { module: "inventory", action: "read" } },
          { title: "Nueva", path: "/dashboard/warehouses/new", icon: "Warehouse", requiredPermission: { module: "inventory", action: "create" } },
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
    requiredModule: "erp",
    items: [
      {
        title: "Clientes",
        path: "/dashboard/customers",
        icon: "Users",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Listado de Clientes", path: "/dashboard/customers", icon: "Users", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Productos",
        path: "/dashboard/inventory",
        icon: "Package",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Artículos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Servicios", path: "/dashboard/inventory?type=service", icon: "Wrench", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Cotizaciones",
        path: "/dashboard/sales/quotations",
        icon: "FileText",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/quotations", icon: "FileText", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Informes de Cotizaciones", path: "/dashboard/sales/quotations/reports", icon: "BarChart3", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Pedidos",
        path: "/dashboard/sales/pedidos",
        icon: "ClipboardList",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/pedidos", icon: "ClipboardList", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Nuevo Pedido", path: "/dashboard/sales/pedidos/new", icon: "Plus", requiredPermission: { module: "sales_orders", action: "create" } },
          { title: "Importar Pedidos", path: "/dashboard/sales/pedidos/import", icon: "Upload", requiredPermission: { module: "sales_orders", action: "create" } },
          { title: "Informe de Pedidos", path: "/dashboard/sales/pedidos/reports", icon: "BarChart3", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Ventas",
        path: "/dashboard/sales",
        icon: "ShoppingCart",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/invoices", icon: "FileText", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Nuevo Documento", path: "/dashboard/sales/invoices/new", icon: "Plus", requiredPermission: { module: "sales_orders", action: "create" } },
          { title: "Facturación Recurrente", path: "/dashboard/sales/recurring", icon: "RefreshCw", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Ecommerce & DTE", path: "/dashboard/sales/ecommerce", icon: "Globe", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Informes de Ventas", path: "/dashboard/sales/sales-reports", icon: "BarChart3", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Guías de Despacho",
        path: "/dashboard/sales/delivery-guides",
        icon: "Truck",
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Listado de Documentos", path: "/dashboard/sales/delivery-guides", icon: "FileText", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Nueva Guía", path: "/dashboard/sales/delivery-guides/new", icon: "Plus", requiredPermission: { module: "sales_orders", action: "create" } },
          { title: "Guía DTE 52 SII", path: "/dashboard/sales/guia-52", icon: "Truck", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "Factoring AEC",
        path: "/dashboard/sales/factoring",
        icon: "Handshake",
        requiredPermission: { module: "sales_orders", action: "read" },
      },
      {
        title: "Webpay / Transbank",
        path: "/dashboard/sales/transbank",
        icon: "CreditCard",
        requiredPermission: { module: "sales_orders", action: "read" },
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
        requiredPermission: { module: "sales_orders", action: "read" },
        subItems: [
          { title: "Cuenta Corriente", path: "/dashboard/sales/cobranza", icon: "Clock", requiredPermission: { module: "sales_orders", action: "read" } },
          { title: "Notas Crédito/Débito DTE", path: "/dashboard/sales/credit-debit", icon: "FileText", requiredPermission: { module: "sales_orders", action: "read" } },
        ],
      },
      {
        title: "POS",
        path: "/dashboard/pos",
        icon: "Monitor",
        requiredPermission: { module: "sales_orders", action: "read" },
      },
    ],
  },
  {
    id: 4,
    label: "Compras",
    requiredModule: "erp",
    items: [
      {
        title: "Compras",
        path: "/dashboard/purchases",
        icon: "ShoppingBag",
        requiredPermission: { module: "purchase_orders", action: "read" },
        subItems: [
          { title: "Órdenes de Compra", path: "/dashboard/purchases", icon: "ShoppingBag", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Proveedores", path: "/dashboard/suppliers", icon: "Truck", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Portal Proveedores", path: "/dashboard/suppliers/portal", icon: "Truck", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Importaciones DIN", path: "/dashboard/purchases/imports", icon: "Globe", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Artículos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Recepción de Artículos", path: "/dashboard/purchases/receipts", icon: "Boxes", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Categorías", path: "/dashboard/purchases/categories", icon: "Tag", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Informes", path: "/dashboard/purchases/reports", icon: "BarChart3", requiredPermission: { module: "purchase_orders", action: "read" } },
        ],
      },
      {
        title: "Libro de Compras",
        path: "/dashboard/purchases/purchase-book",
        icon: "BookOpen",
        requiredPermission: { module: "purchase_orders", action: "read" },
        subItems: [
          { title: "Libro de Compras", path: "/dashboard/purchases/purchase-book", icon: "BookOpen", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Documentos", path: "/dashboard/purchases/documents", icon: "FileText", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Guías de Despacho", path: "/dashboard/purchases/receipts", icon: "Truck", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Listado de Proveedores", path: "/dashboard/suppliers", icon: "Truck", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Listado de Productos", path: "/dashboard/inventory", icon: "Package", requiredPermission: { module: "purchase_orders", action: "read" } },
          { title: "Informes", path: "/dashboard/purchases/reports", icon: "BarChart3", requiredPermission: { module: "purchase_orders", action: "read" } },
        ],
      },
    ],
  },
  {
    id: 7,
    label: "Finanzas",
    requiredModule: "erp",
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
          { title: "Libro Mayor", path: "/dashboard/accounting/general-ledger", icon: "BookOpen", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Libro de Ventas SII", path: "/dashboard/accounting/sales-book", icon: "BookOpen", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Balance 8 Col / EERR", path: "/dashboard/accounting/financial-statements", icon: "FileBarChart", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Activo Fijo & Depreciación", path: "/dashboard/accounting/fixed-assets", icon: "Building2", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Conciliación Bancaria", path: "/dashboard/accounting/reconciliation", icon: "ArrowLeftRight", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Flujo de Caja Proyectado", path: "/dashboard/accounting/cashflow", icon: "TrendingUp", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Asistente F29 SII", path: "/dashboard/accounting/f29", icon: "Calculator", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Honorarios BHE", path: "/dashboard/accounting/honorarios", icon: "FileText", requiredPermission: { module: "accounting", action: "read" } },
          { title: "Documentos Recibidos", path: "/dashboard/received-documents", icon: "FileDown", requiredPermission: { module: "accounting", action: "read" } },
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
      {
        title: "Gastos",
        path: "/dashboard/expenses",
        icon: "Wallet",
        requiredPermission: { module: "expenses", action: "read" },
        subItems: [
          { title: "Listado de Gastos", path: "/dashboard/expenses", icon: "Wallet", requiredPermission: { module: "expenses", action: "read" } },
          { title: "Categorías", path: "/dashboard/expenses/categories", icon: "Tag", requiredPermission: { module: "expenses", action: "read" } },
        ],
      },
    ],
  },
  {
    id: 8,
    label: "Herramientas",
    requiredModule: "erp",
    items: [
      {
        title: "Mi Condominio",
        path: "/condominio",
        icon: "Building",
      },
      {
        title: "Restaurante & POS",
        path: "/restaurant",
        icon: "UtensilsCrossed",
      },
      {
        title: "Talleres Automotrices",
        path: "/auto-talleres",
        icon: "Wrench",
      },
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
    requiredModule: "erp",
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
    id: 12,
    label: "Servicios",
    requiredModule: "erp",
    items: [
      {
        title: "Órdenes de Trabajo",
        path: "/dashboard/services/work-orders",
        icon: "Wrench",
        requiredPermission: { module: "work_orders", action: "read" },
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
          {
            title: "General",
            path: "/dashboard/settings",
            icon: "Settings",
            requiredPermission: { module: "settings", action: "read" },
            subItems: [
              { title: "Empresa", path: "/dashboard/settings/empresa", icon: "Building2", requiredPermission: { module: "settings", action: "read" } },
              { title: "Rubros", path: "/dashboard/settings/rubros", icon: "Tag", requiredPermission: { module: "settings", action: "read" } },
              { title: "Centros de Costo", path: "/dashboard/cost-centers", icon: "CircleDollarSign", requiredPermission: { module: "settings", action: "read" } },
              { title: "Documentos", path: "/dashboard/settings?tab=documentos", icon: "FileText", requiredPermission: { module: "settings", action: "read" } },
            ],
          },
          { title: "Webhooks", path: "/dashboard/settings/webhooks", icon: "Webhook", requiredPermission: { module: "settings", action: "read" } },
          { title: "Firma Electrónica FEA", path: "/dashboard/settings/fea", icon: "Shield", requiredPermission: { module: "settings", action: "read" } },
        ],
      },
    ],
  },
];
