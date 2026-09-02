"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ProjectNavGroup, ProjectNavMainItem, resolveProjectIcon, PROJECT_ICON_MAP } from "@/navigation/sidebar/project-sidebar-items";
import { MODULE_SIDEBAR_THEMES } from "@/lib/sidebar-theme";

interface ProjectSidebarNavigationProps {
  sidebarItems: ProjectNavGroup[];
}

export default function ProjectSidebarNavigation({ sidebarItems }: ProjectSidebarNavigationProps) {
  const path = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const theme = MODULE_SIDEBAR_THEMES.proyectos;

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

  const renderIcon = (iconName: keyof typeof PROJECT_ICON_MAP | undefined, isActive: boolean): React.ReactNode => {
    const Icon = resolveProjectIcon(iconName);
    return <Icon className={cn("h-4 w-4 shrink-0", isActive ? theme.iconActiveColorClass : "text-slate-400")} />;
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

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sidebarItems;

    return sidebarItems
      .map((group) => {
        const matchingItems = group.items.filter((item) => {
          const titleMatches = item.title.toLowerCase().includes(query);
          const subMatches = item.subItems?.some((sub) => sub.title.toLowerCase().includes(query));
          return titleMatches || subMatches;
        });

        if (matchingItems.length === 0) return null;
        return { ...group, items: matchingItems };
      })
      .filter(Boolean) as ProjectNavGroup[];
  }, [sidebarItems, searchQuery]);

  return (
    <div className="flex flex-col gap-2 px-2">
      {/* Quick Search */}
      <div className="relative flex items-center px-1 mb-1 group-data-[collapsible=icon]:hidden">
        <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en Proyectos..."
          className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 text-slate-400 hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="absolute right-3 text-[9px] font-mono font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">⌘K</span>
        )}
      </div>

      {filteredGroups.map((navGroup, groupIndex) => {
        const groupActive = isGroupActive(navGroup);
        const groupOpen = searchQuery ? true : (openGroups[navGroup.id] ?? false);

        return (
          <Collapsible
            key={navGroup.id}
            open={groupOpen}
            onOpenChange={() => toggleGroup(navGroup.id)}
            className="group/collapsible-group"
          >
            <div className="rounded-xl transition-all duration-200">
              {navGroup.label && (
                <CollapsibleTrigger asChild>
                  <button className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 rounded-xl",
                    "text-[10px] font-bold uppercase tracking-widest",
                    "transition-all duration-150 cursor-pointer",
                    groupActive
                      ? theme.groupActiveText
                      : "text-slate-500 hover:text-slate-300",
                    "hover:bg-slate-800/40"
                  )}>
                    <ChevronDown className={cn(
                      "h-3 w-3 flex-shrink-0 transition-transform duration-200 text-slate-500",
                      !groupOpen && "-rotate-90"
                    )} />
                    <span className="truncate">{navGroup.label}</span>
                  </button>
                </CollapsibleTrigger>
              )}

              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="pb-1">
                  <SidebarMenu className="space-y-0.5">
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
                                    "whitespace-nowrap rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold",
                                    itemActive
                                      ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-sm`
                                      : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                  )}
                                >
                                  {renderIcon(item.icon, itemActive)}
                                  <span>{item.title}</span>
                                  <ChevronRight className={cn(
                                    "ml-auto transition-transform duration-200 text-slate-400",
                                    "group-data-[state=open]/collapsible:rotate-90"
                                  )} />
                                </SidebarMenuButton>
                              ) : (
                                <Link href={item.path} className="w-full">
                                  <SidebarMenuButton
                                    isActive={itemActive}
                                    tooltip={item.title}
                                    className={cn(
                                      "whitespace-nowrap rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold w-full",
                                      itemActive
                                        ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-sm`
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                    )}
                                  >
                                    {renderIcon(item.icon, itemActive)}
                                    <span>{item.title}</span>
                                  </SidebarMenuButton>
                                </Link>
                              )}
                            </CollapsibleTrigger>
                            {item.subItems && (
                              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <SidebarMenuSub className="border-l border-slate-800 ml-4 pl-2 space-y-0.5 my-1">
                                  {item.subItems.map((subItem) => {
                                    const subActive = isActive(subItem.path);
                                    return (
                                      <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                          isActive={subActive}
                                          asChild
                                          className={cn(
                                            "rounded-lg text-xs transition-all py-1.5 px-2.5 font-medium",
                                            subActive
                                              ? `bg-slate-800/90 ${theme.activeSubItemText} font-bold`
                                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                          )}
                                        >
                                          <a href={subItem.path}>
                                            {renderIcon(subItem.icon, subActive)}
                                            <span>{subItem.title}</span>
                                          </a>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  })}
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

            {groupIndex < filteredGroups.length - 1 && (
              <div className="my-1 mx-3 h-px bg-slate-800/60" />
            )}
          </Collapsible>
        );
      })}
    </div>
  );
}
