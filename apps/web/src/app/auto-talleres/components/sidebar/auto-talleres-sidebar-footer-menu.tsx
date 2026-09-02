"use client";

import { ChevronUp, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function AutoTalleresSidebarFooterMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="text-slate-400 hover:text-white hover:bg-slate-800/60 data-[state=open]:bg-slate-800/60">
              <Avatar className="h-7 w-7 rounded-lg bg-slate-700">
                <AvatarFallback className="rounded-lg bg-orange-500/20 text-orange-400 text-xs font-bold">
                  TU
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Taller Usuario</span>
              <ChevronUp className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width] bg-[#1E293B] border-slate-700 text-slate-200"
          >
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                ERP Principal
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/mi-cuenta" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mi Cuenta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auto-talleres/configuracion" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="text-rose-400 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
