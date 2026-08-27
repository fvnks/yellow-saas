import { LucideIcon } from 'lucide-react';

export type ModuleType =
  | 'dashboard'
  | 'condominio'
  | 'recetas'
  | 'proyectos'
  | 'hr'
  | 'micuenta'
  | 'ayuda'
  | 'admin';

export interface ModuleSidebarTheme {
  moduleKey: ModuleType;
  title: string;
  badgeLabel: string;
  subtitle: string;
  headerBadgeBg: string;
  headerBadgeText: string;
  headerBadgeBorder: string;
  activeBorderClass: string;
  iconActiveColorClass: string;
  backIconColorClass: string;
  activeBadgeClass: string;
  inactiveBadgeClass: string;
  avatarClass: string;
}

export const MODULE_SIDEBAR_THEMES: Record<ModuleType, ModuleSidebarTheme> = {
  dashboard: {
    moduleKey: 'dashboard',
    title: 'ERP Principal',
    badgeLabel: 'ERP',
    subtitle: 'Ventas, Bodega & Finanzas',
    headerBadgeBg: 'bg-amber-500/10',
    headerBadgeText: 'text-amber-400',
    headerBadgeBorder: 'border-amber-500/20',
    activeBorderClass: 'border-amber-400',
    iconActiveColorClass: 'text-amber-400',
    backIconColorClass: 'text-amber-400',
    activeBadgeClass: 'bg-[#FACC15] text-slate-950 border-amber-300 font-black',
    inactiveBadgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-extrabold',
    avatarClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  condominio: {
    moduleKey: 'condominio',
    title: 'Mi Condominio',
    badgeLabel: 'Condominio',
    subtitle: 'Administración Ley 21.442',
    headerBadgeBg: 'bg-cyan-500/10',
    headerBadgeText: 'text-cyan-400',
    headerBadgeBorder: 'border-cyan-500/20',
    activeBorderClass: 'border-cyan-400',
    iconActiveColorClass: 'text-cyan-400',
    backIconColorClass: 'text-cyan-400',
    activeBadgeClass: 'bg-cyan-400 text-slate-950 border-cyan-300 font-black',
    inactiveBadgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-extrabold',
    avatarClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  recetas: {
    moduleKey: 'recetas',
    title: 'Recetas & BOM',
    badgeLabel: 'Recetas',
    subtitle: 'Producción & Rendimiento',
    headerBadgeBg: 'bg-orange-500/10',
    headerBadgeText: 'text-orange-400',
    headerBadgeBorder: 'border-orange-500/20',
    activeBorderClass: 'border-orange-400',
    iconActiveColorClass: 'text-orange-400',
    backIconColorClass: 'text-orange-400',
    activeBadgeClass: 'bg-orange-400 text-slate-950 border-orange-300 font-black',
    inactiveBadgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30 font-extrabold',
    avatarClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  proyectos: {
    moduleKey: 'proyectos',
    title: 'Proyectos & Obras',
    badgeLabel: 'Proyectos',
    subtitle: 'Presupuestos & Hitos',
    headerBadgeBg: 'bg-purple-500/10',
    headerBadgeText: 'text-purple-400',
    headerBadgeBorder: 'border-purple-500/20',
    activeBorderClass: 'border-purple-400',
    iconActiveColorClass: 'text-purple-400',
    backIconColorClass: 'text-purple-400',
    activeBadgeClass: 'bg-purple-400 text-slate-950 border-purple-300 font-black',
    inactiveBadgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-extrabold',
    avatarClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  hr: {
    moduleKey: 'hr',
    title: 'RRHH & Sueldos',
    badgeLabel: 'RRHH',
    subtitle: 'Liquidaciones & Asistencia',
    headerBadgeBg: 'bg-rose-500/10',
    headerBadgeText: 'text-rose-400',
    headerBadgeBorder: 'border-rose-500/20',
    activeBorderClass: 'border-rose-400',
    iconActiveColorClass: 'text-rose-400',
    backIconColorClass: 'text-rose-400',
    activeBadgeClass: 'bg-rose-400 text-slate-950 border-rose-300 font-black',
    inactiveBadgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-extrabold',
    avatarClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  micuenta: {
    moduleKey: 'micuenta',
    title: 'Mi Cuenta SaaS',
    badgeLabel: 'SaaS',
    subtitle: 'Suscripción & Módulos',
    headerBadgeBg: 'bg-blue-500/10',
    headerBadgeText: 'text-blue-400',
    headerBadgeBorder: 'border-blue-500/20',
    activeBorderClass: 'border-blue-400',
    iconActiveColorClass: 'text-blue-400',
    backIconColorClass: 'text-blue-400',
    activeBadgeClass: 'bg-blue-400 text-slate-950 border-blue-300 font-black',
    inactiveBadgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-extrabold',
    avatarClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  ayuda: {
    moduleKey: 'ayuda',
    title: 'Centro de Ayuda',
    badgeLabel: 'Soporte',
    subtitle: 'Documentación & Tickets',
    headerBadgeBg: 'bg-emerald-500/10',
    headerBadgeText: 'text-emerald-400',
    headerBadgeBorder: 'border-emerald-500/20',
    activeBorderClass: 'border-emerald-400',
    iconActiveColorClass: 'text-emerald-400',
    backIconColorClass: 'text-emerald-400',
    activeBadgeClass: 'bg-emerald-400 text-slate-950 border-emerald-300 font-black',
    inactiveBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-extrabold',
    avatarClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  admin: {
    moduleKey: 'admin',
    title: 'Super Admin',
    badgeLabel: 'Admin',
    subtitle: 'Control Global SaaS',
    headerBadgeBg: 'bg-rose-500/10',
    headerBadgeText: 'text-rose-400',
    headerBadgeBorder: 'border-rose-500/20',
    activeBorderClass: 'border-rose-400',
    iconActiveColorClass: 'text-rose-400',
    backIconColorClass: 'text-rose-400',
    activeBadgeClass: 'bg-rose-400 text-slate-950 border-rose-300 font-black',
    inactiveBadgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-extrabold',
    avatarClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
};
