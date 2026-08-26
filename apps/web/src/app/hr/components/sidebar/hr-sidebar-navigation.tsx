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
import { HRNavGroup, HRNavMainItem, resolveHRIcon, HR_ICON_MAP } from "@/navigation/sidebar/hr-sidebar-items";

interface HRSidebarNavigationProps {
  sidebarItems: HRNavGroup[];
}

export default function HRSidebarNavigation({ sidebarItems }: HRSidebarNavigationProps) {
  const path = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sidebarItems;

    return sidebarItems.map(group => {
      const matchingItems = group.items.filter(item => {
        const matchesTitle = item.title.toLowerCase().includes(query) || group.label?.toLowerCase().includes(query);
        const hasMatchingSub = item.subItems?.some(s => s.title.toLowerCase().includes(query));
        return matchesTitle || hasMatchingSub;
      });

      return {
        ...group,
        items: matchingItems,
      };
    }).filter(group => group.items.length > 0);
  }, [sidebarItems, searchQuery]);

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

        if (isItemActive || searchQuery) {
          updatedGroups[group.id] = true;
        }

        if (itemHasSubs) {
          updatedItems[item.title] = isItemActive || !!searchQuery;
        }
      }
    }

    setOpenGroups((prev) => ({ ...prev, ...updatedGroups }));
    setOpenItems((prev) => ({ ...prev, ...updatedItems }));
  }, [path, filteredItems, searchQuery]);

  const toggleGroup = (groupId: string | number) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderIcon = (iconName: keyof typeof HR_ICON_MAP | undefined): React.ReactNode => {
    const Icon = resolveHRIcon(iconName);
    return <Icon className="h-4 w-4 shrink-0" />;
  };

  const isActive = (itemPath: string, subItems?: HRNavMainItem["subItems"]) => {
    if (subItems) {
      return subItems.some((subItem) => {
        const subPath = subItem.path.split("?")[0];
        return path.startsWith(subPath);
      });
    }
    return path.startsWith(itemPath);
  };

  const isGroupActive = (group: HRNavGroup) => {
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
    <div className="flex flex-col gap-2 px-2">
      {/* Quick Search Filter Bar inside Sidebar */}
      <div className="px-1 group-data-[collapsible=icon]:hidden">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en RRHH..."
            className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2 text-[9px] font-mono font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4 px-2 group-data-[collapsible=icon]:hidden">
          Sin coincidencias
        </p>
      ) : (
        filteredItems.map((navGroup, groupIndex) => {
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
                "rounded-xl transition-all duration-150",
                groupOpen && "bg-slate-900/40"
              )}>
                {navGroup.label && (
                  <CollapsibleTrigger asChild>
                    <button className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 rounded-xl",
                      "text-[10px] font-black uppercase tracking-widest",
                      "transition-all duration-150 cursor-pointer",
                      groupActive
                        ? "text-[#FACC15]"
                        : "text-slate-400 hover:text-slate-200",
                      "hover:bg-slate-800/50"
                    )}>
                      <ChevronDown className={cn(
                        "h-3 w-3 flex-shrink-0 transition-transform duration-200 text-slate-400",
                        !groupOpen && "-rotate-90"
                      )} />
                      <span className="truncate">{navGroup.label}</span>
                      {groupActive && !groupOpen && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#FACC15] animate-pulse flex-shrink-0 shadow-sm shadow-amber-400/50" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                )}

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="pb-1 space-y-0.5">
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
                                      "whitespace-nowrap rounded-xl transition-all duration-150 py-2",
                                      itemActive
                                        ? "bg-slate-800 text-white font-bold border-l-4 border-[#FACC15] shadow-sm shadow-amber-500/10"
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                    )}
                                  >
                                    {renderIcon(item.icon)}
                                    <span className="text-xs">{item.title}</span>
                                    <ChevronRight className={cn(
                                      "ml-auto h-3.5 w-3.5 transition-transform duration-200 text-slate-400",
                                      "group-data-[state=open]/collapsible:rotate-90"
                                    )} />
                                  </SidebarMenuButton>
                                ) : (
                                  <Link href={item.path}>
                                    <SidebarMenuButton
                                      isActive={itemActive}
                                      tooltip={item.title}
                                      className={cn(
                                        "rounded-xl transition-all duration-150 py-2",
                                        itemActive
                                          ? "bg-slate-800 text-white font-bold border-l-4 border-[#FACC15] shadow-sm shadow-amber-500/10"
                                          : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                      )}
                                    >
                                      {renderIcon(item.icon)}
                                      <span className="text-xs">{item.title}</span>
                                    </SidebarMenuButton>
                                  </Link>
                                )}
                              </CollapsibleTrigger>
                              {item.subItems && (
                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                  <SidebarMenuSub className="border-l border-slate-800 ml-3 pl-2 space-y-0.5 my-1">
                                    {item.subItems.map((subItem) => (
                                      <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                          isActive={isActive(subItem.path)}
                                          asChild
                                          className={cn(
                                            "rounded-xl text-xs py-1.5 transition-colors",
                                            isActive(subItem.path)
                                              ? "bg-slate-800 text-[#FACC15] font-bold"
                                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                          )}
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

              {groupIndex < filteredItems.length - 1 && (
                <div className="my-1 mx-3 h-px bg-slate-800/60" />
              )}
            </Collapsible>
          );
        })
      )}
    </div>
  );
}