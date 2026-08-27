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
} from "lucide-react";

export const RESTAURANT_ICON_MAP = {
  UtensilsCrossed,
  QrCode,
  ChefHat,
  Wine,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Receipt,
  AlertTriangle,
};

export const resolveRestaurantIcon = (iconName: keyof typeof RESTAURANT_ICON_MAP | undefined): LucideIcon => {
  if (!iconName) return AlertTriangle;
  return RESTAURANT_ICON_MAP[iconName] || AlertTriangle;
};

export interface RestaurantNavSubItem {
  title: string;
  path: string;
  icon?: keyof typeof RESTAURANT_ICON_MAP;
}

export interface RestaurantNavMainItem {
  title: string;
  path: string;
  icon?: keyof typeof RESTAURANT_ICON_MAP;
  subItems?: RestaurantNavSubItem[];
}

export interface RestaurantNavGroup {
  id: number;
  label?: string;
  items: RestaurantNavMainItem[];
}

export const restaurantSidebarItems: RestaurantNavGroup[] = [
  {
    id: 1,
    label: "Operación & Servicio",
    items: [
      {
        title: "Garzón & Mesas POS",
        path: "/restaurant/waiter",
        icon: "UtensilsCrossed",
      },
      {
        title: "Kiosco Autoservicio QR",
        path: "/restaurant/kiosk",
        icon: "QrCode",
      },
      {
        title: "Pantalla KDS Cocina",
        path: "/restaurant/kitchen",
        icon: "ChefHat",
      },
      {
        title: "Pantalla KDS Bar",
        path: "/restaurant/bar",
        icon: "Wine",
      },
    ],
  },
  {
    id: 2,
    label: "Gestión & SII",
    items: [
      {
        title: "Boletas Electrónicas SII",
        path: "/restaurant/sales",
        icon: "Receipt",
      },
      {
        title: "Reservas Web & PIN",
        path: "/restaurant/reservations",
        icon: "CalendarCheck",
      },
      {
        title: "Consola Admin & Menú",
        path: "/restaurant/admin",
        icon: "LayoutDashboard",
      },
    ],
  },
];
