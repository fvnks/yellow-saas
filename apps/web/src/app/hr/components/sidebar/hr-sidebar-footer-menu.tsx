"use client";

import { LogOut, Settings, User, ChevronsUpDown, Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const ROLE_CONFIG: Record<string, { label: string; classes: string }> = {
  owner: { label: 'Propietario', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  admin: { label: 'Administrador', classes: 'bg-blue-50 text-primary border border-primary/20' },
  manager: { label: 'Gerente', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  member: { label: 'Miembro', classes: 'bg-muted text-foreground border border-border' },
  viewer: { label: 'Observador', classes: 'bg-muted text-muted-foreground border border-border' },
};

interface HRSidebarFooterMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}

export default function HRSidebarFooterMenu({ user }: HRSidebarFooterMenuProps) {
  const roleConfig = ROLE_CONFIG[user.role || 'member'] || ROLE_CONFIG.member;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-sm hover:bg-sidebar-accent/50 transition-all duration-200 group/user">
              <Avatar className="h-9 w-9 ring-2 ring-emerald-200/50 group-hover/user:ring-emerald-300 transition-all dark:ring-emerald-500/30 dark:group-hover/user:ring-emerald-400/50">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white text-xs font-bold">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden min-w-0">
                <span className="font-semibold text-foreground text-sm truncate dark:text-white">{user.name}</span>
                <span className="text-[11px] text-muted-foreground truncate dark:text-muted-foreground">{user.email}</span>
                <span className={`inline-flex items-center mt-1 px-1.5 py-0 rounded-full text-[8px] font-semibold w-fit ${roleConfig.classes}`}>
                  {roleConfig.label}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <Building2 className="mr-2 h-4 w-4" />
              <span>Mi Empresa</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; window.location.href = '/login'; }} className="text-rose-600 cursor-pointer focus:text-rose-600 focus:bg-rose-50 dark:text-rose-400 dark:focus:text-rose-400 dark:focus:bg-rose-500/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
