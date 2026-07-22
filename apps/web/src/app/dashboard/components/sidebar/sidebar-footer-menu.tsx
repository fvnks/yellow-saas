"use client";

import { LogOut, Settings, User, ChevronsUpDown } from "lucide-react";

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

interface SidebarFooterMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function SidebarFooterMenu({ user }: SidebarFooterMenuProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-sm hover:bg-sidebar-accent/60 transition-all duration-200 group/user">
              <Avatar className="h-9 w-9 ring-2 ring-slate-200 group-hover/user:ring-indigo-200 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden min-w-0">
                <span className="font-semibold text-slate-900 text-sm truncate">{user.name}</span>
                <span className="text-[11px] text-slate-400 truncate">{user.email}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-slate-400 group-data-[collapsible=icon]:hidden flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mi Cuenta</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600 cursor-pointer focus:text-rose-600 focus:bg-rose-50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
