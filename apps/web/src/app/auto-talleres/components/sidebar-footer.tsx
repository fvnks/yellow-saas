import { Car, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AutoTalleresSidebarFooter() {
  return (
    <div className="px-4 py-4 border-t border-slate-800">
      <div className="space-y-2">
        <Link
          href="/auto-talleres/configuracion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
        >
          <Settings className="w-5 h-5" />
          Configuración
        </Link>
        <Link
          href="/auto-talleres/soporte"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
        >
          <Car className="w-5 h-5" />
          Soporte Técnico
        </Link>
      </div>
    </div>
  );
}
