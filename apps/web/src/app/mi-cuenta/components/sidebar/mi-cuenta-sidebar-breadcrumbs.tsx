"use client";

import { useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const tabTranslations: Record<string, string> = {
  plan: "Plan y Precios",
  billing: "Facturación",
  modules: "Módulos Adicionales",
  activations: "Mis Activaciones",
};

export default function MiCuentaSidebarBreadcrumbs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'plan';

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <a href="/select" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors shrink-0">
        <Home className="h-4 w-4" />
      </a>
      <span className="flex items-center gap-1 shrink-0">
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-500">Mi Cuenta</span>
      </span>
      <span className="flex items-center gap-1 shrink-0">
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-medium text-slate-900">{tabTranslations[currentTab] || currentTab}</span>
      </span>
    </nav>
  );
}
