'use client';

import Link from 'next/link';
import { ChevronsUpDown, User, LifeBuoy, LogOut } from 'lucide-react';
import { MODULE_SIDEBAR_THEMES, ModuleType } from '@/lib/sidebar-theme';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/animate-ui/components/radix/sidebar';
import { clearAuthToken } from '@/lib/auth-token';

interface Props {
  moduleKey: ModuleType;
  user: { name: string; email?: string; role?: string };
}

export default function ModuleSidebarFooter({ moduleKey, user }: Props) {
  const t = useTranslations('common');
  const theme = MODULE_SIDEBAR_THEMES[moduleKey];
  const initials = (user.name || 'Admin').slice(0, 2).toUpperCase();
  const defaultRole = t('usuario');

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = '/login';
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-cloud data-[state=open]:text-ink rounded-xl px-2 py-1.5 hover:bg-cloud"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${theme.avatarClass}`}>
                {initials}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-xs font-bold text-ink">{user.name}</span>
                <span className="truncate text-[10px] text-iron">{user.role || defaultRole}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-iron group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl bg-snow border border-mist shadow-xl"
            side="right"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${theme.avatarClass}`}>
                  {initials}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate text-xs font-bold text-ink">{user.name}</span>
                  <span className="truncate text-[10px] text-iron">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-mist" />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/mi-cuenta" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4 text-iron" />
                  <span className="text-xs font-medium">Mi cuenta</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/ayuda" className="flex items-center gap-2 cursor-pointer">
                  <LifeBuoy className="w-4 h-4 text-iron" />
                  <span className="text-xs font-medium">Soporte</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-mist" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-[#e24444] hover:!text-[#e24444]"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
