export type ModuleType =
  | 'dashboard'
  | 'condominio'
  | 'recetas'
  | 'proyectos'
  | 'hr'
  | 'micuenta'
  | 'ayuda'
  | 'admin'
  | 'restaurante';

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
  activeSubItemText: string;
  groupActiveText: string;
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
    headerBadgeText: 'text-[#FACC15]',
    headerBadgeBorder: 'border-amber-500/20',
    activeBorderClass: 'border-[#FACC15]',
    iconActiveColorClass: 'text-[#FACC15]',
    backIconColorClass: 'text-[#FACC15]',
    activeSubItemText: 'text-[#FACC15]',
    groupActiveText: 'text-[#FACC15]',
    activeBadgeClass: 'bg-[#FACC15] text-slate-950 border-amber-300 font-black',
    inactiveBadgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-extrabold',
    avatarClass: 'bg-amber-500/20 text-[#FACC15] border-amber-500/40',
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
    activeSubItemText: 'text-cyan-400',
    groupActiveText: 'text-cyan-400',
    activeBadgeClass: 'bg-cyan-400 text-slate-950 border-cyan-300 font-black',
    inactiveBadgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-extrabold',
    avatarClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  recetas: {
    moduleKey: 'recetas',
    title: 'Recetas / BOM',
    badgeLabel: 'Recetas',
    subtitle: 'Producción & Insumos',
    headerBadgeBg: 'bg-orange-500/10',
    headerBadgeText: 'text-orange-400',
    headerBadgeBorder: 'border-orange-500/20',
    activeBorderClass: 'border-orange-500',
    iconActiveColorClass: 'text-orange-400',
    backIconColorClass: 'text-orange-400',
    activeSubItemText: 'text-orange-400',
    groupActiveText: 'text-orange-400',
    activeBadgeClass: 'bg-orange-500 text-white border-orange-400 font-black',
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
    activeBorderClass: 'border-purple-500',
    iconActiveColorClass: 'text-purple-400',
    backIconColorClass: 'text-purple-400',
    activeSubItemText: 'text-purple-400',
    groupActiveText: 'text-purple-400',
    activeBadgeClass: 'bg-purple-500 text-white border-purple-400 font-black',
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
    activeBorderClass: 'border-rose-500',
    iconActiveColorClass: 'text-rose-400',
    backIconColorClass: 'text-rose-400',
    activeSubItemText: 'text-rose-400',
    groupActiveText: 'text-rose-400',
    activeBadgeClass: 'bg-rose-500 text-white border-rose-400 font-black',
    inactiveBadgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-extrabold',
    avatarClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  micuenta: {
    moduleKey: 'micuenta',
    title: 'Mi Cuenta SaaS',
    badgeLabel: 'Cuenta',
    subtitle: 'Suscripción & Módulos',
    headerBadgeBg: 'bg-blue-500/10',
    headerBadgeText: 'text-blue-400',
    headerBadgeBorder: 'border-blue-500/20',
    activeBorderClass: 'border-blue-600',
    iconActiveColorClass: 'text-blue-400',
    backIconColorClass: 'text-blue-400',
    activeSubItemText: 'text-blue-400',
    groupActiveText: 'text-blue-400',
    activeBadgeClass: 'bg-blue-600 text-white border-blue-500 font-black',
    inactiveBadgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-extrabold',
    avatarClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  ayuda: {
    moduleKey: 'ayuda',
    title: 'Centro Ayuda',
    badgeLabel: 'Soporte',
    subtitle: 'Documentación & Tickets',
    headerBadgeBg: 'bg-emerald-500/10',
    headerBadgeText: 'text-emerald-400',
    headerBadgeBorder: 'border-emerald-500/20',
    activeBorderClass: 'border-emerald-500',
    iconActiveColorClass: 'text-emerald-400',
    backIconColorClass: 'text-emerald-400',
    activeSubItemText: 'text-emerald-400',
    groupActiveText: 'text-emerald-400',
    activeBadgeClass: 'bg-emerald-500 text-slate-950 border-emerald-400 font-black',
    inactiveBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-extrabold',
    avatarClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  admin: {
    moduleKey: 'admin',
    title: 'Super Admin',
    badgeLabel: 'Admin',
    subtitle: 'Consola Global SaaS',
    headerBadgeBg: 'bg-rose-500/10',
    headerBadgeText: 'text-rose-400',
    headerBadgeBorder: 'border-rose-500/20',
    activeBorderClass: 'border-rose-500',
    iconActiveColorClass: 'text-rose-400',
    backIconColorClass: 'text-rose-400',
    activeSubItemText: 'text-rose-400',
    groupActiveText: 'text-rose-400',
    activeBadgeClass: 'bg-rose-500 text-white border-rose-400 font-black',
    inactiveBadgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-extrabold',
    avatarClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  restaurante: {
    moduleKey: 'restaurante',
    title: 'Restaurante & POS',
    badgeLabel: 'POS',
    subtitle: 'Mesas, KDS, Carta & QR',
    headerBadgeBg: 'bg-amber-500/10',
    headerBadgeText: 'text-amber-400',
    headerBadgeBorder: 'border-amber-500/20',
    activeBorderClass: 'border-amber-500',
    iconActiveColorClass: 'text-amber-400',
    backIconColorClass: 'text-amber-400',
    activeSubItemText: 'text-amber-400',
    groupActiveText: 'text-amber-400',
    activeBadgeClass: 'bg-amber-500 text-slate-950 border-amber-300 font-black',
    inactiveBadgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-extrabold',
    avatarClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
};
