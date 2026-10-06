'use client';

import * as React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from '@/components/animate-ui/components/radix/sidebar';
import { NavGroup } from '@/navigation/sidebar/sidebar-items';
import ModuleSidebarBackButton from '@/components/sidebar/module-sidebar-back-button';
import ModuleSidebarFooter from '@/components/sidebar/module-sidebar-footer';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart, ShoppingBag, Users, Truck, Handshake, Wallet, Calculator,
  FolderKanban, Monitor, CreditCard, Settings, UtensilsCrossed, RefreshCw, ScrollText, AlertTriangle, FileText,
  Receipt, BarChart3, MapPin, DollarSign, TrendingUp, Tag, BookOpen, UserCheck, Shield, Bell, Webhook, Globe,
  ArrowLeftRight, Boxes, Wrench, History, ClipboardList, FileBarChart, TruckIcon, CircleDollarSign, Building2,
  UsersRound, ClipboardCheck, GraduationCap, UserPlus, Upload, Plus, Clock, List, Lock, FlaskConical, Play,
  Building, FileDown, Search, X, ChevronDown, ChevronRight,
  Calendar, Library, Bus, FileSpreadsheet
} from 'lucide-react';

export interface UnifiedSidebarProps {
  sidebarItems: NavGroup[];
  moduleKey: string;
  moduleTitle: string;
  moduleSubtitle?: string;
  moduleIcon?: React.ComponentType<{ className?: string }>;
  theme?: 'default' | 'purple' | 'cyan' | 'green' | 'orange' | 'red' | 'blue';
  extraHeaderContent?: React.ReactNode;
  extraFooterContent?: React.ReactNode;
  sidebarProps?: React.ComponentProps<typeof Sidebar>;
  contentClassName?: string;
  filterByActiveModules?: boolean;
  getCompanyId?: () => string | null;
}

const THEME_CLASSES = {
  default: {
    brandBg: 'bg-sunshine p-1.5 shadow-sm shadow-sunshine/20',
    brandText: 'text-sunshine-ink',
    borderColor: 'border-mist',
    activeBorder: 'border-l-4 border-sunshine-dark',
    activeBg: 'bg-sunshine/10',
    activeText: 'text-sunshine-ink',
    railColor: 'text-iron',
  },
  purple: {
    brandBg: 'bg-purple-600 p-1.5 shadow-sm shadow-purple-600/20',
    brandText: 'text-white',
    borderColor: 'border-purple-100',
    activeBorder: 'border-l-4 border-purple-600',
    activeBg: 'bg-purple-50',
    activeText: 'text-purple-700',
    railColor: 'text-purple-400',
  },
  cyan: {
    brandBg: 'bg-cyan-600 p-1.5 shadow-sm shadow-cyan-600/20',
    brandText: 'text-white',
    borderColor: 'border-cyan-100',
    activeBorder: 'border-l-4 border-cyan-600',
    activeBg: 'bg-cyan-50',
    activeText: 'text-cyan-700',
    railColor: 'text-cyan-400',
  },
  green: {
    brandBg: 'bg-emerald-600 p-1.5 shadow-sm shadow-emerald-600/20',
    brandText: 'text-white',
    borderColor: 'border-emerald-100',
    activeBorder: 'border-l-4 border-emerald-600',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    railColor: 'text-emerald-400',
  },
  orange: {
    brandBg: 'bg-amber-600 p-1.5 shadow-sm shadow-amber-600/20',
    brandText: 'text-white',
    borderColor: 'border-amber-100',
    activeBorder: 'border-l-4 border-amber-600',
    activeBg: 'bg-amber-50',
    activeText: 'text-amber-700',
    railColor: 'text-amber-400',
  },
  red: {
    brandBg: 'bg-rose-600 p-1.5 shadow-sm shadow-rose-600/20',
    brandText: 'text-white',
    borderColor: 'border-rose-100',
    activeBorder: 'border-l-4 border-rose-600',
    activeBg: 'bg-rose-50',
    activeText: 'text-rose-700',
    railColor: 'text-rose-400',
  },
  blue: {
    brandBg: 'bg-blue-600 p-1.5 shadow-sm shadow-blue-600/20',
    brandText: 'text-white',
    borderColor: 'border-blue-100',
    activeBorder: 'border-l-4 border-blue-600',
    activeBg: 'bg-blue-50',
    activeText: 'text-blue-700',
    railColor: 'text-blue-400',
  },
} as const;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Package, Warehouse, ShoppingCart, ShoppingBag, Users, Truck, Handshake, Wallet, Calculator,
  FolderKanban, Monitor, CreditCard, Settings, UtensilsCrossed, RefreshCw, ScrollText, AlertTriangle, FileText,
  Receipt, BarChart3, MapPin, DollarSign, TrendingUp, Tag, BookOpen, UserCheck, Shield, Bell, Webhook, Globe,
  ArrowLeftRight, Boxes, Wrench, History, ClipboardList, FileBarChart, TruckIcon, CircleDollarSign, Building2,
  UsersRound, ClipboardCheck, GraduationCap, UserPlus, Upload, Plus, Clock, List, Lock, FlaskConical, Play,
  Building, FileDown, Calendar, Library, Bus, FileSpreadsheet,
};

function getIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  return iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : LayoutDashboard;
}

function UnifiedSidebarBrandHeader({
  moduleTitle,
  moduleSubtitle,
  moduleIcon,
  theme = 'default',
}: {
  moduleTitle: string;
  moduleSubtitle?: string;
  moduleIcon?: React.ComponentType<{ className?: string }>;
  theme?: keyof typeof THEME_CLASSES;
}) {
  const colors = THEME_CLASSES[theme];

  return (
    <div className={`flex items-center gap-3 px-2 py-1.5 rounded-xl bg-cloud border ${colors.borderColor}`}>
      <a className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.brandBg} shrink-0 hover:scale-105 transition-transform`} href="/select">
        {moduleIcon ? (() => { const Icon = moduleIcon; return <Icon className={`w-5 h-5 ${colors.brandText}`} />; })() : (
          <span className="text-sunshine-ink font-bold text-xs">Y</span>
        )}
      </a>
      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-[10px] font-black tracking-widest uppercase ${colors.brandText}`}>{moduleTitle}</span>
        </div>
        {moduleSubtitle && (
          <p className="text-xs font-bold text-ink truncate mt-0.5">{moduleSubtitle}</p>
        )}
      </div>
    </div>
  );
}

export function UnifiedSidebar({
  sidebarItems,
  moduleKey,
  moduleTitle,
  moduleSubtitle,
  moduleIcon,
  theme = 'default',
  extraHeaderContent,
  extraFooterContent,
  sidebarProps,
  contentClassName,
  filterByActiveModules = false,
  getCompanyId,
}: UnifiedSidebarProps) {
  const colors = THEME_CLASSES[theme];

  const [activatedModules, setActivatedModules] = React.useState<Set<string> | null>(null);

  React.useEffect(() => {
    if (!filterByActiveModules) return;
    try {
      const companyId = getCompanyId?.();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      if (companyId && token) {
        fetch(`/api/companies/${companyId}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data) return;
            const active = new Set<string>(
              (data.data?.modules || [])
                .filter((m: any) => m.status === 'active')
                .map((m: any) => m.module_name)
            );
            if (active.size > 0) setActivatedModules(active);
          })
          .catch(() => {});
      }
    } catch {}
  }, [filterByActiveModules, getCompanyId]);

  const filteredItems = React.useMemo(() => {
    if (!filterByActiveModules || activatedModules === null || activatedModules.size === 0) {
      return sidebarItems;
    }
    return sidebarItems.filter((group) => {
      if (!group.requiredModule) return true;
      return activatedModules.has(group.requiredModule);
    });
  }, [sidebarItems, filterByActiveModules, activatedModules]);

  return (
    <Sidebar
      className={cn(
        'border-r bg-snow text-ink select-none shadow-card collapsible-icon',
        colors.borderColor,
        sidebarProps?.className
      )}
      collapsible="icon"
      {...sidebarProps}
    >
      <SidebarHeader className="bg-snow pt-3">
        <UnifiedSidebarBrandHeader
          moduleTitle={moduleTitle}
          moduleSubtitle={moduleSubtitle}
          moduleIcon={moduleIcon}
          theme={theme}
        />
        <SidebarSeparator className={`mx-3 my-2 ${colors.borderColor}`} />
        {extraHeaderContent}
      </SidebarHeader>

      <SidebarContent className={cn('bg-snow', contentClassName)}>
        <ModuleSidebarBackButton moduleKey={moduleKey as any} />
        <UnifiedSidebarNavigation sidebarItems={filteredItems} moduleKey={moduleKey} theme={theme} />
        {extraFooterContent}
      </SidebarContent>

      <SidebarFooter className={`bg-snow p-3 border-t ${colors.borderColor}`}>
        <ModuleSidebarFooter moduleKey={moduleKey as any} user={{ name: 'Usuario', email: '', role: '' }} />
      </SidebarFooter>

      <SidebarRail className={colors.railColor} />
    </Sidebar>
  );
}

function UnifiedSidebarNavigation({
  sidebarItems,
  moduleKey,
  theme = 'default',
}: {
  sidebarItems: NavGroup[];
  moduleKey: string;
  theme?: keyof typeof THEME_CLASSES;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});
  const groupTriggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const itemTriggerRefs = React.useRef<Record<string, HTMLElement | null>>({});

  // `usePathname` devuelve la misma ruta en SSR y en cliente, evitando el
  // error de hidratación que ocurría al leer `window.location` durante el
  // render. Se normaliza para ignorar el prefijo de locale (/es, /en).
  const path = usePathname().replace(/^\/(es|en)(?=\/|$)/, '') || '/';

  const filteredItems = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filterSubItems = (items: any[]): any[] => {
      return items.filter(sub => {
        if (query && !sub.title.toLowerCase().includes(query)) return false;
        if (sub.subItems) sub.subItems = filterSubItems(sub.subItems);
        return true;
      });
    };

    return sidebarItems
      .map(group => {
        const matchingItems = group.items.filter(item => {
          const matchesItemTitle = !query || item.title.toLowerCase().includes(query) || group.label?.toLowerCase().includes(query);
          const filteredSubs = item.subItems ? filterSubItems(item.subItems) : [];
          const hasMatchingSubs = filteredSubs.length > 0;
          if (query && !matchesItemTitle && !hasMatchingSubs) return false;
          return true;
        });
        return { ...group, items: matchingItems };
      })
      .filter(group => group.items.length > 0);
  }, [sidebarItems, searchQuery]);

  const colors = THEME_CLASSES[theme];

  // Longitud del prefijo con el que `path` coincide con `itemPath` (-1 si no).
  const matchLen = React.useCallback(
    (itemPath: string) => {
      const clean = (itemPath || '').split('?')[0].replace(/\/+$/, '');
      if (!clean) return -1;
      if (path === clean) return clean.length;
      if (path.startsWith(clean + '/')) return clean.length;
      return -1;
    },
    [path]
  );

  // El ítem más específico gana: así "Dashboard" no queda resaltado junto a
  // la subpágina activa (p. ej. /educacion/estudiantes).
  const bestMatch = React.useMemo(() => {
    let best = -1;
    for (const group of filteredItems) {
      for (const item of group.items) {
        const candidates = item.subItems
          ? item.subItems.flatMap((sub: any) => [sub.path, ...(sub.subItems ?? []).map((n: any) => n.path)])
          : [item.path];
        for (const candidate of candidates) {
          const len = matchLen(candidate);
          if (len > best) best = len;
        }
      }
    }
    return best;
  }, [filteredItems, matchLen]);

  const isActive = (itemPath: string, subItems?: any[]) => {
    if (subItems) {
      // Un contenedor con hijos está activo si alguno de ellos coincide.
      return subItems.some(
        (subItem) =>
          matchLen(subItem.path) >= 0 ||
          (subItem.subItems ?? []).some((nested: any) => matchLen(nested.path) >= 0)
      );
    }
    const len = matchLen(itemPath);
    return len >= 0 && len === bestMatch;
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => {
      if (path.startsWith(item.path)) return true;
      if (item.subItems) return item.subItems.some((sub) => path.startsWith(sub.path.split('?')[0]));
      return false;
    });
  };

  const renderIcon = (iconName?: string, itemActive?: boolean) => {
    const Icon = getIcon(iconName);
    return <Icon className={`h-4 w-4 shrink-0 ${itemActive ? colors.activeText : 'text-iron'}`} />;
  };

  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="px-1 group-data-[collapsible=icon]:hidden">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-iron pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar menú..."
            className="w-full bg-cloud border border-mist text-xs text-ink placeholder:text-iron rounded-md pl-8 pr-7 py-1.5 focus:outline-none focus:border-sunshine-dark focus:ring-1 focus:ring-sunshine-dark/20 transition-all"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 text-iron hover:text-ink">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2 text-[9px] font-mono font-bold text-iron bg-mist/50 px-1.5 py-0.5 rounded">⌘K</span>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-xs text-iron text-center py-4 px-2 group-data-[collapsible=icon]:hidden">No hay coincidencias</p>
      ) : (
        filteredItems.map((navGroup, groupIndex) => {
          const groupActive = isGroupActive(navGroup);
          const groupOpen = openGroups[navGroup.id] ?? false;

          return (
            <div key={navGroup.id} className="group/collapsible-group">
              <div className={`rounded-xl transition-all duration-150 ${groupOpen ? 'bg-cloud' : ''}`}>
                {navGroup.label && (
                  <button
                    ref={(el) => { groupTriggerRefs.current[String(navGroup.id)] = el; }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 rounded-xl',
                      'text-[10px] font-black uppercase tracking-widest',
                      'transition-all duration-150 cursor-pointer',
                      groupActive ? 'text-sunshine-ink' : 'text-iron hover:text-ink',
                      'hover:bg-cloud'
                    )}
                    onClick={() => setOpenGroups(prev => ({ ...prev, [navGroup.id]: !prev[navGroup.id] }))}
                  >
                    <ChevronDown className={cn('h-3 w-3 flex-shrink-0 transition-transform duration-200 text-iron', !groupOpen && '-rotate-90')} />
                    <span className="truncate">{navGroup.label}</span>
                    {groupActive && !groupOpen && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-sunshine animate-pulse flex-shrink-0 shadow-sm shadow-sunshine/50" />
                    )}
                  </button>
                )}

                <div className="overflow-hidden">
                  <div className="pb-1 space-y-0.5">
                    {navGroup.items.map((item) => {
                      const itemActive = isActive(item.path, item.subItems);
                      return (
                        <div key={item.title} className="group/collapsible">
                          <button
                            ref={(el) => { itemTriggerRefs.current[item.title] = el; }}
                            className={cn(
                              'whitespace-nowrap rounded-xl transition-all duration-150 py-2.5 px-3 text-xs font-semibold w-full flex items-center gap-2',
                              itemActive
                                ? `bg-sunshine/10 text-sunshine-ink font-bold border-l-4 ${colors.activeBorder} shadow-xs`
                                : 'text-slate-text hover:text-ink hover:bg-cloud'
                            )}
                            onClick={() => item.subItems ? setOpenItems(prev => ({ ...prev, [item.title]: !prev[item.title] })) : {}}
                          >
                            {renderIcon(item.icon, itemActive)}
                            <span className="text-xs">{item.title}</span>
                            {item.subItems && (
                              <ChevronRight className={cn(
                                'ml-auto h-3.5 w-3.5 transition-transform duration-200 text-iron',
                                openItems[item.title] && 'rotate-90'
                              )} />
                            )}
                          </button>
                          {item.subItems && openItems[item.title] && (
                            <div className="border-l border-mist ml-3 pl-2 space-y-0.5 my-1">
                              {item.subItems.map((subItem) => (
                                <a key={subItem.title} href={subItem.path} className={cn(
                                  'rounded-xl text-xs py-1.5 px-2.5 transition-colors font-medium block',
                                  isActive(subItem.path)
                                    ? `bg-sunshine/10 ${colors.activeText} font-bold`
                                    : 'text-iron hover:text-ink hover:bg-cloud'
                                )}>
                                  {renderIcon(subItem.icon, isActive(subItem.path))}
                                  <span>{subItem.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {groupIndex < filteredItems.length - 1 && (
                <div className="my-1 mx-3 h-px bg-mist" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}