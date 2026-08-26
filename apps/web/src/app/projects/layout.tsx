'use client';

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { ProjectSidebar } from "@/app/projects/components/sidebar/app-project-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProjectSidebarBreadcrumbs from "./components/sidebar/project-sidebar-breadcrumbs";
import ThemeToggle from "@/components/ui/theme-toggle";
import { FolderKanban } from "lucide-react";

interface LayoutProps {
  readonly children: ReactNode;
}

export default function ProjectLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F8FAFC] min-h-screen text-slate-900 transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <ProjectSidebar />
        <SidebarInset className="bg-[#F8FAFC]">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
              <Separator orientation="vertical" className="h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  <FolderKanban className="w-3.5 h-3.5 text-purple-600" /> Proyectos & Hitos
                </span>
                <ProjectSidebarBreadcrumbs />
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