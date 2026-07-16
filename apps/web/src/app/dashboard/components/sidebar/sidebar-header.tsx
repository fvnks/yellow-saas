import Link from "next/link";
import { Package } from "lucide-react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export default function SidebarBrandHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 group-data-[collapsible=icon]:hidden">
            Yellow ERP
          </span>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
