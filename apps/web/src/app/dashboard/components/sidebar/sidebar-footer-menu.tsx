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
  owner: { label: 'Propietario', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black' },
  admin: { label: 'Administrador', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black' },
  manager: { label: 'Gerente', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold' },
  member: { label: 'Miembro', classes: 'bg-slate-800 text-slate-300 border border-slate-700 font-medium' },
  viewer: { label: 'Observador', classes: 'bg-slate-800/60 text-slate-400 border border-slate-700/60 font-normal' },
};

interface SidebarFooterMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}

export default function SidebarFooterMenu({ user }: SidebarFooterMenuProps) {
  const roleConfig = ROLE_CONFIG[user.role || 'member'] || ROLE_CONFIG.member;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-slate-800/80 border border-transparent hover:border-slate-800 transition-all duration-200 group/user">
              <Avatar className="h-9 w-9 ring-2 ring-amber-500/40 group-hover/user:ring-amber-500 transition-all shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 via-amber-500 to-yellow-600 text-slate-950 text-xs font-black shadow-inner">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden min-w-0">
                <span className="font-bold text-slate-100 text-xs truncate leading-snug">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate leading-snug">{user.email}</span>
                <span className={`inline-flex items-center mt-1 px-1.5 py-0 rounded-full text-[8px] uppercase tracking-wider w-fit ${roleConfig.classes}`}>
                  {roleConfig.label}
                </span>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 group-data-[collapsible=icon]:hidden flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 bg-[#0F172A] border border-slate-800 text-slate-200 shadow-xl rounded-xl p-1">
            <DropdownMenuItem className="cursor-pointer text-xs focus:bg-slate-800 focus:text-white rounded-lg">
              <Building2 className="mr-2 h-4 w-4 text-amber-400" />
              <span>Mi Empresa</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-xs focus:bg-slate-800 focus:text-white rounded-lg">
              <User className="mr-2 h-4 w-4 text-amber-400" />
              <span>Mi Cuenta</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-xs focus:bg-slate-800 focus:text-white rounded-lg">
              <Settings className="mr-2 h-4 w-4 text-amber-400" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={() => { document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; window.location.href = '/login'; }}
              className="text-rose-400 cursor-pointer focus:text-rose-300 focus:bg-rose-500/10 text-xs rounded-lg font-semibold"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}