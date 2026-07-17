"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
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
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updated: Record<string, boolean> = {};
    for (const group of sidebarItems) {
      for (const item of group.items) {
        if (item.subItems) {
          const shouldOpen = item.subItems.some((sub) => path.startsWith(sub.path));
          updated[item.title] = shouldOpen;
        }
      }
    }
    setOpenItems((prev) => ({ ...prev, ...updated }));
  }, [path, sidebarItems]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderIcon = (iconName: keyof typeof ICON_MAP | undefined): React.ReactNode => {
    const Icon = resolveIcon(iconName);
    return <Icon className="h-4 w-4" />;
  };

  const isActive = (itemPath: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems) {
      return subItems.some((subItem) => path.startsWith(subItem.path));
    }
    return path === itemPath;
  };

  return (
    <>
      {sidebarItems.map((navGroup) => (
        <SidebarGroup key={navGroup.id}>
          {navGroup.label && <SidebarGroupLabel>{navGroup.label}</SidebarGroupLabel>}
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
        </SidebarGroup>
      ))}
    </>
  );
}
