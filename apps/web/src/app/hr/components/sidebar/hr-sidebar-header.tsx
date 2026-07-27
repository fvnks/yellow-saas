import Link from "next/link";
import Image from "next/image";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export default function HRSidebarBrandHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/select" className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-sidebar-accent/50 transition-all duration-200 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
            <Image src="/logo/yellow-cube.svg" alt="Yellow" width={36} height={36} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-slate-900 leading-tight dark:text-white">
              Yellow <span className="font-normal text-slate-400 dark:text-slate-500">RRHH</span>
            </span>
            <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-widest">
              Recursos Humanos
            </span>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
