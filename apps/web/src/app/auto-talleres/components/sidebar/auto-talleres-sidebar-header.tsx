import { Car } from "lucide-react";
import Link from "next/link";

export function AutoTalleresSidebarHeader() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Link
        href="/auto-talleres"
        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30">
          <Car className="h-5 w-5 text-orange-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">Talleres</span>
          <span className="text-xs text-slate-400">Automotrices</span>
        </div>
      </Link>
      <div className="flex items-center gap-2 px-3">
        <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-400">
          MÓDULO
        </span>
      </div>
    </div>
  );
}
