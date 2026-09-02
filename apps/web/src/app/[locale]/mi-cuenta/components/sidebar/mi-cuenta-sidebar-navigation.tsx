"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
import { MiCuentaNavGroup, MiCuentaNavMainItem, resolveMiCuentaIcon, MI_CUENTA_ICON_MAP } from "@/navigation/sidebar/mi-cuenta-sidebar-items";

interface MiCuentaSidebarNavigationProps {
  sidebarItems: MiCuentaNavGroup[];
}

export default function MiCuentaSidebarNavigation({ sidebarItems }: MiCuentaSidebarNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'plan';
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updatedGroups: Record<string, boolean> = {};
    const updatedItems: Record<string, boolean> = {};

    for (const group of sidebarItems) {
      for (const item of group.items) {
        const itemPath = item.path.split('?')[0];
        const itemTab = item.path.split('tab=')[1];
        const isItemActive = (itemPath === pathname && itemTab === currentTab) ||
          !!(item.subItems && item.subItems.some((sub) => {
            const subTab = sub.path.split('tab=')[1];
            return subTab === currentTab;
          }));

        if (isItemActive) {
          updatedGroups[group.id] = true;
        }
        if (item.subItems) {
          updatedItems[item.title] = isItemActive;
        }
      }
    }

    setOpenGroups((prev) => ({ ...prev, ...updatedGroups }));
    setOpenItems((prev) => ({ ...prev, ...updatedItems }));
  }, [pathname, currentTab, sidebarItems]);

  const toggleGroup = (groupId: string | number) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderIcon = (iconName: keyof typeof MI_CUENTA_ICON_MAP | undefined) => {
    const Icon = resolveMiCuentaIcon(iconName);
    return <Icon className="h-4 w-4 text-amber-400 shrink-0" />;
  };

  const isActive = (itemPath: string, subItems?: MiCuentaNavMainItem["subItems"]) => {
    if (subItems) {
      return subItems.some((sub) => {
        const subTab = sub.path.split('tab=')[1];
        return subTab === currentTab;
      });
    }
    const itemTab = itemPath.split('tab=')[1];
    return itemTab === currentTab;
  };

  const isGroupActive = (group: MiCuentaNavGroup) => {
    return group.items.some((item) => {
      if (item.subItems) {
        return item.subItems.some((sub) => {
          const subTab = sub.path.split('tab=')[1];
          return subTab === currentTab;
        });
      }
      const itemTab = item.path.split('tab=')[1];
      return itemTab === currentTab;
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
      .filter(Boolean) as MiCuentaNavGroup[];
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
          placeholder="Buscar en Configuración..."
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
                      ? "text-amber-400"
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
                                    "whitespace-nowrap rounded-xl transition-all duration-150 text-xs",
                                    itemActive
                                      ? "bg-slate-800 text-white font-bold border-l-4 border-amber-500 shadow-sm shadow-amber-500/10"
                                      : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                  )}
                                >
                                  {renderIcon(item.icon)}
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
                                      "whitespace-nowrap rounded-xl transition-all duration-150 text-xs w-full",
                                      itemActive
                                        ? "bg-slate-800 text-white font-bold border-l-4 border-amber-500 shadow-sm shadow-amber-500/10"
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
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
                                <SidebarMenuSub className="border-l border-slate-800 ml-4 pl-2 space-y-0.5 my-1">
                                  {item.subItems.map((subItem) => {
                                    const subActive = isActive(subItem.path);
                                    return (
                                      <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                          isActive={subActive}
                                          asChild
                                          className={cn(
                                            "rounded-lg text-xs transition-all",
                                            subActive
                                              ? "bg-slate-800/90 text-amber-400 font-bold"
                                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                          )}
                                        >
                                          <a href={subItem.path}>
                                            {renderIcon(subItem.icon)}
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