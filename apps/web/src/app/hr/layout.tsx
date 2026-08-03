'use client';

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { HRSidebar } from "@/app/hr/components/sidebar/app-hr-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import HRSidebarBreadcrumbs from "./components/sidebar/hr-sidebar-breadcrumbs";
import ThemeToggle from "@/components/ui/theme-toggle";

interface LayoutProps {
  readonly children: ReactNode;
}

export default function HRLayout({ children }: LayoutProps) {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <HRSidebar />
        <SidebarInset className="m-2 mx-auto max-w-screen-2xl md:rounded-xl md:border dark:border-slate-800 bg-white dark:bg-slate-900">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <HRSidebarBreadcrumbs />
            </div>
            <div className="ml-auto pr-4 flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <div className="p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
