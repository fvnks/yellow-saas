'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Package, UsersRound, FolderKanban, Settings, CreditCard, ChevronRight,
X, Lock, Zap, FlaskConical, LifeBuoy, ArrowRight, LogOut, Building2, User, ChevronDown, Mail, Sparkles, TrendingUp, ShieldCheck, DollarSign, Building, UtensilsCrossed, Stethoscope, Shield, Car } from 'lucide-react';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/auth-token';
import { SiteLiquidButton } from '@/components/landing/SiteLiquidButton';
import { getApiClient } from '@/lib/api-client';
import { getChileanIndicators, ChileanIndicators } from '@/lib/indicators';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModuleOption {
 id: string;
 title: string;
 subtitle: string;
 description: string[];
 icon: any;
 iconBg: string;
 iconColor: string;
 accentBadge: string;
 href: string;
 requiredModules: string[];
 moduleName: string;
}

interface Company {
 id: string;
 name: string;
 slug?: string;
 logo_url?: string;
 plan?: string;
 status?: string;
 role: string;
 is_default?: boolean;
 is_active?: boolean;
}

const modules: ModuleOption[] = [
 {
 id: 'erp',
 title: 'ERP & Gestión',
 subtitle: 'Módulo Principal',
 description: ['Inventario y Bodegas', 'Ventas y DTE SII', 'Compras & Proveedores', 'CRM & Contabilidad'],
 icon: Package,
 iconBg: 'bg-sky-accent/30 border-sky-accent/50',
 iconColor: 'text-[#006680]',
 accentBadge: 'bg-sky-accent/30 text-[#006680] border-sky-accent/50',
 href: '/dashboard',
 requiredModules: [],
 moduleName: 'erp',
 },
 {
 id: 'hr',
 title: 'Recursos Humanos',
 subtitle: 'Nómina y Asistencia',
 description: ['Contratos', 'Asistencia Previred', 'Evaluaciones', 'Liquidaciones'],
 icon: UsersRound,
 iconBg: 'bg-[#e24444]/10 border-[#e24444]/20',
 iconColor: 'text-[#e24444]',
 accentBadge: 'bg-[#e24444]/10 text-[#e24444] border-[#e24444]/20',
 href: '/hr',
 requiredModules: [],
 moduleName: 'hr_premium',
 },
 {
 id: 'projects',
 title: 'Proyectos',
 subtitle: 'Seguimiento y Horas',
 description: ['Cronogramas Gantt', 'Tableros Kanban', 'Control Presupuesto', 'Avance de Obra'],
 icon: FolderKanban,
 iconBg: 'bg-lavender border-lavender',
 iconColor: 'text-[#8A6100]',
 accentBadge: 'bg-lavender text-[#8A6100] border-lavender',
 href: '/projects',
 requiredModules: [],
 moduleName: 'projects_pro',
 },
 {
 id: 'formulas',
 title: 'Recetas & Producción',
 subtitle: 'Cálculo de Ingredientes BOM',
 description: ['Fórmulas BOM', 'Lotes de Producción', 'Stock Decimal', 'Costos Insumos'],
 icon: FlaskConical,
 iconBg: 'bg-apricot/15 border-apricot/30',
 iconColor: 'text-[#cc5500]',
 accentBadge: 'bg-apricot/15 text-[#cc5500] border-apricot/30',
 href: '/recetas',
 requiredModules: [],
 moduleName: 'recetas',
 },
 {
 id: 'condominio',
 title: 'Mi Condominio',
 subtitle: 'Gastos Comunes y Copropiedad',
 description: ['Layout de Unidades', 'Prorrateo y Fondo Reserva', 'Avisos y Cobranza PDF', 'Portal Copropietario'],
 icon: Building,
 iconBg: 'bg-aqua/30 border-aqua/50',
 iconColor: 'text-[#006680]',
 accentBadge: 'bg-aqua/30 text-[#006680] border-aqua/50',
 href: '/condominio',
 requiredModules: [],
 moduleName: 'condominiums',
 },
 {
 id: 'restaurante',
 title: 'Restaurante & POS',
 subtitle: 'Comandas, KDS y Mesas',
 description: ['POS Garzón & Mesas', 'Kiosco Autoservicio QR', 'Pantallas KDS Cocina/Bar', 'Boleta Electrónica SII'],
 icon: UtensilsCrossed,
 iconBg: 'bg-apricot/15 border-apricot/30',
 iconColor: 'text-[#cc5500]',
 accentBadge: 'bg-apricot/15 text-[#cc5500] border-apricot/30',
 href: '/restaurant',
 requiredModules: [],
 moduleName: 'restaurant',
 },
 {
 id: 'veterinaria',
 title: 'Veterinaria & Clínica',
 subtitle: 'Fichas, Agenda y Consultas',
 description: ['Ficha Clínica Multiespecie', 'Agenda & Box de Atención', 'Hospitalización & Quirófano', 'Recetas & Vacunación'],
 icon: Stethoscope,
 iconBg: 'bg-mint/30 border-mint/50',
 iconColor: 'text-forest',
 accentBadge: 'bg-mint/30 text-forest border-mint/50',
 href: '/veterinaria',
 requiredModules: [],
 moduleName: 'veterinaria',
 },
 {
 id: 'auto-talleres',
 title: 'Talleres Automotrices',
 subtitle: 'Órdenes y Vehículos',
 description: ['Órdenes de Trabajo', 'Vehículos y Patentes', 'Estimados y Repuestos', 'Técnicos y Agenda'],
 icon: Car,
 iconBg: 'bg-apricot/15 border-apricot/30',
 iconColor: 'text-[#cc5500]',
 accentBadge: 'bg-apricot/15 text-[#cc5500] border-apricot/30',
 href: '/auto-talleres',
 requiredModules: [],
 moduleName: 'auto-talleres',
 },
 {
 id: 'mi-cuenta',
 title: 'Mi Cuenta',
 subtitle: 'Planes y Facturación',
 description: ['Mi Plan SaaS', 'Facturación ERP', 'Módulos Activos', 'Suscripción'],
 icon: CreditCard,
 iconBg: 'bg-periwinkle border-periwinkle',
 iconColor: 'text-sunshine-ink',
 accentBadge: 'bg-periwinkle text-sunshine-ink border-periwinkle',
 href: '/mi-cuenta',
 requiredModules: [],
 moduleName: 'mi-cuenta',
 },
 {
 id: 'ayuda',
 title: 'Soporte & Ayuda',
 subtitle: 'Centro de Asistencia',
 description: ['Preguntas Frecuentes', 'Tickets de Soporte', 'Manuales SII'],
 icon: LifeBuoy,
 iconBg: 'bg-mint/30 border-mint/50',
 iconColor: 'text-forest',
 accentBadge: 'bg-mint/30 text-forest border-mint/50',
 href: '/ayuda',
 requiredModules: [],
 moduleName: 'ayuda',
 },
];

