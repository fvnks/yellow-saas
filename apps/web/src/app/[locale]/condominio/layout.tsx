'use client';

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppCondominioSidebar } from "./components/sidebar/app-condominio-sidebar";
import CondominioSidebarBreadcrumbs from "./components/sidebar/condominio-sidebar-breadcrumbs";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getChileanIndicators, ChileanIndicators } from "@/lib/indicators";
import { TrendingUp, ShieldCheck, DollarSign } from "lucide-react";

interface LayoutProps {
  readonly children: ReactNode;
}

function ChileanIndicatorsPill() {
  const [indicators, setIndicators] = useState<ChileanIndicators | null>(null);

  useEffect(() => {
    getChileanIndicators().then(setIndicators);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold text-slate-800">
      <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
      <span>UF: ${indicators ? indicators.uf.toLocaleString('es-CL') : '38.500'}</span>
      <span className="opacity-40">|</span>
      <DollarSign className="w-3.5 h-3.5 text-blue-600 -mr-1" />
      <span>USD: ${indicators ? indicators.dolar.toLocaleString('es-CL') : '950'}</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1 text-emerald-700 font-bold">
        <ShieldCheck className="w-3.5 h-3.5" /> Condominio Activo
      </span>
    </div>
  );
}

export default function CondominioLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AppCondominioSidebar />
        <SidebarInset className="bg-[#F8FAFC]">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />
              <CondominioSidebarBreadcrumbs />
            </div>

            <div className="flex items-center gap-4">
              <ChileanIndicatorsPill />
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}