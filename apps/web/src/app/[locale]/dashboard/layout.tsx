'use client';

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/app/dashboard/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarBreadcrumbs from "./components/sidebar/sidebar-breadcrumbs";
import NotificationsDropdown from "./components/NotificationsDropdown";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { getChileanIndicators, ChileanIndicators } from "@/lib/indicators";
import { TrendingUp, ShieldCheck, DollarSign } from "lucide-react";
import { useTranslations } from 'next-intl';

interface LayoutProps {
  readonly children: ReactNode;
}

function ChileanIndicatorsPill() {
  const t = useTranslations('header');
  const [indicators, setIndicators] = useState<ChileanIndicators | null>(null);

  useEffect(() => {
    getChileanIndicators().then(setIndicators);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-monday-violet/10 border border-monday-violet/20 rounded-md text-xs font-semibold text-ink">
      <TrendingUp className="w-3.5 h-3.5 text-monday-violet" />
      <span>UF: ${indicators ? indicators.uf.toLocaleString('es-CL') : '38.500'}</span>
      <span className="opacity-40">|</span>
      <DollarSign className="w-3.5 h-3.5 text-[#006680] -mr-1" />
      <span>USD: ${indicators ? indicators.dolar.toLocaleString('es-CL') : '950'}</span>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1 text-forest font-bold">
        <ShieldCheck className="w-3.5 h-3.5" /> {t('siiOnline')}
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <main className="bg-cloud min-h-screen text-ink transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-cloud">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-mist bg-snow/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-text hover:text-ink" />
              <Separator orientation="vertical" className="h-4 bg-mist" />
              <SidebarBreadcrumbs />
            </div>
            <div className="flex items-center gap-3">
              <ChileanIndicatorsPill />
              <LocaleSwitcher />
              <NotificationsDropdown />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