function getUserFromToken() {
 if (typeof window === 'undefined') return null;
 // localStorage es la fuente de verdad (con fallback a
 // cookie); leer solo la cookie dejaba fuera sesiones
 // cuya cookie expiró pero el token aún es válido.
 const token = getAuthToken();
 if (!token) return null;
 try {
 const payload = JSON.parse(atob(token.split('.')[1]));
 return {
 role: payload.role || 'member',
 role_type: payload.role_type || 'company',
 name: payload.name || 'Usuario',
 email: payload.email || '',
 };
 } catch {
 return null;
 }
}

async function fetchUserCompanies(token: string): Promise<Company[]> {
 try {
 const res = await fetch('/api/auth/companies', {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await res.json();
 return data.data?.companies || [];
 } catch {
 return [];
 }
}

async function switchCompany(token: string, companyId: string): Promise<string | null> {
 try {
 const res = await fetch('/api/auth/switch-company', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ company_id: companyId }),
 });
 const data = await res.json();
 return data.data?.token || null;
 } catch {
 return null;
 }
}

function logout() {
 clearAuthToken();
 window.location.href = '/login';
}

export default function SelectPage() {
 const router = useRouter();
 const [company, setCompany] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [user, setUser] = useState<any>(null);
 const [activatedModules, setActivatedModules] = useState<Set<string>>(new Set());
 const [modalOpen, setModalOpen] = useState(false);
 const [selectedModule, setSelectedModule] = useState<ModuleOption | null>(null);
 const [activating, setActivating] = useState(false);
 const [lastAccess, setLastAccess] = useState<string | null>(null);
 const [companies, setCompanies] = useState<Company[]>([]);
 const [companiesLoading, setCompaniesLoading] = useState(true);
 const [indicators, setIndicators] = useState<ChileanIndicators | null>(null);
 const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
 const [superAdminCompanies, setSuperAdminCompanies] = useState<Company[]>([]);
 const [switchingCompany, setSwitchingCompany] = useState(false);

 useEffect(() => {
 getChileanIndicators().then(setIndicators);
 }, []);

 useEffect(() => {
 const userData = getUserFromToken();
 if (!userData) { router.push('/login'); return; }
 setUser(userData);

 const stored = localStorage.getItem('yellow_last_access');
 if (stored) {
 const date = new Date(stored);
 const now = new Date();
 const diffMs = now.getTime() - date.getTime();
 const diffMin = Math.floor(diffMs / 60000);
 if (diffMin < 1) setLastAccess('Hace menos de 1 minuto');
 else if (diffMin < 60) setLastAccess(`Hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`);
 else {
 const diffH = Math.floor(diffMin / 60);
 if (diffH < 24) setLastAccess(`Hace ${diffH} hora${diffH > 1 ? 's' : ''}`);
 else {
 const diffD = Math.floor(diffH / 24);
 setLastAccess(`Hace ${diffD} día${diffD > 1 ? 's' : ''}`);
 }
 }
 }

 const token = getAuthToken();

 Promise.all([
 token ? fetchUserCompanies(token) : Promise.resolve([]),
 loadActivatedModules(),
 ]).then(([companiesRes, _]) => {
 if (companiesRes) setCompanies(companiesRes);
 setCompaniesLoading(false);
 });

 try {
 const api = getApiClient();
 api.getCompany().then(companyRes => {
 if (companyRes) setCompany(companyRes);
 setLoading(false);
 }).catch(() => setLoading(false));
 } catch {
 setLoading(false);
 }
 }, [router]);

 const loadActivatedModules = async () => {
 try {
 const api = getApiClient();
 const companyId = api['companyId'];
 const token = getAuthToken();
 const res = await fetch(`/api/companies/${companyId}/modules`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await res.json();
 const active = new Set<string>(
 (data.data?.modules || [])
 .filter((m: any) => m.status === 'active')
 .map((m: any) => m.module_name)
 );
 setActivatedModules(active);
 } catch (err) {
 console.error('Failed to load activated modules:', err);
 }
 };

 const isModuleActivated = useCallback((mod: ModuleOption) => {
 if (mod.id === 'mi-cuenta' || mod.id === 'ayuda') return true;
 if (user?.role_type === 'super_admin') return true;
 return activatedModules.has(mod.moduleName);
 }, [activatedModules, user?.role_type]);

 const isSuperAdmin = user?.role_type === 'super_admin';

 const handleModuleClick = (mod: ModuleOption) => {
 if (isSuperAdmin && mod.id !== 'mi-cuenta' && mod.id !== 'ayuda') {
 openCompanyPicker(mod);
 return;
 }
 if (isModuleActivated(mod)) {
 router.push(mod.href);
 } else {
 setSelectedModule(mod);
 setModalOpen(true);
 }
 };

 const openCompanyPicker = async (mod: ModuleOption) => {
 setSelectedModule(mod);
 setCompanyPickerOpen(true);
 if (superAdminCompanies.length > 0) return;
 try {
 const token = getAuthToken();
 const res = await fetch('/api/super-admin/companies?limit=100', {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await res.json();
 setSuperAdminCompanies(data.data || []);
 } catch (err) {
 console.error('Failed to fetch companies:', err);
 }
 };

 const handleSuperAdminCompanySelect = async (companyId: string) => {
 if (!selectedModule) return;
 setSwitchingCompany(true);
 try {
 const token = getAuthToken();
 const res = await fetch('/api/super-admin/switch-company', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 body: JSON.stringify({ company_id: companyId }),
 });
 const data = await res.json();
 if (res.ok && data.data?.token) {
 setAuthToken(data.data.token, 604800);
 setCompanyPickerOpen(false);
 router.push(selectedModule.href);
 }
 } catch (err) {
 console.error('Failed to switch company:', err);
 }
 setSwitchingCompany(false);
 };

 const handleCompanySwitch = async (companyId: string) => {
 const token = getAuthToken();
 if (!token) return;
 const newToken = await switchCompany(token, companyId);
 if (newToken) {
 setAuthToken(newToken, 604800);
 window.location.reload();
 }
 };

 const handleActivate = async () => {
 if (!selectedModule) return;
 setActivating(true);
 try {
 const api = getApiClient();
 const companyId = api['companyId'];
 const token = getAuthToken();

 const modulesToActivate = selectedModule.requiredModules.length > 0
 ? selectedModule.requiredModules
 : [selectedModule.moduleName];

 await Promise.all(
 modulesToActivate.map((moduleName) =>
 fetch(`/api/companies/${companyId}/modules/activate`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 body: JSON.stringify({ module_name: moduleName }),
 })
 )
 );

 await loadActivatedModules();
 setModalOpen(false);
 router.push(selectedModule.href);
 } catch (err) {
 console.error('Failed to activate module:', err);
 }
 setActivating(false);
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-cloud flex items-center justify-center">
 <div className="flex flex-col items-center gap-3">
 <div className="w-10 h-10 border-3 border-sunshine-dark border-t-cloud rounded-full animate-spin" />
 <p className="text-xs text-slate-text font-semibold">Cargando módulos de Yellow ERP...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-cloud flex flex-col font-sans select-none text-ink">
 {/* Header */}
 <header className="bg-snow/90 border-b border-mist px-6 h-16 sticky top-0 z-30 backdrop-blur-xl flex items-center justify-between">
 <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-full p-0.5 shadow-sm flex items-center justify-center shrink-0" style={{ background: 'conic-gradient(from 270deg, #FFA500 15%, #33dbdb 40%, #33d58e 55%, #F5C518 65%, #fc527d 85%, #FFA500 100%)' }}>
 <div className="h-8 w-8 bg-snow rounded-full flex items-center justify-center">
 <span className="text-sunshine-ink font-bold text-xs">Y</span>
 </div>
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold text-ink">{company?.name || 'Yellow ERP'}</span>
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-mint/30 text-forest border border-mint/50">
 <ShieldCheck className="w-3 h-3 text-forest" /> Empresa Activa
 </span>
 </div>
 <p className="text-[10px] text-slate-text font-medium">Plataforma Empresarial PYME · Chile</p>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-sunshine/5 border border-sunshine-dark/15 rounded-md text-xs font-semibold text-ink">
 <TrendingUp className="w-3.5 h-3.5 text-sunshine-ink" />
 <span>UF: ${indicators ? indicators.uf.toLocaleString('es-CL') : '38.500'}</span>
 <span className="opacity-40">|</span>
 <DollarSign className="w-3.5 h-3.5 text-sunshine-ink -mr-1" />
 <span>USD: ${indicators ? indicators.dolar.toLocaleString('es-CL') : '950'}</span>
 </div>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-mist bg-snow hover:bg-cloud transition-all duration-150 shadow-xs">
 <div className="w-7 h-7 rounded-full bg-sunshine/10 flex items-center justify-center shrink-0 font-black text-xs text-sunshine-ink">
 {user?.name?.slice(0, 2).toUpperCase() || 'US'}
 </div>
 <div className="text-left hidden sm:block">
 <p className="text-xs font-bold text-ink leading-none">{user?.name}</p>
 <p className="text-[9px] text-slate-text mt-0.5 font-semibold uppercase tracking-wider">{user?.role}</p>
 </div>
 <ChevronDown className="w-3.5 h-3.5 text-iron" />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent side="bottom" align="end" className="w-60 bg-snow border border-mist rounded-2xl shadow-xl p-1.5">
 <div className="px-3 py-2 border-b border-mist">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-sunshine/10 flex items-center justify-center shrink-0 font-black text-xs text-sunshine-ink">
 {user?.name?.slice(0, 2).toUpperCase() || 'US'}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-ink truncate">{user?.name}</p>
 <p className="text-[10px] text-slate-text truncate">{user?.email}</p>
 </div>
 </div>
 </div>

 {!companiesLoading && companies.length > 1 && (
 <>
 <div className="px-3 py-1.5">
 <p className="text-[9px] font-bold text-iron uppercase tracking-widest">
 Empresas Disponibles
 </p>
 </div>
 {companies.map((c) => (
 <DropdownMenuItem
 key={c.id}
 onClick={() => handleCompanySwitch(c.id)}
 className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cloud transition-colors"
 disabled={c.id === company?.id}
 >
 <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center shrink-0">
 <Building2 className="w-3.5 h-3.5 text-sunshine-ink" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold text-ink truncate">{c.name}</p>
 <p className="text-[10px] text-slate-text capitalize">{c.role}</p>
 </div>
 {c.id === company?.id && (
 <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
 )}
 </DropdownMenuItem>
 ))}
 <DropdownMenuSeparator className="bg-mist" />
 </>
 )}

 {user?.role_type === 'super_admin' && (
 <>
 <DropdownMenuSeparator className="bg-mist" />
 <DropdownMenuItem
 onClick={() => router.push('/admin')}
 className="flex items-center gap-2.5 px-3 py-2 text-sunshine-ink hover:bg-sunshine/5 rounded-xl cursor-pointer transition-colors font-semibold"
 >
 <Shield className="w-4 h-4" />
 <span className="text-xs">Consola SaaS Admin</span>
 </DropdownMenuItem>
 </>
 )}

 <DropdownMenuItem
 onClick={logout}
 className="flex items-center gap-2 px-3 py-2 text-[#e24444] hover:bg-[#e24444]/5 rounded-xl cursor-pointer transition-colors font-semibold"
 >
 <LogOut className="w-4 h-4" />
 <span className="text-xs">Cerrar sesión</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </header>

 {/* Main Content Hub */}
 <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
 <div className="max-w-5xl w-full">
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.25 }}
 className="text-center mb-10"
 >
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-snow border border-mist text-xs font-bold text-slate-text shadow-xs mb-3">
 <Sparkles className="w-3.5 h-3.5 text-sunshine-ink" />
 <span>Yellow ERP Hub · Módulos SaaS</span>
 </div>
 <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
 Bienvenido de nuevo, {user?.name || 'Usuario'}
 </h2>
 <p className="text-xs sm:text-sm text-slate-text font-medium mt-1.5">
 Selecciona el área de trabajo o módulo operativo que deseas gestionar hoy
 </p>
 </motion.div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {modules.map((mod, i) => {
 const Icon = mod.icon;
 const activated = isModuleActivated(mod);
 return (
 <motion.button
 key={mod.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.2, delay: 0.04 * i }}
 onClick={() => handleModuleClick(mod)}
 className="group bg-snow border border-mist rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-card-hover hover:border-fog active:scale-[0.99] flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between mb-4">
 <div className={`w-12 h-12 ${mod.iconBg} rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-xs`}>
 <Icon className={`w-6 h-6 ${mod.iconColor}`} />
 </div>
 {activated ? (
 <div className="w-8 h-8 rounded-full bg-cloud flex items-center justify-center group-hover:bg-sunshine group-hover:text-ink transition-colors duration-200">
 <ArrowRight className="w-4 h-4 text-iron group-hover:text-white transition-colors" />
 </div>
 ) : (
 <div className="w-8 h-8 rounded-full bg-cloud flex items-center justify-center">
 <Lock className="w-4 h-4 text-iron" />
 </div>
 )}
 </div>
 
 <div className="flex items-center gap-2 mb-1">
 <h3 className="text-base font-black text-ink">{mod.title}</h3>
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border ${mod.accentBadge}`}>
 {mod.subtitle}
 </span>
 </div>

 <div className="flex flex-wrap gap-1.5 mt-4">
 {mod.description.map((item, j) => (
 <span
 key={j}
 className="inline-flex items-center px-2.5 py-1 bg-cloud text-slate-text text-[10px] font-semibold rounded-md border border-mist/60"
 >
 {item}
 </span>
 ))}
 </div>
 </div>

 <div className="mt-6 pt-3 border-t border-mist/50 flex items-center justify-between text-[10px]">
 <span className={activated ? 'text-forest font-bold' : 'text-iron font-medium'}>
 {activated ? '● Módulo Activo' : '🔒 Requiere Activación'}
 </span>
 <span className="text-ink font-bold group-hover:text-sunshine-ink transition-colors">
 Ingresar &rarr;
 </span>
 </div>
 </motion.button>
 );
 })}
 </div>

 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.25, delay: 0.2 }}
 className="text-center text-xs text-slate-text mt-10 font-medium"
 >
 ¿Necesitas cambiar de empresa o gestionar tu suscripción? Puedes hacerlo en cualquier momento desde el selector de perfil.
 </motion.p>
 </div>
 </div>

 {/* Activation Modal */}
 <AnimatePresence>
 {modalOpen && selectedModule && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
 onClick={() => setModalOpen(false)}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ duration: 0.15 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-snow rounded-3xl border border-mist shadow-xl w-full max-w-sm overflow-hidden"
 >
 <div className="p-6 text-center">
 <div className="w-14 h-14 bg-sunshine/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sunshine-dark/15">
 <Lock className="w-6 h-6 text-sunshine-ink" />
 </div>
 <h2 className="text-lg font-black text-ink">Activar Módulo</h2>
 <p className="text-xs text-slate-text mt-2 leading-relaxed font-medium">
 El módulo <span className="font-bold text-ink">{selectedModule.title}</span> requiere ser activado para tu empresa.
 </p>
 </div>
 <div className="px-6 pb-6 flex gap-3">
 <SiteLiquidButton variant="secondary" className="flex-1 py-2.5 text-xs" onClick={() => setModalOpen(false)}>
Cancelar
</SiteLiquidButton>
 <SiteLiquidButton variant="primary" className="flex-1 py-2.5 text-xs" onClick={handleActivate} disabled={activating}>
{activating ? (
<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
) : (
<>
<Zap className="w-4 h-4 fill-white" />
Activar Ahora
</>
)}
</SiteLiquidButton>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {companyPickerOpen && selectedModule && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
 onClick={() => setCompanyPickerOpen(false)}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ duration: 0.15 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-snow rounded-3xl border border-mist shadow-xl w-full max-w-md overflow-hidden"
 >
 <div className="p-6">
 <div className="w-14 h-14 bg-sunshine/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sunshine-dark/15">
 <Building2 className="w-6 h-6 text-sunshine-ink" />
 </div>
 <h2 className="text-lg font-black text-ink text-center">Seleccionar Empresa</h2>
 <p className="text-xs text-slate-text mt-2 leading-relaxed font-medium text-center">
 Como Super Administrador, elige la empresa para acceder a <span className="font-bold text-ink">{selectedModule.title}</span>.
 </p>
 </div>
 <div className="px-6 pb-2 max-h-80 overflow-y-auto">
 {superAdminCompanies.map((c) => (
 <button
 key={c.id}
 onClick={() => handleSuperAdminCompanySelect(c.id)}
 disabled={switchingCompany}
 className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cloud border border-transparent hover:border-mist transition-all text-left"
 >
 <div className="w-9 h-9 bg-ink rounded-lg flex items-center justify-center shrink-0">
 <Building2 className="w-4 h-4 text-sunshine-ink" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
 <p className="text-[10px] text-slate-text capitalize">{c.plan} · {c.status}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-iron shrink-0" />
 </button>
 ))}
 {superAdminCompanies.length === 0 && (
 <p className="text-xs text-slate-text text-center py-6">No hay empresas disponibles.</p>
 )}
 </div>
 <div className="px-6 pb-6 flex gap-3">
 <SiteLiquidButton variant="secondary" className="flex-1 py-2.5 text-xs" onClick={() => setCompanyPickerOpen(false)}>
 Cancelar
 </SiteLiquidButton>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Footer Access Log */}
 {lastAccess && (
 <div className="fixed bottom-4 right-5 text-[10px] text-slate-text select-none bg-snow border border-mist px-3 py-1 rounded-md shadow-xs font-semibold">
 Último acceso: {lastAccess}
 </div>
 )}
 </div>
 );
}
