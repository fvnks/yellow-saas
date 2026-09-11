import {
 Sidebar,
 SidebarHeader,
 SidebarContent,
 SidebarFooter,
 SidebarRail,
} from "@/components/ui/sidebar";
import { AutoTalleresSidebarHeader } from "./auto-talleres-sidebar-header";
import { AutoTalleresSidebarNavigation } from "./auto-talleres-sidebar-navigation";
import { AutoTalleresSidebarFooterMenu } from "./auto-talleres-sidebar-footer-menu";

export function AutoTalleresSidebar() {
 return (
 <Sidebar className="border-r border-mist bg-monday-violet text-ink">
 <SidebarHeader>
 <AutoTalleresSidebarHeader />
 </SidebarHeader>
 <SidebarContent>
 <AutoTalleresSidebarNavigation />
 </SidebarContent>
 <SidebarFooter>
 <AutoTalleresSidebarFooterMenu />
 </SidebarFooter>
 <SidebarRail />
 </Sidebar>
 );
}
