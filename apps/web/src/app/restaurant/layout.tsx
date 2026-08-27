'use client';

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { RestaurantSidebar } from "@/app/restaurant/components/sidebar/app-restaurant-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import RestaurantSidebarBreadcrumbs from "./components/sidebar/restaurant-sidebar-breadcrumbs";
import ThemeToggle from "@/components/ui/theme-toggle";
import { UtensilsCrossed } from "lucide-react";

interface LayoutProps {
  readonly children: ReactNode;
}

export default function RestaurantLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <RestaurantSidebar />
        <SidebarInset className="bg-[#F8FAFC]">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
              <Separator orientation="vertical" className="h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" /> Restaurante POS
                </span>
                <RestaurantSidebarBreadcrumbs />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
