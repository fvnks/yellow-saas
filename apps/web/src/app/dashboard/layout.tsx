'use client';

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/app/dashboard/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarBreadcrumbs from "./components/sidebar/sidebar-breadcrumbs";
import NotificationsDropdown from "./components/NotificationsDropdown";
import ThemeToggle from "@/components/ui/theme-toggle";
import { getApiClient } from "@/lib/api-client";
import { TrendingUp, ShieldCheck } from "lucide-react";

interface LayoutProps {
  readonly children: ReactNode;
}

function ChileanIndicatorsPill() {
  const [ufValue, setUfValue] = useState<number>(38500);

  useEffect(() => {
    const api = getApiClient();
    api.getUFValue()
      .then((res: any) => {
        if (res?.data?.uf_value) setUfValue(res.data.uf_value);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-medium text-slate-800 dark:text-amber-300">
      <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>UF: ${ufValue.toLocaleString('es-CL')}</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
        <ShieldCheck className="w-3.5 h-3.5" /> SII En Línea
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="m-2 mx-auto max-w-screen-2xl md:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <SidebarBreadcrumbs />
            </div>
            <div className="ml-auto pr-4 flex items-center gap-3">
              <ChileanIndicatorsPill />
              <ThemeToggle />
              <NotificationsDropdown />
            </div>
          </header>
          <div className="p-5">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
