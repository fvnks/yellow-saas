import { Car, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function AutoTalleresSidebarHeader() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="px-4 py-4 border-b border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <Car className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight">Talleres</p>
            <p className="text-xs text-slate-400">Automotrices</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
          <Link
            href="/auto-talleres/orden-rapida"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            Orden Rápida
          </Link>
          <Link
            href="/auto-talleres/vehiculos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            Registrar Vehículo
          </Link>
        </div>
      )}
    </div>
  );
}
