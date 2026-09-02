'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Car, Wrench, FileText, Calendar, ShieldCheck, Package, Users, ChevronDown, Settings } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    id: 'ordenes',
    label: 'Órdenes de Trabajo',
    href: '/auto-talleres/ordenes',
    icon: Wrench,
    children: [
      { id: 'all', label: 'Todas', href: '/auto-talleres/ordenes', icon: Wrench },
      { id: 'new', label: 'Nueva Orden', href: '/auto-talleres/ordenes/new', icon: Wrench },
    ],
  },
  {
    id: 'vehiculos',
    label: 'Vehículos',
    href: '/auto-talleres/vehiculos',
    icon: Car,
    children: [
      { id: 'all', label: 'Todos', href: '/auto-talleres/vehiculos', icon: Car },
      { id: 'new', label: 'Registrar', href: '/auto-talleres/vehiculos/new', icon: Car },
    ],
  },
  {
    id: 'estimados',
    label: 'Estimados',
    href: '/auto-talleres/estimados',
    icon: FileText,
  },
  {
    id: 'agenda',
    label: 'Agenda',
    href: '/auto-talleres/agenda',
    icon: Calendar,
  },
  {
    id: 'tecnicos',
    label: 'Técnicos',
    href: '/auto-talleres/tecnicos',
    icon: Users,
  },
  {
    id: 'bays',
    label: 'Bays',
    href: '/auto-talleres/bays',
    icon: Car,
  },
  {
    id: 'inspecciones',
    label: 'Inspecciones',
    href: '/auto-talleres/inspecciones',
    icon: ShieldCheck,
  },
  {
    id: 'pedidos',
    label: 'Pedidos Repuestos',
    href: '/auto-talleres/pedidos-repuestos',
    icon: Package,
  },
];

export default function AutoTalleresSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isChildActive = (item: NavItem) => 
    item.children?.some(child => isActive(child.href));
  
  return (
    <nav className="flex flex-col h-full">
      {/* Module Header */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <Car className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight">Talleres</p>
            <p className="text-xs text-slate-400">Automotrices</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href) || isChildActive(item);
          const itemExpanded = expanded === item.id;
          
          return (
            <div key={item.id}>
              <button
                onClick={() => item.children && setExpanded(itemExpanded ? null : item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-orange-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.children && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${itemExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {item.children && itemExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(child.href)
                          ? 'text-orange-400 bg-orange-500/10'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <child.icon className="w-4 h-4" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Bottom Links */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        <Link
          href="/auto-talleres/configuracion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
        >
          <Settings className="w-5 h-5" />
          Configuración
        </Link>
      </div>
    </nav>
  );
}
