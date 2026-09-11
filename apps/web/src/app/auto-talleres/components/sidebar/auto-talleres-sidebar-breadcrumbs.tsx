import { LayoutDashboard } from "lucide-react";

export default function AutoTalleresSidebarBreadcrumbs() {
 return (
 <div className="flex items-center gap-2 text-sm text-[#64748B] ">
 <LayoutDashboard className="w-4 h-4" />
 <span>/</span>
 <span className="text-[#0F172A] font-semibold">Talleres Automotrices</span>
 </div>
 );
}
