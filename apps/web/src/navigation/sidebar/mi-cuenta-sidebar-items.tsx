import { CreditCard, Receipt, Puzzle, History, AlertTriangle, LucideIcon,
} from "lucide-react"; export const MI_CUENTA_ICON_MAP = { CreditCard, Receipt, Puzzle, History, AlertTriangle,
}; export const resolveMiCuentaIcon = (iconName: keyof typeof MI_CUENTA_ICON_MAP | undefined): LucideIcon => { if (!iconName) return AlertTriangle; return MI_CUENTA_ICON_MAP[iconName] || AlertTriangle;
}; export interface MiCuentaNavSubItem { title: string; path: string; icon?: keyof typeof MI_CUENTA_ICON_MAP;
} export interface MiCuentaNavMainItem { title: string; path: string; icon?: keyof typeof MI_CUENTA_ICON_MAP; subItems?: MiCuentaNavSubItem[];
} export interface MiCuentaNavGroup { id: number; label?: string; items: MiCuentaNavMainItem[];
} export const miCuentaSidebarItems: MiCuentaNavGroup[] = [ { id: 2, label: "Mi Cuenta", items: [ { title: "Plan y Precios", path: "/mi-cuenta?tab=plan", icon: "CreditCard", subItems: [ { title: "Mi Plan", path: "/mi-cuenta?tab=plan", icon: "CreditCard" }, ], }, { title: "Facturación", path: "/mi-cuenta?tab=billing", icon: "Receipt", subItems: [ { title: "Datos de Facturación", path: "/mi-cuenta?tab=billing", icon: "Receipt" }, ], }, { title: "Módulos Adicionales", path: "/mi-cuenta?tab=modules", icon: "Puzzle", subItems: [ { title: "Catálogo", path: "/mi-cuenta?tab=modules", icon: "Puzzle" }, ], }, { title: "Mis Activaciones", path: "/mi-cuenta?tab=activations", icon: "History", subItems: [ { title: "Historial", path: "/mi-cuenta?tab=activations", icon: "History" }, ], }, ], },
];
