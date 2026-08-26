'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Package, UsersRound, FolderKanban, Settings, CreditCard, ChevronRight, X, Lock, Zap, FlaskConical, LifeBuoy, ArrowRight, LogOut, Building2, User, ChevronDown, Mail, Sparkles } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
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
    description: ['Inventario y Bodegas', 'Ventas y Compras', 'Contabilidad', 'CRM & Clientes'],
    icon: Package,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1814F3]',
    href: '/dashboard',
    requiredModules: ['inventory', 'products', 'sales', 'purchases', 'accounting', 'projects', 'crm'],
    moduleName: 'erp',
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    subtitle: 'Nómina y Asistencia',
    description: ['Contratos', 'Asistencia', 'Evaluaciones', 'Capacitación'],
    icon: UsersRound,
    iconBg: 'bg-[#16DBCC]/15',
    iconColor: 'text-[#00A896]',
    href: '/hr',
    requiredModules: ['hr'],
    moduleName: 'hr',
  },
  {
    id: 'projects',
    title: 'Proyectos',
    subtitle: 'Seguimiento y Horas',
    description: ['Cronogramas Gantt', 'Tableros Kanban', 'Control de Tiempos', 'Reportes de Costo'],
    icon: FolderKanban,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-[#2D60FF]',
    href: '/projects',
    requiredModules: ['projects'],
    moduleName: 'projects',
  },
  {
    id: 'formulas',
    title: 'Recetas & Producción',
    subtitle: 'Cálculo de Ingredientes',
    description: ['Recetas y Fórmulas', 'Producción por Lotes', 'Stock Decimal'],
    icon: FlaskConical,
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#FFBB38]',
    href: '/recetas',
    requiredModules: [],
    moduleName: 'recetas',
  },
  {
    id: 'mi-cuenta',
    title: 'Mi Cuenta',
    subtitle: 'Planes y Facturación',
    description: ['Mi Plan ERP', 'Facturación SaaS', 'Módulos Adicionales', 'Activaciones'],
    icon: CreditCard,
    iconBg: 'bg-[#FE5C73]/15',
    iconColor: 'text-[#FE5C73]',
    href: '/mi-cuenta',
    requiredModules: [],
    moduleName: 'mi-cuenta',
  },
  {
    id: 'ayuda',
    title: 'Soporte & Ayuda',
    subtitle: 'Centro de Asistencia',
    description: ['Preguntas Frecuentes', 'Tickets de Soporte', 'Atención Técnica'],
    icon: LifeBuoy,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
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

    const api = getApiClient();
    api.getCompany().then(companyRes => {
      if (companyRes) setCompany(companyRes);
      setLoading(false);
    }).catch(() => setLoading(false));
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

      for (const moduleName of selectedModule.requiredModules) {
        await fetch(`/api/companies/${companyId}/modules/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ module_name: moduleName }),
        });
      }

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
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#1814F3]/30 border-t-[#1814F3] rounded-full animate-spin" />
          <p className="text-xs text-[#718EBF] font-medium">Cargando módulos de Yellow ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-[#E6EFF5] px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1814F3] flex items-center justify-center shadow-md shadow-[#1814F3]/20">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#232323]">{company?.name || 'Yellow ERP'}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Activo
                </span>
              </div>
              <p className="text-[11px] text-[#718EBF]">Plataforma Empresarial · Chile</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E6EFF5] bg-[#F5F7FA] hover:bg-white transition-all duration-150">
                <div className="w-7 h-7 rounded-full bg-[#1814F3]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#1814F3]" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-[#232323] leading-none">{user?.name}</p>
                  <p className="text-[9px] text-[#718EBF] mt-0.5 uppercase tracking-wider">{user?.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#718EBF]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-60 bg-white border border-[#E6EFF5] rounded-2xl shadow-lg p-1.5">
              <div className="px-3 py-2 border-b border-[#E6EFF5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1814F3]/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#1814F3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#232323] truncate">{user?.name}</p>
                    <p className="text-[10px] text-[#718EBF] truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {!companiesLoading && companies.length > 1 && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">
                      Empresas Disponibles
                    </p>
                  </div>
                  {companies.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => handleCompanySwitch(c.id)}
                      className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F5F7FA] transition-colors"
                      disabled={c.id === company?.id}
                    >
                      <div className="w-7 h-7 bg-[#1814F3] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#232323] truncate">{c.name}</p>
                        <p className="text-[10px] text-[#718EBF] capitalize">{c.role}</p>
                      </div>
                      {c.id === company?.id && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-[#E6EFF5]" />
                </>
              )}

              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-[#FE5C73] hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-medium">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E6EFF5] text-xs font-medium text-[#718EBF] shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#1814F3]" />
              <span>Yellow ERP Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#232323] tracking-tight">
              Bienvenido de nuevo, {user?.name || 'Usuario'}
            </h2>
            <p className="text-xs sm:text-sm text-[#718EBF] mt-1.5">
              Selecciona el módulo empresarial que deseas gestionar hoy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="group bg-white border border-[#E6EFF5] rounded-2xl p-6 text-left transition-all duration-150 hover:shadow-md hover:border-[#1814F3]/30 active:scale-[0.99] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${mod.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105 shadow-xs`}>
                        <Icon className={`w-6 h-6 ${mod.iconColor}`} />
                      </div>
                      {activated ? (
                        <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center group-hover:bg-[#1814F3] group-hover:text-white transition-colors duration-150">
                          <ArrowRight className="w-4 h-4 text-[#718EBF] group-hover:text-white transition-colors" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center">
                          <Lock className="w-4 h-4 text-[#8BA3CB]" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-base font-bold text-[#232323] mb-0.5">{mod.title}</h3>
                    <p className="text-xs text-[#718EBF] mb-4 font-normal">{mod.subtitle}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {mod.description.map((item, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center px-2.5 py-1 bg-[#F5F7FA] text-[#232323] text-[10px] font-medium rounded-lg border border-[#E6EFF5]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E6EFF5] flex items-center justify-between text-[10px]">
                    <span className={activated ? 'text-emerald-600 font-semibold' : 'text-[#718EBF]'}>
                      {activated ? '● Módulo Activo' : '🔒 Requiere Activación'}
                    </span>
                    <span className="text-[#1814F3] font-medium group-hover:underline">
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
            className="text-center text-xs text-[#718EBF] mt-10"
          >
            ¿Necesitas ayuda o un nuevo módulo? Accede directamente desde el menú lateral en cualquier momento.
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#E6EFF5] shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Lock className="w-6 h-6 text-[#FFBB38]" />
                </div>
                <h2 className="text-lg font-bold text-[#232323]">Activar Módulo</h2>
                <p className="text-xs text-[#718EBF] mt-2 leading-relaxed">
                  El módulo <span className="font-semibold text-[#232323]">{selectedModule.title}</span> requiere ser activado para tu empresa.
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="flex-1 bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm shadow-[#1814F3]/25 transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                >
                  {activating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
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
        <div className="fixed bottom-4 right-5 text-[10px] text-[#718EBF] select-none bg-white border border-[#E6EFF5] px-3 py-1 rounded-full shadow-xs">
          Último acceso: {lastAccess}
        </div>
      )}
    </div>
  );
}
