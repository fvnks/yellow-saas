"use client";

import { LogOut, Settings, User, ChevronsUpDown, Building2, ArrowLeft } from "lucide-react";
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
  admin: { label: 'Administrador', classes: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  manager: { label: 'Gerente', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  member: { label: 'Miembro', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  viewer: { label: 'Observador', classes: 'bg-slate-100 text-slate-500 border border-slate-200' },
};

interface MiCuentaSidebarFooterMenuProps {
  user: { name: string; email: string; avatar?: string; role?: string };
}

export default function MiCuentaSidebarFooterMenu({ user }: MiCuentaSidebarFooterMenuProps) {
  const roleConfig = ROLE_CONFIG[user.role || 'member'] || ROLE_CONFIG.member;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-sm hover:bg-sidebar-accent/50 transition-all duration-200 group/user">
              <Avatar className="h-9 w-9 ring-2 ring-violet-200/50 group-hover/user:ring-violet-300 transition-all dark:ring-violet-500/30 dark:group-hover/user:ring-violet-400/50">
                <AvatarFallback className="bg-gradient-to-br from-violet-400 via-violet-500 to-purple-600 text-white text-xs font-bold">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden min-w-0">
                <span className="font-semibold text-slate-900 text-sm truncate dark:text-white">{user.name}</span>
                <span className="text-[11px] text-slate-400 truncate dark:text-slate-500">{user.email}</span>
                <span className={`inline-flex items-center mt-1 px-1.5 py-0 rounded-full text-[8px] font-semibold w-fit ${roleConfig.classes}`}>
                  {roleConfig.label}
                </span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-slate-400 group-data-[collapsible=icon]:hidden flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Volver al ERP</span>
            </DropdownMenuItem>
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
