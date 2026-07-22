"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, ChevronDown } from "lucide-react";

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
import { NavGroup, NavMainItem, resolveIcon, ICON_MAP } from "@/navigation/sidebar/sidebar-items";

interface SidebarNavigationProps {
  sidebarItems: NavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">Próximamente</span>
);

export default function SidebarNavigation({ sidebarItems }: SidebarNavigationProps) {
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

  const renderIcon = (iconName: keyof typeof ICON_MAP | undefined): React.ReactNode => {
    const Icon = resolveIcon(iconName);
    return <Icon className="h-4 w-4" />;
  };

  const isActive = (itemPath: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems) {
      return subItems.some((subItem) => {
        const subPath = subItem.path.split("?")[0];
        return path.startsWith(subPath);
      });
    }
    return path.startsWith(itemPath);
  };

  const isGroupActive = (group: NavGroup) => {
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
            <div className={`
              rounded-lg transition-all duration-200
              ${groupOpen ? 'bg-sidebar-accent/40' : ''}
            `}>
              {navGroup.label && (
                <CollapsibleTrigger asChild>
                  <button className={`
                    flex w-full items-center gap-2 px-2.5 py-2 rounded-lg
                    text-[11px] font-semibold uppercase tracking-wider
                    transition-all duration-200 cursor-pointer
                    ${groupActive
                      ? 'text-sidebar-foreground'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80'
                    }
                    hover:bg-sidebar-accent/60
                  `}>
                    <ChevronDown className={`
                      h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200
                      ${!groupOpen ? '-rotate-90' : ''}
                    `} />
                    <span className="truncate">{navGroup.label}</span>
                    {groupActive && !groupOpen && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </button>
                </CollapsibleTrigger>
              )}

              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="pb-1">
                  <SidebarMenu>
                    {navGroup.items.map((item) => (
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
                                isActive={isActive(item.path, item.subItems)}
                                tooltip={item.title}
                                className="whitespace-nowrap"
                              >
                                {renderIcon(item.icon)}
                                <span>{item.title}</span>
                                {item.comingSoon && <IsComingSoon />}
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            ) : (
                              <Link href={item.path}>
                                <SidebarMenuButton
                                  disabled={item.comingSoon}
                                  isActive={isActive(item.path)}
                                  tooltip={item.title}
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
                                    <SidebarMenuSubButton
                                      aria-disabled={subItem.comingSoon}
                                      isActive={isActive(subItem.path)}
                                      asChild
                                    >
                                      <a href={subItem.path}>
                                        {renderIcon(subItem.icon)}
                                        <span>{subItem.title}</span>
                                        {subItem.comingSoon && <IsComingSoon />}
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          )}
                        </SidebarMenuItem>
                      </Collapsible>
                    ))}
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
