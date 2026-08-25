'use client';

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { ProjectSidebar } from "@/app/projects/components/sidebar/app-project-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProjectSidebarBreadcrumbs from "./components/sidebar/project-sidebar-breadcrumbs";
import ThemeToggle from "@/components/ui/theme-toggle";

interface LayoutProps {
  readonly children: ReactNode;
}

export default function ProjectLayout({ children }: LayoutProps) {
  return (
    <main className="bg-muted dark:bg-background transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <ProjectSidebar />
        <SidebarInset className="m-2 mx-auto max-w-screen-2xl md:rounded-xl md:border dark:border-border bg-card dark:bg-primary">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border dark:border-border bg-card/80 dark:bg-primary/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <ProjectSidebarBreadcrumbs />
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
