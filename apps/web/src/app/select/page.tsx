'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  UsersRound,
  FolderKanban,
  Settings,
  CreditCard,
  ChevronRight,
  Lock,
  Zap,
  FlaskConical,
  ArrowRight,
  LogOut,
  Building2,
  User,
  ChevronDown,
  Mail,
  ShieldCheck,
  Check,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
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
  badge?: string;
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

const MODULE_OPTIONS: ModuleOption[] = [
  {
    id: 'erp',
    title: 'ERP & Finanzas',
    subtitle: 'Gestión Empresarial Integral',
    description: ['Inventario y Bodegas Multi-sucursal', 'Ventas, Cotizaciones y DTE SII', 'Compras y Recepción de Mercadería', 'Contabilidad Automática y Libros'],
    icon: Package,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1814F3]',
    href: '/dashboard',
    requiredModules: ['inventory', 'products', 'sales', 'purchases', 'accounting'],
    moduleName: 'erp',
    badge: 'Módulo Principal'
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    subtitle: 'Gestión de Talento y Nómina',
    description: ['Contratos y Carpetas Digitales', 'Control de Asistencia y Vacaciones', 'Liquidaciones de Sueldo y PreviRed', 'Evaluaciones de Desempeño'],
    icon: UsersRound,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/hr',
    requiredModules: ['hr'],
    moduleName: 'hr',
  },
  {
    id: 'projects',
    title: 'Gestión de Proyectos',
    subtitle: 'Planificación y Ejecución',
    description: ['Cronogramas y Diagrama Gantt', 'Tableros Kanban por Cliente', 'Control de Horas Trabajadas', 'Presupuestos y Rentabilidad'],
    icon: FolderKanban,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    href: '/projects',
    requiredModules: ['projects'],
    moduleName: 'projects',
  },
  {
    id: 'recetas',
    title: 'Recetas & Producción',
    subtitle: 'Fórmulas e Insumos',
    description: ['Escandallos y Costos de Producción', 'Control de Merma e Insumos', 'Punto de Venta POS Gastronómico', 'Órdenes de Elaboración'],
    icon: FlaskConical,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    href: '/recetas',
    requiredModules: ['recetas'],
    moduleName: 'recetas',
  },
  {
    id: 'mi-cuenta',
    title: 'Mi Cuenta & Suscripción',
    subtitle: 'Configuración de Empresa',
    description: ['Gestión de Plan y Facturación SaaS', 'Activación de Módulos Adicionales', 'Cuentas Cobradas y Comprobantes', 'Usuarios y Permisos Globales'],
    icon: Settings,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    href: '/mi-cuenta',
    requiredModules: [],
    moduleName: 'mi-cuenta',
    badge: 'Configuración'
  },
];

