import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import SidebarFooterMenu from "./sidebar-footer-menu";
import SidebarBrandHeader from "./sidebar-header";
import SidebarNavigation from "./sidebar-navigation";

const user = {
  name: "Admin Yellow",
  email: "admin@yellow.cl",
  avatar: "",
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrandHeader />
        <SidebarSeparator className="mx-0 opacity-50" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation sidebarItems={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0 opacity-50" />
        <SidebarFooterMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
