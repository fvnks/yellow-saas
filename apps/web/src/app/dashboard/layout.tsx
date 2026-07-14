'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  Handshake,
  Wallet,
  Calculator,
  FolderKanban,
  Settings,
  ScrollText,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Bell,
  Search,
  BarChart3,
  List,
  Truck,
  TrendingUp,
  Package,
  Tags,
  ClipboardList,
  RotateCcw,
  Monitor,
  Users,
  FileText,
  ArrowUpDown,
  Settings2,
  Wrench,
  Tag,
  Hash,
  BookOpen,
  Boxes,
  GitBranch,
} from 'lucide-react';
import { cn } from '@yellow-erp/ui';
import { Button } from '@yellow-erp/ui';
import { PermissionsProvider, usePermissions } from '../../lib/permissions';

type ModuleItem = {
  name: string;
  href: string;
  icon: any;
  permission?: string | null;
};

type ModuleGroup = {
  name: string;
  icon: any;
  permission?: string | null;
  href?: string;
  children?: ModuleItem[];
};

type SidebarModule = ModuleItem | ModuleGroup;

function isGroup(m: SidebarModule): m is ModuleGroup {
  return 'children' in m && Array.isArray(m.children);
}

const MODULES: SidebarModule[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Inventario',
    icon: Package,
    permission: 'inventory',
    href: '/dashboard/inventory',
    children: [
      { name: 'Productos', href: '/dashboard/inventory', icon: Package },
      { name: 'Bodega', href: '/dashboard/bodega', icon: Warehouse },
      { name: 'Categorías', href: '/dashboard/inventory/categories', icon: Tags },
      { name: 'Conteos', href: '/dashboard/inventory/counts', icon: ClipboardList },
      { name: 'Ajustes', href: '/dashboard/inventory/adjustments', icon: ArrowUpDown },
      { name: 'Series / Lotes', href: '/dashboard/inventory/serials', icon: Hash },
      { name: 'Reservas', href: '/dashboard/inventory/reservations', icon: Boxes },
      { name: 'Variantes', href: '/dashboard/inventory/variants', icon: GitBranch },
      { name: 'BOMs', href: '/dashboard/inventory/boms', icon: Settings2 },
      { name: 'Etiquetas', href: '/dashboard/inventory/label-designer', icon: Tag },
      { name: 'Importar', href: '/dashboard/inventory/import', icon: Wrench },
      { name: 'Reportes', href: '/dashboard/inventory/stock-report', icon: BarChart3 },
      { name: 'Configuración', href: '/dashboard/inventory/config', icon: Settings },
    ],
  },
  {
    name: 'Ventas',
    icon: ShoppingCart,
    permission: 'sales_orders',
    href: '/dashboard/sales',
    children: [
      { name: 'Órdenes de Venta', href: '/dashboard/sales', icon: ShoppingCart },
      { name: 'Cotizaciones', href: '/dashboard/sales/quotations/new', icon: ClipboardList },
      { name: 'Facturación', href: '/dashboard/sales/invoices/new', icon: FileText },
      { name: 'Guías de Despacho', href: '/dashboard/sales/delivery/new', icon: Truck },
      { name: 'Devoluciones', href: '/dashboard/sales/returns', icon: RotateCcw },
      { name: 'POS', href: '/dashboard/pos', icon: Monitor },
      { name: 'Clientes', href: '/dashboard/customers', icon: Users },
    ],
  },
  { name: 'Compras', href: '/dashboard/purchases', icon: ShoppingBag, permission: 'purchase_orders' },
  { name: 'CRM', href: '/dashboard/crm', icon: Handshake, permission: 'crm' },
  { name: 'Listas de Precio', href: '/dashboard/price-lists', icon: List, permission: 'price_lists' },
  { name: 'Nomina', href: '/dashboard/payroll', icon: Wallet, permission: 'payroll' },
  { name: 'Contabilidad', href: '/dashboard/accounting', icon: Calculator, permission: 'accounting' },
  { name: 'Proyectos', href: '/dashboard/projects', icon: FolderKanban, permission: 'projects' },
  { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3, permission: 'reports' },
  { name: 'Reportes Avanzados', href: '/dashboard/reports/advanced', icon: TrendingUp, permission: 'reports' },
  { name: 'Auditoria', href: '/dashboard/audit', icon: ScrollText, permission: 'audit' },
  { name: 'Configuracion', href: '/dashboard/settings', icon: Settings, permission: 'settings' },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <PermissionsProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </PermissionsProvider>
  );
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Inventario', 'Ventas']);
  const { hasAnyPermission } = usePermissions();

  const user = { name: 'Admin Yellow', email: 'admin@yellow.cl', role: 'owner' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 truncate">Yellow ERP</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Navegacion principal">
          {MODULES.filter(m => !m.permission || hasAnyPermission(m.permission)).map((module) => {
            if (isGroup(module)) {
              const isExpanded = expandedGroups.includes(module.name);
              const hasActiveChild = module.children?.some(
                child => pathname === child.href || pathname.startsWith(child.href + '/')
              );
              const Icon = module.icon;
              return (
                <div key={module.name}>
                  <button
                    onClick={() => {
                      setExpandedGroups(prev =>
                        prev.includes(module.name)
                          ? prev.filter(n => n !== module.name)
                          : [...prev, module.name]
                      );
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left',
                      hasActiveChild && !isExpanded
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 truncate">{module.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isExpanded && module.children && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                      {module.children
                        .filter(child => !child.permission || hasAnyPermission(child.permission))
                        .map((child) => {
                          const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                isChildActive
                                  ? 'bg-slate-900 text-white'
                                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                              )}
                              aria-current={isChildActive ? 'page' : undefined}
                            >
                              <ChildIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{child.name}</span>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === module.href || pathname.startsWith(module.href + '/');
            const Icon = module.icon;
            return (
              <Link
                key={module.name}
                href={module.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{module.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-10 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="hidden md:block relative w-72 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              aria-label="Buscar"
            />
          </div>

          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative" aria-label="Notificaciones">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">A</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-[9px] text-slate-500">{user.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mi perfil
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </Link>
                <hr className="my-1 border-slate-100" />
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}