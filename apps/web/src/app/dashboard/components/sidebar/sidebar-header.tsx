import Link from "next/link";
import { Package } from "lucide-react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export default function SidebarBrandHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-md shadow-slate-900/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-slate-900 leading-tight">Yellow</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">ERP</span>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
