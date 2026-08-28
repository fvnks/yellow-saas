'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar";
import { restaurantSidebarItems } from "@/navigation/sidebar/restaurant-sidebar-items";
import RestaurantSidebarHeader from "./restaurant-sidebar-header";
import RestaurantSidebarNavigation from "./restaurant-sidebar-navigation";
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import { useRestaurantRole } from "../../lib/role-context";
import { ROLE_BADGES, ROLE_LABELS } from "../../lib/restaurant-store";
import { cn } from "@/lib/utils";

export function RestaurantSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { currentUser, switchUser, users } = useRestaurantRole();

  const user = currentUser
    ? {
        name: currentUser.name,
        email: currentUser.email,
        role: ROLE_LABELS[currentUser.role] || 'Usuario',
        badge: ROLE_BADGES[currentUser.role] || '',
      }
    : { name: 'Usuario', email: '', role: 'Usuario', badge: '' };

  return (
    <Sidebar className="border-r border-slate-800 bg-[#0F172A] text-slate-300 select-none shadow-xl" collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#0F172A] pt-3">
        <RestaurantSidebarHeader />
        <SidebarSeparator className="mx-3 bg-slate-800/80 my-2" />
      </SidebarHeader>

      <SidebarContent className="bg-[#0F172A] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <ModuleSidebarBackButton moduleKey="restaurante" />
        <RestaurantSidebarNavigation sidebarItems={restaurantSidebarItems} />
      </SidebarContent>

      <SidebarFooter className="bg-[#0F172A] p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:justify-center">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-amber-400 text-slate-900 border border-amber-500/60">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
            <span className={cn("inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold border", user.badge)}>
              {user.role}
            </span>
          </div>
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-2">Cambiar usuario</label>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => switchUser(e.target.value)}
            className="mt-1 w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {ROLE_LABELS[u.role]}
              </option>
            ))}
          </select>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
