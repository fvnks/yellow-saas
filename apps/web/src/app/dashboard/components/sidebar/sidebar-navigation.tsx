"use client";

import { useEffect, useLayoutEffect, useState, useMemo, useRef } from "react";
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
import { NavGroup, NavMainItem, resolveIcon, ICON_MAP } from "@/navigation/sidebar/sidebar-items";
import { usePermissions } from "@/lib/permissions";
import { MODULE_SIDEBAR_THEMES } from "@/lib/sidebar-theme";

function findScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    if (node.getAttribute("data-sidebar") === "content") {
      return node;
    }
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function scrollIntoSidebarView(el: HTMLElement | null) {
  if (!el) return;
  const scrollContainer = findScrollableAncestor(el);
  if (!scrollContainer) return;

  const containerRect = scrollContainer.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  if (elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom) {
    return;
  }

  const targetScrollTop = scrollContainer.scrollTop + (elRect.top - containerRect.top) - 8;

  scrollContainer.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: "smooth",
  });
}

interface SidebarNavigationProps {
  sidebarItems: NavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20">
    Próximamente
  </span>
);

export default function SidebarNavigation({ sidebarItems }: SidebarNavigationProps) {
  const { hasPermission } = usePermissions();
  const path = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const groupTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const itemTriggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const prevOpenGroups = useRef<Record<string, boolean>>({});
  const prevOpenItems = useRef<Record<string, boolean>>({});
  const mountedRef = useRef(false);

  // Filter sidebar items based on permissions and search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filterSubItems = (items: any[]): any[] => {
      return items.filter(sub => {
        if (sub.requiredPermission && !hasPermission(sub.requiredPermission.module, sub.requiredPermission.action)) {
          return false;
        }
        if (query && !sub.title.toLowerCase().includes(query)) {
          return false;
        }
        if (sub.subItems) {
          sub.subItems = filterSubItems(sub.subItems);
        }
        return true;
      });
    };

    return sidebarItems.map(group => {
      const matchingItems = group.items.filter(item => {
        if (item.requiredPermission && !hasPermission(item.requiredPermission.module, item.requiredPermission.action)) {
          return false;
        }

        const matchesItemTitle = !query || item.title.toLowerCase().includes(query) || group.label?.toLowerCase().includes(query);
        const filteredSubs = item.subItems ? filterSubItems(item.subItems) : [];
        const hasMatchingSubs = filteredSubs.length > 0;

        if (query && !matchesItemTitle && !hasMatchingSubs) {
          return false;
        }

        return true;
      });

      return {
        ...group,
        items: matchingItems
      };
    }).filter(group => group.items.length > 0);
  }, [sidebarItems, hasPermission, searchQuery]);

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

  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevOpenGroups.current = { ...openGroups };
      prevOpenItems.current = { ...openItems };
      return;
    }

    const newlyOpenedGroups = Object.entries(openGroups).filter(
      ([id, isOpen]) => isOpen && !prevOpenGroups.current[id]
    );
    const newlyOpenedItems = Object.entries(openItems).filter(
      ([title, isOpen]) => isOpen && !prevOpenItems.current[title]
    );

    const allNewlyOpened: Array<{ type: 'group' | 'item'; key: string }> = [
      ...newlyOpenedItems.map(([title]) => ({ type: 'item' as const, key: title })),
      ...newlyOpenedGroups.map(([id]) => ({ type: 'group' as const, key: id })),
    ];

    if (allNewlyOpened.length > 0) {
      requestAnimationFrame(() => {
        allNewlyOpened.forEach(({ type, key }, index) => {
          setTimeout(() => {
            if (type === 'group') {
              const trigger = groupTriggerRefs.current[key];
              scrollIntoSidebarView(trigger ?? null);
            } else {
              const trigger = itemTriggerRefs.current[key];
              scrollIntoSidebarView(trigger ?? null);
            }
          }, index * 50);
        });
      });
    }

    prevOpenGroups.current = { ...openGroups };
    prevOpenItems.current = { ...openItems };
  }, [openGroups, openItems]);

  const toggleGroup = (groupId: string | number) => {
    const nextOpen = !(openGroups[groupId] ?? false);
    setOpenGroups((prev) => ({ ...prev, [groupId]: nextOpen }));
  };

  const toggleItem = (title: string) => {
    const nextOpen = !(openItems[title] ?? false);
    setOpenItems((prev) => ({ ...prev, [title]: nextOpen }));
  };

  const theme = MODULE_SIDEBAR_THEMES.dashboard;

  const renderIcon = (iconName: keyof typeof ICON_MAP | undefined, itemActive?: boolean): React.ReactNode => {
    const Icon = resolveIcon(iconName);
    return <Icon className={cn("h-4 w-4 shrink-0", itemActive ? theme.iconActiveColorClass : "text-slate-400")} />;
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
    <div className="flex flex-col gap-2 px-2">
      {/* Quick Search Filter Bar inside Sidebar */}
      <div className="px-1 group-data-[collapsible=icon]:hidden">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar menú..."
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
                    <button
                      ref={(el) => { groupTriggerRefs.current[String(navGroup.id)] = el; }}
                      className={cn(
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
                                    ref={(el) => { itemTriggerRefs.current[item.title] = el; }}
                                    className={cn(
                                      "whitespace-nowrap rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold",
                                      itemActive
                                        ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-xs`
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                    )}
                                  >
                                    {renderIcon(item.icon, itemActive)}
                                    <span className="text-xs">{item.title}</span>
                                    {item.comingSoon && <IsComingSoon />}
                                    <ChevronRight className={cn(
                                      "ml-auto h-3.5 w-3.5 transition-transform duration-200 text-slate-400",
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
                                        "rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold",
                                        itemActive
                                          ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-xs`
                                          : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                      )}
                                    >
                                      {renderIcon(item.icon, itemActive)}
                                      <span className="text-xs">{item.title}</span>
                                      {item.path.includes('sales') && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-data-[collapsible=icon]:hidden" />
                                      )}
                                      {item.comingSoon && <IsComingSoon />}
                                    </SidebarMenuButton>
                                  </Link>
                                )}
                              </CollapsibleTrigger>
                              {item.subItems && (
                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                  <SidebarMenuSub className="border-l border-slate-800 ml-3 pl-2 space-y-0.5 my-1">
                                      {item.subItems.map((subItem) => {
                                        const subActive = isActive(subItem.path);
                                        return (
                                          <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton
                                              aria-disabled={subItem.comingSoon}
                                              isActive={subActive}
                                              asChild
                                              className={cn(
                                                "rounded-xl text-xs py-1.5 px-2.5 transition-colors font-medium",
                                                subActive
                                                  ? `bg-slate-800/90 ${theme.activeSubItemText} font-bold`
                                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                              )}
                                            >
                                              <a href={subItem.path}>
                                                {renderIcon(subItem.icon, subActive)}
                                                <span>{subItem.title}</span>
                                                {subItem.comingSoon && <IsComingSoon />}
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