'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building, Sparkles } from 'lucide-react';

export default function CondominioSidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-3 py-1 group-data-[collapsible=icon]:justify-center">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md shadow-cyan-500/20 text-slate-950 font-black text-sm shrink-0">
        <Building className="w-5 h-5 text-slate-950" />
      </div>

      <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-white tracking-tight truncate">
            Mi Condominio
          </span>
          <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
            PYME
          </span>
        </div>
        <span className="text-[10px] text-slate-400 truncate font-medium">
          Gestión de Copropiedad
        </span>
      </div>
    </div>
  );
}