'use client';

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/app/dashboard/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarBreadcrumbs from "./components/sidebar/sidebar-breadcrumbs";
import NotificationsDropdown from "./components/NotificationsDropdown";
import ThemeToggle from "@/components/ui/theme-toggle";
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
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-slate-800 dark:text-amber-300">
      <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>UF: ${indicators ? indicators.uf.toLocaleString('es-CL') : '38.500'}</span>
      <span className="opacity-40">|</span>
      <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 -mr-1" />
      <span>USD: ${indicators ? indicators.dolar.toLocaleString('es-CL') : '950'}</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
        <ShieldCheck className="w-3.5 h-3.5" /> SII En Línea
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-[#F8FAFC]">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
              <Separator orientation="vertical" className="h-4 bg-slate-200" />
              <SidebarBreadcrumbs />
            </div>
            <div className="flex items-center gap-3">
              <ChileanIndicatorsPill />
              <ThemeToggle />
              <NotificationsDropdown />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}