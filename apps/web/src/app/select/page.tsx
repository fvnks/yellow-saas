'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Package, UsersRound, FolderKanban, Settings, CreditCard, ChevronRight, X, Lock, Zap, FlaskConical, LifeBuoy, ArrowRight, LogOut, Building2, User, ChevronDown, Mail, Sparkles, TrendingUp, ShieldCheck, DollarSign, Building, UtensilsCrossed, Stethoscope } from 'lucide-react';
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
    iconBg: 'bg-blue-50 border-blue-200/80',
    iconColor: 'text-blue-600',
    accentBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    href: '/dashboard',
    requiredModules: ['inventory', 'products', 'sales', 'purchases', 'accounting', 'projects', 'crm'],
    moduleName: 'erp',
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    subtitle: 'Nómina y Asistencia',
    description: ['Contratos', 'Asistencia Previred', 'Evaluaciones', 'Liquidaciones'],
    icon: UsersRound,
    iconBg: 'bg-rose-50 border-rose-200/80',
    iconColor: 'text-rose-600',
    accentBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    href: '/hr',
    requiredModules: ['hr'],
    moduleName: 'hr',
  },
  {
    id: 'projects',
    title: 'Proyectos',
    subtitle: 'Seguimiento y Horas',
    description: ['Cronogramas Gantt', 'Tableros Kanban', 'Control Presupuesto', 'Avance de Obra'],
    icon: FolderKanban,
    iconBg: 'bg-purple-50 border-purple-200/80',
    iconColor: 'text-purple-600',
    accentBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    href: '/projects',
    requiredModules: ['projects'],
    moduleName: 'projects',
  },
  {
    id: 'formulas',
    title: 'Recetas & Producción',
    subtitle: 'Cálculo de Ingredientes BOM',
    description: ['Fórmulas BOM', 'Lotes de Producción', 'Stock Decimal', 'Costos Insumos'],
    icon: FlaskConical,
    iconBg: 'bg-amber-50 border-amber-200/80',
    iconColor: 'text-amber-600',
    accentBadge: 'bg-amber-50 text-amber-700 border-amber-200',
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
    iconBg: 'bg-cyan-50 border-cyan-200/80',
    iconColor: 'text-cyan-600',
    accentBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    href: '/condominio',
    requiredModules: ['condominio'],
    moduleName: 'condominio',
  },
  {
    id: 'restaurante',
    title: 'Restaurante & POS',
    subtitle: 'Comandas, KDS y Mesas',
    description: ['POS Garzón & Mesas', 'Kiosco Autoservicio QR', 'Pantallas KDS Cocina/Bar', 'Boleta Electrónica SII'],
    icon: UtensilsCrossed,
    iconBg: 'bg-amber-50 border-amber-200/80',
    iconColor: 'text-amber-600',
    accentBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    href: '/restaurant',
    requiredModules: ['restaurant'],
    moduleName: 'restaurant',
  },
  {
    id: 'veterinaria',
    title: 'Veterinaria & Clínica',
    subtitle: 'Fichas, Agenda y Consultas',
    description: ['Ficha Clínica Multiespecie', 'Agenda & Box de Atención', 'Hospitalización & Quirófano', 'Recetas & Vacunación'],
    icon: Stethoscope,
    iconBg: 'bg-emerald-50 border-emerald-200/80',
    iconColor: 'text-emerald-600',
    accentBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    href: '/veterinaria',
    requiredModules: ['veterinaria'],
    moduleName: 'veterinaria',
  },
  {
    id: 'mi-cuenta',
    title: 'Mi Cuenta',
    subtitle: 'Planes y Facturación',
    description: ['Mi Plan SaaS', 'Facturación ERP', 'Módulos Activos', 'Suscripción'],
    icon: CreditCard,
    iconBg: 'bg-blue-50 border-blue-200/80',
    iconColor: 'text-blue-700',
    accentBadge: 'bg-blue-50 text-blue-800 border-blue-200',
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
    iconBg: 'bg-emerald-50 border-emerald-200/80',
    iconColor: 'text-emerald-600',
    accentBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    href: '/ayuda',
    requiredModules: [],
    moduleName: 'ayuda',
  },
];

