import { cn } from '../lib/utils';
import { LayoutDashboard, Package, Warehouse, ShoppingCart, ShoppingBag, Users, Truck, Handshake, Wallet, Calculator, FolderKanban, Monitor, CreditCard, Settings, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'inventory', label: 'Inventario', icon: Package, href: '/inventory' },
  { id: 'warehouses', label: 'Bodegas', icon: Warehouse, href: '/warehouses' },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart, href: '/sales' },
  { id: 'purchases', label: 'Compras', icon: ShoppingBag, href: '/purchases' },
  { id: 'customers', label: 'Clientes', icon: Users, href: '/customers' },
  { id: 'suppliers', label: 'Proveedores', icon: Truck, href: '/suppliers' },
  { id: 'crm', label: 'CRM', icon: Handshake, href: '/crm' },
  { id: 'payroll', label: 'Remuneraciones', icon: Wallet, href: '/payroll' },
  { id: 'accounting', label: 'Contabilidad', icon: Calculator, href: '/accounting' },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban, href: '/projects' },
  { id: 'pos', label: 'POS', icon: Monitor, href: '/pos' },
  { id: 'billing', label: 'Facturación', icon: CreditCard, href: '/billing' },
  { id: 'settings', label: 'Configuración', icon: Settings, href: '/settings' },
  { id: 'audit', label: 'Auditoría', icon: ScrollText, href: '/audit' },
];

interface SidebarProps {
  companyName?: string;
  userName?: string;
  userRole?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function Sidebar({ companyName = 'Yellow ERP', userName, userRole, onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-64 bg-snow border-r border-mist h-screen fixed left-0 top-0 z-20 flex flex-col', className)}>
      <div className="h-16 px-4 flex items-center justify-between border-b border-mist">
        <h1 className="text-xl font-bold text-ink truncate">{companyName}</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Navegación principal">
        {MODULES.map((module) => {
          const isActive = pathname === module.href || pathname.startsWith(module.href + '/');
          const Icon = module.icon;
          return (
            <Link
              key={module.id}
              href={module.href}
              onClick={() => onNavigate?.(module.href)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                   ? 'bg-monday-violet text-white'
                   : 'text-slate-text hover:bg-cloud hover:text-ink'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{module.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-mist">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-monday-violet/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-monday-violet">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{userName || 'Usuario'}</p>
            <p className="text-[9px] font-medium text-iron uppercase tracking-wider">
              {userRole || 'member'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
