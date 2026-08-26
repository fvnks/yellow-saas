'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { condominioSidebarItems } from '@/navigation/sidebar/condominio-sidebar-items';

export default function CondominioSidebarNavigation() {
  const pathname = usePathname();

  return (
    <>
      {condominioSidebarItems.map((group, i) => (
        <SidebarGroup key={i} className="py-2">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-1 group-data-[collapsible=icon]:hidden">
            {group.title}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5 px-2">
            {group.items.map((item) => {
              const isActive = pathname === item.url || (item.url !== '/condominio' && pathname.startsWith(item.url));
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.url}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold
                        ${isActive
                          ? 'bg-slate-800 text-white font-bold border-l-4 border-cyan-400 pl-2 shadow-xs'
                          : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="group-data-[collapsible=icon]:hidden truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="group-data-[collapsible=icon]:hidden text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}