function getUserFromCookie() {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  if (!authCookie) return null;
  try {
    const token = authCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      role: payload.role || 'member',
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
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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

  useEffect(() => {
    getChileanIndicators().then(setIndicators);
  }, []);

  useEffect(() => {
    const userData = getUserFromCookie();
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

    const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

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
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
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
    return activatedModules.has(mod.moduleName);
  }, [activatedModules]);

  const handleModuleClick = (mod: ModuleOption) => {
    if (isModuleActivated(mod)) {
      router.push(mod.href);
    } else {
      setSelectedModule(mod);
      setModalOpen(true);
    }
  };

  const handleCompanySwitch = async (companyId: string) => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
    if (!token) return;
    const newToken = await switchCompany(token, companyId);
    if (newToken) {
      document.cookie = `auth-token=${newToken}; path=/; max-age=604800; SameSite=Lax`;
      window.location.reload();
    }
  };

  const handleActivate = async () => {
    if (!selectedModule) return;
    setActivating(true);
    try {
      const api = getApiClient();
      const companyId = api['companyId'];
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

      await Promise.all(
        selectedModule.requiredModules.map((moduleName) =>
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FACC15] border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Cargando módulos de Yellow ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-slate-900">
      {/* Sun-Slate Header */}
      <header className="bg-white/90 border-b border-slate-200/80 px-6 h-16 sticky top-0 z-30 backdrop-blur-xl flex items-center justify-between">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FACC15] p-1.5 shadow-md shadow-amber-500/10 flex items-center justify-center shrink-0">
              <Image src="/logo/yellow-cube.svg" alt="Yellow ERP" width={28} height={28} className="drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{company?.name || 'Yellow ERP'}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Empresa Activa
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Plataforma Empresarial PYME · Chile</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-slate-800">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>UF: ${indicators ? indicators.uf.toLocaleString('es-CL') : '38.500'}</span>
              <span className="opacity-40">|</span>
              <DollarSign className="w-3.5 h-3.5 text-blue-600 -mr-1" />
              <span>USD: ${indicators ? indicators.dolar.toLocaleString('es-CL') : '950'}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all duration-150 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FACC15] to-amber-500 flex items-center justify-center shrink-0 font-black text-xs text-slate-950 shadow-inner">
                    {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-60 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-1.5">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center shrink-0 font-black text-xs text-slate-950">
                      {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {!companiesLoading && companies.length > 1 && (
                  <>
                    <div className="px-3 py-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Empresas Disponibles
                      </p>
                    </div>
                    {companies.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => handleCompanySwitch(c.id)}
                        className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                        disabled={c.id === company?.id}
                      >
                        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-[#FACC15]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-500 capitalize">{c.role}</p>
                        </div>
                        {c.id === company?.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-slate-100" />
                  </>
                )}

                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors font-semibold"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-600 shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Yellow ERP Hub · Módulos SaaS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bienvenido de nuevo, {user?.name || 'Usuario'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
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
                  className="group bg-white border border-slate-200/80 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-md hover:border-slate-300 active:scale-[0.99] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${mod.iconBg} rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-xs`}>
                        <Icon className={`w-6 h-6 ${mod.iconColor}`} />
                      </div>
                      {activated ? (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-[#FACC15] transition-colors duration-200">
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#FACC15] transition-colors" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-black text-slate-900">{mod.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${mod.accentBadge}`}>
                        {mod.subtitle}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {mod.description.map((item, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center px-2.5 py-1 bg-slate-50 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200/60"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className={activated ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                      {activated ? '● Módulo Activo' : '🔒 Requiere Activación'}
                    </span>
                    <span className="text-slate-900 font-bold group-hover:text-[#EAB308] transition-colors">
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
            className="text-center text-xs text-slate-500 mt-10 font-medium"
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Activar Módulo</h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  El módulo <span className="font-bold text-slate-900">{selectedModule.title}</span> requiere ser activado para tu empresa.
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="flex-1 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                >
                  {activating ? (
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      Activar Ahora
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Access Log */}
      {lastAccess && (
        <div className="fixed bottom-4 right-5 text-[10px] text-slate-500 select-none bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-xs font-semibold">
          Último acceso: {lastAccess}
        </div>
      )}
    </div>
  );
}