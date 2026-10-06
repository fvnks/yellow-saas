'use client';

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { UnifiedSidebar } from '@/components/sidebar/UnifiedSidebar';
import { educacionSidebarItems } from '@/navigation/sidebar/educacion-sidebar-items';
import EducacionSidebarBreadcrumbs from "./components/sidebar/educacion-sidebar-breadcrumbs";
import { getCompanyIdFromToken } from '@/lib/api-client';
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/animate-ui/components/radix/sidebar';
import { getChileanIndicators, ChileanIndicators } from "@/lib/indicators";
import { TrendingUp, ShieldCheck, DollarSign, GraduationCap } from "lucide-react";
import { useTranslations } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import esMessages from '@/messages/es.json';

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
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-md text-xs font-semibold text-ink">
      <TrendingUp className="w-3.5 h-3.5 text-brand-dark" />
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

export default function EducacionLayout({ children }: LayoutProps) {
  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
    <main className="bg-surface min-h-screen text-ink transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <UnifiedSidebar
          sidebarItems={educacionSidebarItems}
          moduleKey="educacion"
          moduleTitle="Educación"
          moduleSubtitle="Gestión Escolar"
          moduleIcon={GraduationCap}
          theme="cyan"
          filterByActiveModules={true}
          getCompanyId={getCompanyIdFromToken}
        />
        <SidebarInset className="bg-surface">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface-card/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-ink-muted hover:text-ink focus:ring-2 focus:ring-brand focus-ring-offset-2 focus-ring-offset-surface" />
              <Separator orientation="vertical" className="h-4 bg-surface-border" />
              <EducacionSidebarBreadcrumbs />
            </div>
            <div className="flex items-center gap-3">
              <ChileanIndicatorsPill />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
    </NextIntlClientProvider>
  );
}