export default function ModuleSelectorPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const api = getApiClient();

      // Check current user details
      const meRes = await api.get('/api/auth/me').catch(() => null);
      if (meRes?.user) {
        setUserEmail(meRes.user.email || '');
        setIsSuperAdmin(meRes.user.is_super_admin || false);
      }

      // Fetch companies available to current user
      const compRes = await api.get('/api/companies').catch(() => null);
      if (compRes?.companies && compRes.companies.length > 0) {
        setCompanies(compRes.companies);
        const current = compRes.companies.find((c: Company) => c.is_default) || compRes.companies[0];
        setSelectedCompany(current);

        // Fetch active modules for selected company
        if (current) {
          const modRes = await api.get(`/api/companies/${current.id}/modules`).catch(() => null);
          if (modRes?.modules) {
            setActiveModules(modRes.modules);
          } else {
            setActiveModules(['inventory', 'products', 'sales', 'purchases', 'accounting', 'hr', 'projects', 'recetas']);
          }
        }
      } else {
        // Fallback default
        setSelectedCompany({
          id: 'demo-company-id',
          name: 'Empresa Demo SpA',
          role: 'ADMIN',
          plan: 'Business Pro'
        });
        setActiveModules(['inventory', 'products', 'sales', 'purchases', 'accounting', 'hr', 'projects', 'recetas']);
      }
    } catch (err) {
      console.error('Error loading module selector data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSwitchCompany = async (company: Company) => {
    if (company.id === selectedCompany?.id) return;
    try {
      setSwitching(true);
      const api = getApiClient();
      await api.post('/api/auth/switch-company', { company_id: company.id });
      setSelectedCompany(company);
      await loadData();
    } catch (err) {
      console.error('Error switching company:', err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    try {
      const api = getApiClient();
      await api.post('/api/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      router.push('/login');
    }
  };

  const isModuleEnabled = (mod: ModuleOption) => {
    if (mod.id === 'mi-cuenta') return true;
    if (mod.requiredModules.length === 0) return true;
    return mod.requiredModules.some(m => activeModules.includes(m));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1814F3] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#718EBF] uppercase tracking-wider">Cargando Ecosistema Yellow ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#232323] font-sans antialiased selection:bg-[#1814F3]/10 selection:text-[#1814F3]">
      
      {/* Enterprise Header */}
      <header className="h-16 bg-white border-b border-[#E6EFF5] fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1814F3] flex items-center justify-center text-white font-bold shadow-md shadow-[#1814F3]/20">
            Y
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#232323] tracking-tight leading-tight">
              Yellow ERP
            </span>
            <span className="text-[10px] text-[#718EBF] font-medium">Selector de Módulos</span>
          </div>
        </Link>

        {/* Company Switcher & User Avatar */}
        <div className="flex items-center gap-4">
          
          {/* Company Dropdown */}
          {companies.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E6EFF5] bg-white hover:bg-[#F5F7FA] text-xs font-medium text-[#232323] transition-colors focus:outline-none">
                <Building2 className="w-4 h-4 text-[#1814F3]" />
                <span className="max-w-[160px] truncate">{selectedCompany?.name || 'Seleccionar Empresa'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#718EBF]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-white rounded-2xl border border-[#E6EFF5] shadow-xl">
                <div className="px-2 py-1.5 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">
                  Tus Empresas
                </div>
                {companies.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => handleSwitchCompany(c)}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer hover:bg-[#F5F7FA]"
                  >
                    <span className="font-medium text-[#232323] truncate">{c.name}</span>
                    {c.id === selectedCompany?.id && (
                      <Check className="w-4 h-4 text-[#1814F3]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl border border-[#E6EFF5] bg-white hover:bg-[#F5F7FA] transition-colors focus:outline-none">
              <div className="w-7 h-7 rounded-lg bg-[#1814F3]/10 text-[#1814F3] font-bold text-xs flex items-center justify-center">
                {userEmail ? userEmail[0].toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#718EBF]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 bg-white rounded-2xl border border-[#E6EFF5] shadow-xl">
              <div className="px-3 py-2 border-b border-[#E6EFF5]">
                <p className="text-xs font-bold text-[#232323]">Usuario Activo</p>
                <p className="text-[11px] text-[#718EBF] truncate">{userEmail || 'usuario@empresa.cl'}</p>
              </div>
              
              {isSuperAdmin && (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#1814F3] font-semibold rounded-xl cursor-pointer hover:bg-blue-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Panel Super Admin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E6EFF5]" />
                </>
              )}

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs text-rose-600 font-semibold rounded-xl cursor-pointer hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-4 sm:px-6 pb-16 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white border border-[#E6EFF5] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-[#1814F3] uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#1814F3]" />
              {selectedCompany?.name || 'Empresa Activa'}
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#232323] tracking-tight">
              Bienvenido al Ecosistema Yellow ERP
            </h1>
            <p className="text-xs sm:text-sm text-[#718EBF] max-w-xl">
              Selecciona el módulo empresarial con el que deseas trabajar hoy. Todos los datos están sincronizados en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#F5F7FA] border border-[#E6EFF5] rounded-xl px-4 py-3 text-right hidden sm:block">
              <p className="text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Plan Activo</p>
              <p className="text-xs font-bold text-[#232323]">{selectedCompany?.plan || 'Business Pro'}</p>
            </div>
            <Link
              href="/mi-cuenta"
              className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-4 py-3 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-[#718EBF]" />
              Ajustes de Empresa
            </Link>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#718EBF] uppercase tracking-wider">
              Módulos Disponibles ({MODULE_OPTIONS.length})
            </h2>
            <span className="text-xs text-[#718EBF]">Empresa ID: <code className="text-[#232323] bg-white border border-[#E6EFF5] px-2 py-0.5 rounded-lg">{selectedCompany?.id || 'demo'}</code></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULE_OPTIONS.map((mod) => {
              const Icon = mod.icon;
              const enabled = isModuleEnabled(mod);

              return (
                <div
                  key={mod.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 relative group ${
                    enabled
                      ? 'border-[#E6EFF5] hover:border-[#1814F3]/40 hover:shadow-md'
                      : 'border-[#E6EFF5] opacity-75 bg-slate-50/50'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mod.iconBg} ${mod.iconColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {mod.badge ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-[#1814F3] border border-blue-200 uppercase tracking-wider">
                          {mod.badge}
                        </span>
                      ) : enabled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                          <Lock className="w-3 h-3 mr-1" /> Requiere Plan Superior
                        </span>
                      )}
                    </div>

                    {/* Titles */}
                    <h3 className="text-lg font-bold text-[#232323] group-hover:text-[#1814F3] transition-colors mb-0.5">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#718EBF] font-medium mb-4">{mod.subtitle}</p>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-3 border-t border-[#E6EFF5] mb-6">
                      {mod.description.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-[#232323]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {enabled ? (
                    <button
                      onClick={() => router.push(mod.href)}
                      className="w-full bg-[#1814F3] hover:bg-[#1612D3] text-white py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
                    >
                      Ingresar al Módulo
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      href="/mi-cuenta"
                      className="w-full bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#718EBF] py-2.5 rounded-xl text-xs font-semibold transition-all text-center flex items-center justify-center gap-2"
                    >
                      Solicitar Activación
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

    </div>
  );
}
