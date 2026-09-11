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
 owner: { label: 'Propietario', classes: 'bg-snow/10 text-monday-violet border border-monday-violet/30 font-black' },
 admin: { label: 'Administrador', classes: 'bg-snow/10 text-monday-violet border border-monday-violet/30 font-black' },
 manager: { label: 'Gerente', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold' },
 member: { label: 'Miembro', classes: 'bg-cloud text-slate-300 border border-slate-700 font-medium' },
 viewer: { label: 'Observador', classes: 'bg-cloud/60 text-iron border border-slate-700/60 font-normal' },
};

interface MiCuentaSidebarFooterMenuProps {
 user: {
 name: string;
 email: string;
 avatar?: string;
 role?: string;
 };
}

export default function MiCuentaSidebarFooterMenu({ user }: MiCuentaSidebarFooterMenuProps) {
 const roleConfig = ROLE_CONFIG[user.role || 'member'] || ROLE_CONFIG.member;

 return (
 <SidebarMenu>
 <SidebarMenuItem>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-cloud border border-transparent hover:border-mist transition-all duration-200 group/user">
 <Avatar className="h-9 w-9 ring-2 ring-monday-violet/30 group-hover/user:ring-monday-violet transition-all shrink-0">
 <AvatarFallback className="bg-gradient-to-br from-amber-500 via-amber-500 to-yellow-600 text-slate-950 text-xs font-black shadow-inner">
 {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden min-w-0">
 <span className="font-bold text-ink text-xs truncate leading-snug">{user.name}</span>
 <span className="text-[10px] text-iron truncate leading-snug">{user.email}</span>
 <span className={`inline-flex items-center mt-1 px-1.5 py-0 rounded-full text-[8px] uppercase tracking-wider w-fit ${roleConfig.classes}`}>
 {roleConfig.label}
 </span>
 </div>
 <ChevronsUpDown className="h-3.5 w-3.5 text-iron group-data-[collapsible=icon]:hidden flex-shrink-0" />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent side="top" align="start" className="w-56 bg-snow border border-mist text-ink shadow-xl rounded-xl p-1">
 <DropdownMenuItem className="cursor-pointer text-xs focus:bg-cloud focus:text-ink rounded-lg">
 <Building2 className="mr-2 h-4 w-4 text-monday-violet" />
 <span>Mi Empresa</span>
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer text-xs focus:bg-cloud focus:text-ink rounded-lg">
 <User className="mr-2 h-4 w-4 text-monday-violet" />
 <span>Mi Cuenta</span>
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer text-xs focus:bg-cloud focus:text-ink rounded-lg">
 <Settings className="mr-2 h-4 w-4 text-monday-violet" />
 <span>Configuración</span>
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-cloud" />
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