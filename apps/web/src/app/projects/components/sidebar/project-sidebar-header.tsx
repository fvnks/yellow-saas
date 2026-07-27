import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export default function ProjectSidebarBrandHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/select" className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-sidebar-accent/50 transition-all duration-200 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-slate-900 leading-tight dark:text-white">
              Yellow <span className="font-normal text-slate-400 dark:text-slate-500">Projects</span>
            </span>
            <span className="text-[9px] font-semibold text-indigo-500 uppercase tracking-widest">
              Gestión de Proyectos
            </span>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
