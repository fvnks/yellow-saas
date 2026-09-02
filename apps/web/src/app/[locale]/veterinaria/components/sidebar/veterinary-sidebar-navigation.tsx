"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { VeterinaryNavGroup, veterinarySidebarItems } from "@/navigation/sidebar/veterinary-sidebar-items";
import { MODULE_SIDEBAR_THEMES } from "@/lib/sidebar-theme";

interface VeterinarySidebarNavigationProps {
  sidebarItems?: VeterinaryNavGroup[];
}

function VeterinarySidebarNavigationContent({ sidebarItems = veterinarySidebarItems }: VeterinarySidebarNavigationProps) {
  const path = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const theme = MODULE_SIDEBAR_THEMES.veterinaria;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sidebarItems;

    return sidebarItems.map((group) => {
      const matchingItems = group.items.filter((item) =>
        item.title.toLowerCase().includes(query) || group.groupLabel.toLowerCase().includes(query)
      );

      return {
        ...group,
        items: matchingItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [sidebarItems, searchQuery]);

  const checkIsItemActive = (itemPath: string) => {
    return path === itemPath || (itemPath !== "/veterinaria" && path.startsWith(itemPath));
  };

  const checkIsGroupActive = (group: VeterinaryNavGroup) => {
    return group.items.some((item) => checkIsItemActive(item.path));
  };

  useEffect(() => {
    const updatedGroups: Record<string, boolean> = {};
    for (const group of filteredItems) {
      if (checkIsGroupActive(group) || searchQuery) {
        updatedGroups[group.groupLabel] = true;
      }
    }
    setOpenGroups((prev) => ({ ...prev, ...updatedGroups }));
  }, [path, filteredItems, searchQuery]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col gap-2 px-2">
      {/* Quick Search */}
      <div className="px-1 group-data-[collapsible=icon]:hidden">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en Vet..."
            className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 text-slate-400 hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2 text-[9px] font-mono font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">⌘K</span>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4 px-2 group-data-[collapsible=icon]:hidden">
          Sin coincidencias
        </p>
      ) : (
        filteredItems.map((navGroup, groupIndex) => {
          const groupActive = checkIsGroupActive(navGroup);
          const groupOpen = openGroups[navGroup.groupLabel] ?? true;

          return (
            <Collapsible
              key={navGroup.groupLabel}
              open={groupOpen}
              onOpenChange={() => toggleGroup(navGroup.groupLabel)}
              className="group/collapsible-group"
            >
              <div className={cn("rounded-xl transition-all duration-150", groupOpen && "bg-slate-900/40")}>
                <CollapsibleTrigger asChild>
                  <button className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 rounded-xl",
                    "text-[10px] font-black uppercase tracking-widest",
                    "transition-all duration-150 cursor-pointer",
                    groupActive ? theme.groupActiveText : "text-slate-400 hover:text-slate-200",
                    "hover:bg-slate-800/50"
                  )}>
                    <ChevronDown className={cn(
                      "h-3 w-3 flex-shrink-0 transition-transform duration-200 text-slate-400",
                      !groupOpen && "-rotate-90"
                    )} />
                    <span className="truncate">{navGroup.groupLabel}</span>
                    {groupActive && !groupOpen && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-sm shadow-emerald-400/50" />
                    )}
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="pb-1 space-y-0.5">
                    <SidebarMenu>
                      {navGroup.items.map((item) => {
                        const itemActive = checkIsItemActive(item.path);
                        const Icon = item.icon;

                        return (
                          <SidebarMenuItem key={item.path}>
                            <Link href={item.path} className="w-full">
                              <SidebarMenuButton
                                isActive={itemActive}
                                tooltip={item.title}
                                className={cn(
                                  "rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold flex items-center gap-2.5 w-full",
                                  itemActive
                                    ? `bg-slate-800 text-white font-bold border-l-4 ${theme.activeBorderClass} shadow-xs`
                                    : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                )}
                              >
                                <Icon className={cn("h-4 w-4 shrink-0", itemActive ? theme.iconActiveColorClass : "text-slate-400")} />
                                <span className="text-xs truncate">{item.title}</span>
                                {item.badge && (
                                  <span className="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </SidebarMenuButton>
                            </Link>
                          </SidebarMenuItem>
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

export default function VeterinarySidebarNavigation(props: VeterinarySidebarNavigationProps) {
  return (
    <Suspense fallback={null}>
      <VeterinarySidebarNavigationContent {...props} />
    </Suspense>
  );
}
