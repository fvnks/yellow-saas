import {
  UtensilsCrossed,
  QrCode,
  ChefHat,
  Wine,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  LucideIcon,
  Receipt,
  Wallet,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";

export const RESTAURANT_ICON_MAP = {
  UtensilsCrossed,
  QrCode,
  ChefHat,
  Wine,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  Receipt,
  Wallet,
  Users,
  BarChart3,
  FileText,
};

export const resolveRestaurantIcon = (iconName: keyof typeof RESTAURANT_ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return AlertTriangle;
  return RESTAURANT_ICON_MAP[iconName] || AlertTriangle;
};

export interface RestaurantNavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof RESTAURANT_ICON_MAP;
  permission?: string;
}

export interface RestaurantNavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof RESTAURANT_ICON_MAP;
  permission?: string;
  subItems?: RestaurantNavSubItem[];
}

export interface RestaurantNavGroup {
  id: number;
  label?: string;
  items: RestaurantNavMainItem[];
}

export const restaurantSidebarItems: RestaurantNavGroup[] = [
  {
    id: 0,
    label: "Panel",
    items: [
      {
        title: "Dashboard Restaurante",
        path: "/restaurant/dashboard",
        icon: "BarChart3",
        permission: "dashboard",
      },
    ],
  },
  {
    id: 1,
    label: "Operación & Servicio",
    items: [
      {
        title: "Garzón & Mesas POS",
        path: "/restaurant/waiter",
        icon: "UtensilsCrossed",
        permission: "pos",
      },
      {
        title: "Kiosco Autoservicio QR",
        path: "/restaurant/kiosk",
        icon: "QrCode",
        permission: "kiosk",
      },
      {
        title: "Pantalla KDS Cocina",
        path: "/restaurant/kitchen",
        icon: "ChefHat",
        permission: "kitchen",
      },
      {
        title: "Pantalla KDS Bar",
        path: "/restaurant/bar",
        icon: "Wine",
        permission: "bar",
      },
    ],
  },
  {
    id: 2,
    label: "Gestión & SII",
    items: [
      {
        title: "Cierre de Caja",
        path: "/restaurant/cashier",
        icon: "Wallet",
        permission: "cashier",
      },
      {
        title: "Boletas Electrónicas SII",
        path: "/restaurant/sales",
        icon: "Receipt",
        permission: "sales",
      },
      {
        title: "Reservas Web & PIN",
        path: "/restaurant/reservations",
        icon: "CalendarCheck",
        permission: "reservations",
      },
    ],
  },
  {
    id: 3,
    label: "Administración",
    items: [
      {
        title: "Consola Admin & Menú",
        path: "/restaurant/admin",
        icon: "LayoutDashboard",
        permission: "admin",
      },
      {
        title: "Reportes & Garzones",
        path: "/restaurant/reports",
        icon: "FileText",
        permission: "reports",
      },
      {
        title: "Usuarios & Roles",
        path: "/restaurant/users",
        icon: "Users",
        permission: "users",
      },
    ],
  },
];
