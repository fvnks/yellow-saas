import Link from 'next/link';
import { 
  Car, 
  Wrench, 
  FileText, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Package,
  Settings,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Consola', href: '/auto-talleres', icon: Car },
  { id: 'ordenes', label: 'Órdenes', href: '/auto-talleres/ordenes', icon: Wrench, badge: 12 },
  { id: 'vehiculos', label: 'Vehículos', href: '/auto-talleres/vehiculos', icon: Car },
  { id: 'estimados', label: 'Estimados', href: '/auto-talleres/estimados', icon: FileText },
  { id: 'agenda', label: 'Agenda', href: '/auto-talleres/agenda', icon: Calendar },
  { id: 'tecnicos', label: 'Técnicos', href: '/auto-talleres/tecnicos', icon: Users },
  { id: 'bays', label: 'Bays', href: '/auto-talleres/bays', icon: Settings },
  { id: 'inspecciones', label: 'Inspecciones', href: '/auto-talleres/inspecciones', icon: ShieldCheck },
  { id: 'pedidos', label: 'Pedidos Repuestos', href: '/auto-talleres/pedidos-repuestos', icon: Package },
];

export default function AutoTalleresSidebarItems() {
  return (
    <div className="flex flex-col h-full">
      {/* Logo & Title */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <Car className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight">Talleres</p>
            <p className="text-xs text-slate-500">Automotrices</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-orange-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <Link
          href="/auto-talleres/configuracion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
        >
          <Settings className="w-5 h-5" />
          Configuración
        </Link>
      </div>
    </div>
  );
}
