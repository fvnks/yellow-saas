'use client';

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/app/dashboard/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarBreadcrumbs from "./components/sidebar/sidebar-breadcrumbs";
import NotificationsDropdown from "./components/NotificationsDropdown";

interface LayoutProps {
  readonly children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <main className="bg-background min-h-screen">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background transition-none w-full">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-6">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <SidebarBreadcrumbs />
            </div>
            <div className="ml-auto pr-6 flex items-center gap-2">
              <NotificationsDropdown />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}