"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { autoTalleresSidebarItems, resolveModuleIcon } from "@/navigation/sidebar/auto-talleres-sidebar-items";
import { cn } from "@/lib/utils";

export function AutoTalleresSidebarNavigation() {
  const pathname = usePathname();

  return (
    <>
      {autoTalleresSidebarItems.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && (
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = resolveModuleIcon(item.icon);
                const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "text-slate-400 hover:text-white hover:bg-slate-800/60",
                        isActive && "bg-orange-500/10 text-orange-400 border-l-2 border-orange-500 rounded-r-lg"
                      )}
                    >
                      <Link href={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
