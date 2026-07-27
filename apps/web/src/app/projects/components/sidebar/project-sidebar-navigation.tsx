"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ProjectNavGroup, ProjectNavMainItem, ProjectNavSubItem, resolveProjectIcon, PROJECT_ICON_MAP } from "@/navigation/sidebar/project-sidebar-items";

interface ProjectSidebarNavigationProps {
  sidebarItems: ProjectNavGroup[];
}

export default function ProjectSidebarNavigation({ sidebarItems }: ProjectSidebarNavigationProps) {
  const path = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updatedGroups: Record<string, boolean> = {};
    const updatedItems: Record<string, boolean> = {};

    for (const group of sidebarItems) {
      for (const item of group.items) {
        const itemHasSubs = !!item.subItems;
        const isItemActive = path.startsWith(item.path) ||
          (itemHasSubs && item.subItems!.some((sub) => {
            const subPath = sub.path.split("?")[0];
            return path.startsWith(subPath);
          }));

        if (isItemActive) {
          updatedGroups[group.id] = true;
        }

        if (itemHasSubs) {
          updatedItems[item.title] = isItemActive;
        }
      }
    }

    setOpenGroups((prev) => ({ ...prev, ...updatedGroups }));
    setOpenItems((prev) => ({ ...prev, ...updatedItems }));
  }, [path, sidebarItems]);

  const toggleGroup = (groupId: string | number) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderIcon = (iconName: keyof typeof PROJECT_ICON_MAP | undefined): React.ReactNode => {
    const Icon = resolveProjectIcon(iconName);
    return <Icon className="h-4 w-4" />;
  };

  const isActive = (itemPath: string, subItems?: ProjectNavMainItem["subItems"]) => {
    if (subItems) {
      return subItems.some((subItem) => {
        const subPath = subItem.path.split("?")[0];
        return path.startsWith(subPath);
      });
    }
    return path.startsWith(itemPath);
  };

  const isGroupActive = (group: ProjectNavGroup) => {
    return group.items.some((item) => {
      if (item.subItems) {
        return item.subItems.some((sub) => {
          const subPath = sub.path.split("?")[0];
          return path.startsWith(subPath);
        });
      }
      return path.startsWith(item.path);
    });
  };

  return (
    <div className="flex flex-col gap-1 px-2">
      {sidebarItems.map((navGroup, groupIndex) => {
        const groupActive = isGroupActive(navGroup);
        const groupOpen = openGroups[navGroup.id] ?? false;

        return (
          <Collapsible
            key={navGroup.id}
            open={groupOpen}
            onOpenChange={() => toggleGroup(navGroup.id)}
            className="group/collapsible-group"
          >
            <div className={cn(
              "rounded-xl transition-all duration-200",
              groupOpen && "bg-sidebar-accent/30"
            )}>
              {navGroup.label && (
                <CollapsibleTrigger asChild>
                  <button className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 rounded-xl",
                    "text-[10px] font-bold uppercase tracking-widest",
                    "transition-all duration-200 cursor-pointer",
                    groupActive
                      ? "text-sidebar-foreground"
                      : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70",
                    "hover:bg-sidebar-accent/50"
                  )}>
                    <ChevronDown className={cn(
                      "h-3 w-3 flex-shrink-0 transition-transform duration-200",
                      !groupOpen && "-rotate-90"
                    )} />
                    <span className="truncate">{navGroup.label}</span>
                  </button>
                </CollapsibleTrigger>
              )}

              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="pb-1.5">
                  <SidebarMenu>
                    {navGroup.items.map((item) => {
                      const itemActive = isActive(item.path, item.subItems);
                      return (
                        <Collapsible
                          open={openItems[item.title] ?? false}
                          onOpenChange={() => toggleItem(item.title)}
                          key={item.title}
                          asChild
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              {item.subItems ? (
                                <SidebarMenuButton
                                  isActive={itemActive}
                                  tooltip={item.title}
                                  className={cn(
                                    "whitespace-nowrap rounded-xl transition-all duration-200",
                                    itemActive && "bg-sidebar-accent/60 font-medium"
                                  )}
                                >
                                  {renderIcon(item.icon)}
                                  <span>{item.title}</span>
                                  <ChevronRight className={cn(
                                    "ml-auto transition-transform duration-200",
                                    "group-data-[state=open]/collapsible:rotate-90"
                                  )} />
                                </SidebarMenuButton>
                              ) : (
                                <Link href={item.path}>
                                  <SidebarMenuButton
                                    isActive={itemActive}
                                    tooltip={item.title}
                                    className={cn(
                                      "rounded-xl transition-all duration-200",
                                      itemActive && "bg-sidebar-accent/60 font-medium"
                                    )}
                                  >
                                    {renderIcon(item.icon)}
                                    <span>{item.title}</span>
                                  </SidebarMenuButton>
                                </Link>
                              )}
                            </CollapsibleTrigger>
                            {item.subItems && (
                              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <SidebarMenuSub>
                                  {item.subItems.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      <SidebarMenuSubButton
                                        isActive={isActive(subItem.path)}
                                        asChild
                                        className="rounded-lg"
                                      >
                                        <a href={subItem.path}>
                                          {renderIcon(subItem.icon)}
                                          <span>{subItem.title}</span>
                                        </a>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            )}
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    })}
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </div>

            {groupIndex < sidebarItems.length - 1 && (
              <div className="my-1.5 mx-3 h-px bg-sidebar-border/50" />
            )}
          </Collapsible>
        );
      })}
    </div>
  );
}
