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
import { NavGroup, NavMainItem, NavSubItem, resolveIcon, ICON_MAP } from "@/navigation/sidebar/sidebar-items";
import { usePermissions } from "@/lib/permissions";

interface SidebarNavigationProps {
  sidebarItems: NavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
    Próximamente
  </span>
);

export default function SidebarNavigation({ sidebarItems }: SidebarNavigationProps) {
  const { hasPermission } = usePermissions();
  const path = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Filter sidebar items based on permissions
  const filteredItems = useMemo(() => {
    const filterSubItems = (items: any[]): any[] => {
      return items.filter(sub => {
        if (sub.requiredPermission && !hasPermission(sub.requiredPermission.module, sub.requiredPermission.action)) {
          return false;
        }
        if (sub.subItems) {
          sub.subItems = filterSubItems(sub.subItems);
        }
        return true;
      });
    };

    return sidebarItems.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.requiredPermission && !hasPermission(item.requiredPermission.module, item.requiredPermission.action)) {
          return false;
        }
        if (item.subItems) {
          item.subItems = filterSubItems(item.subItems);
        }
        return true;
      })
    })).filter(group => group.items.length > 0);
  }, [sidebarItems, hasPermission]);

  useEffect(() => {
    const updatedGroups: Record<string, boolean> = {};
    const updatedItems: Record<string, boolean> = {};

    for (const group of filteredItems) {
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
  }, [path, filteredItems]);

  const toggleGroup = (groupId: string | number) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderIcon = (iconName: keyof typeof ICON_MAP | undefined): React.ReactNode => {
    const Icon = resolveIcon(iconName);
    return <Icon className="h-4 w-4" />;
  };

  const isActive = (itemPath: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems) {
      return subItems.some((subItem) => {
        const subPath = subItem.path.split("?")[0];
        if (path.startsWith(subPath)) return true;
        if (subItem.subItems) {
          return subItem.subItems.some((nested) => {
            return path.startsWith(nested.path.split("?")[0]);
          });
        }
        return false;
      });
    }
    return path.startsWith(itemPath);
  };

  const isGroupActive = (group: NavGroup) => {
    const checkSubItems = (subItems: any[]): boolean => {
      return subItems.some((sub) => {
        if (path.startsWith(sub.path.split("?")[0])) return true;
        if (sub.subItems) return checkSubItems(sub.subItems);
        return false;
      });
    };

    return group.items.some((item) => {
      if (path.startsWith(item.path)) return true;
      if (item.subItems) return checkSubItems(item.subItems);
      return false;
    });
  };

  return (
    <div className="flex flex-col gap-1 px-2">
      {filteredItems.map((navGroup, groupIndex) => {
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
                    {groupActive && !groupOpen && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
                    )}
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
                                  {item.comingSoon && <IsComingSoon />}
                                  <ChevronRight className={cn(
                                    "ml-auto transition-transform duration-200",
                                    "group-data-[state=open]/collapsible:rotate-90"
                                  )} />
                                </SidebarMenuButton>
                              ) : (
                                <Link href={item.path}>
                                  <SidebarMenuButton
                                    disabled={item.comingSoon}
                                    isActive={itemActive}
                                    tooltip={item.title}
                                    className={cn(
                                      "rounded-xl transition-all duration-200",
                                      itemActive && "bg-sidebar-accent/60 font-medium"
                                    )}
                                  >
                                    {renderIcon(item.icon)}
                                    <span>{item.title}</span>
                                    {item.comingSoon && <IsComingSoon />}
                                  </SidebarMenuButton>
                                </Link>
                              )}
                            </CollapsibleTrigger>
                            {item.subItems && (
                              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <SidebarMenuSub>
                                  {item.subItems.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      {subItem.subItems ? (
                                        <Collapsible
                                          open={openItems[subItem.title] ?? false}
                                          onOpenChange={() => toggleItem(subItem.title)}
                                        >
                                          <CollapsibleTrigger asChild>
                                            <SidebarMenuSubButton
                                              isActive={isActive(subItem.path, subItem.subItems)}
                                              className="rounded-lg justify-between"
                                            >
                                              <div className="flex items-center gap-2">
                                                {renderIcon(subItem.icon)}
                                                <span>{subItem.title}</span>
                                              </div>
                                              <ChevronRight className={cn(
                                                "h-3 w-3 transition-transform duration-200",
                                                "group-data-[state=open]/collapsible:rotate-90"
                                              )} />
                                            </SidebarMenuSubButton>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <SidebarMenuSub className="ml-4">
                                              {subItem.subItems.map((nestedItem) => (
                                                <SidebarMenuSubItem key={nestedItem.title}>
                                                  <SidebarMenuSubButton
                                                    asChild
                                                    className="rounded-lg"
                                                    isActive={isActive(nestedItem.path)}
                                                  >
                                                    <a href={nestedItem.path}>
                                                      {renderIcon(nestedItem.icon)}
                                                      <span>{nestedItem.title}</span>
                                                    </a>
                                                  </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                              ))}
                                            </SidebarMenuSub>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      ) : (
                                        <SidebarMenuSubButton
                                          aria-disabled={subItem.comingSoon}
                                          isActive={isActive(subItem.path)}
                                          asChild
                                          className="rounded-lg"
                                        >
                                          <a href={subItem.path}>
                                            {renderIcon(subItem.icon)}
                                            <span>{subItem.title}</span>
                                            {subItem.comingSoon && <IsComingSoon />}
                                          </a>
                                        </SidebarMenuSubButton>
                                      )}
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
