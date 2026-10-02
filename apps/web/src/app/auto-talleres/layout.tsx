'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/animate-ui/components/radix/sidebar';
import { AutoTalleresSidebar } from './components/sidebar/app-auto-talleres-sidebar';
import AutoTalleresSidebarBreadcrumbs from './components/sidebar/auto-talleres-sidebar-breadcrumbs';

interface Props {
  children: ReactNode;
}

export default function AutoTalleresLayout({ children }: Props) {
  return (
    <main className="bg-cloud min-h-screen text-ink transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AutoTalleresSidebar />
        <SidebarInset className="bg-cloud">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-mist bg-snow/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-text hover:text-ink" />
              <Separator orientation="vertical" className="h-4 bg-mist" />
              <AutoTalleresSidebarBreadcrumbs />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
