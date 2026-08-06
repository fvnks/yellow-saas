'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Package, UsersRound, FolderKanban, Settings, CreditCard, ChevronRight, X, Lock, Zap, FlaskConical, LifeBuoy } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface ModuleOption {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  icon: any;
  gradient: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  href: string;
  requiredModules: string[];
  moduleName: string;
}

const modules: ModuleOption[] = [
  {
    id: 'erp',
    title: 'ERP',
    subtitle: 'Gestión Empresarial',
    description: ['Inventario y Bodegas', 'Ventas y Compras', 'Contabilidad', 'CRM'],
    icon: Package,
    gradient: 'from-indigo-500 to-violet-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    hoverBorder: 'hover:border-indigo-300 hover:shadow-indigo-100',
    href: '/dashboard',
    requiredModules: ['inventory', 'products', 'sales', 'purchases', 'accounting', 'projects', 'crm'],
    moduleName: 'erp',
  },
  {
    id: 'hr',
    title: 'RRHH',
    subtitle: 'Recursos Humanos',
    description: ['Contratos', 'Asistencia', 'Evaluaciones', 'Capacitación'],
    icon: UsersRound,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    hoverBorder: 'hover:border-emerald-300 hover:shadow-emerald-100',
    href: '/hr',
    requiredModules: ['hr'],
    moduleName: 'hr',
  },
  {
    id: 'projects',
    title: 'Proyectos',
    subtitle: 'Gestión de Proyectos',
    description: ['Cronogramas', 'Tareas', 'Tiempo', 'Reportes'],
    icon: FolderKanban,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    hoverBorder: 'hover:border-amber-300 hover:shadow-amber-100',
    href: '/projects',
    requiredModules: ['projects'],
    moduleName: 'projects',
  },
  {
    id: 'formulas',
    title: 'Recetas',
    subtitle: 'Recetas y Producción',
    description: ['Recetas con ingredientes', 'Producción por lotes', 'Control de stock decimal'],
    icon: FlaskConical,
    gradient: 'from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    hoverBorder: 'hover:border-amber-300 hover:shadow-amber-100',
    href: '/recetas',
    requiredModules: [],
    moduleName: 'recetas',
  },
  {
    id: 'mi-cuenta',
    title: 'Mi Cuenta',
    subtitle: 'Facturación y Configuración',
    description: ['Mi Plan', 'Facturación', 'Módulos', 'Activaciones'],
    icon: CreditCard,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    hoverBorder: 'hover:border-violet-300 hover:shadow-violet-100',
    href: '/mi-cuenta',
    requiredModules: [],
    moduleName: 'mi-cuenta',
  },
  {
    id: 'ayuda',
    title: 'Ayuda',
    subtitle: 'Soporte y Preguntas Frecuentes',
    description: ['Preguntas frecuentes', 'Tickets de soporte', 'Atención a fallas'],
    icon: LifeBuoy,
    gradient: 'from-blue-500 to-cyan-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-300 hover:shadow-blue-100',
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

    const api = getApiClient();
    Promise.all([
      api.getCompany(),
      loadActivatedModules(),
    ]).then(([companyRes]) => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <Image src="/logo/yellow-cube.svg" alt="Yellow" width={32} height={32} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">{company?.name || 'Yellow ERP'}</h1>
              <p className="text-[11px] text-slate-400">Bienvenido, {user?.name}</p>
            </div>
          </div>
          <a href="/dashboard/settings" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <Settings className="w-3.5 h-3.5" /> Configuración
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hola {user?.name || 'Usuario'}, ¿qué deseas hacer hoy?</h2>
            <p className="text-sm text-slate-400 mt-1.5">Selecciona un módulo para comenzar</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.filter(mod => isModuleActivated(mod)).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No hay módulos activos</p>
                <p className="text-xs text-slate-400 mt-1">Contacta al administrador para activar módulos</p>
              </div>
            ) : modules.filter(mod => isModuleActivated(mod)).map((mod, i) => {
              const Icon = mod.icon;
              const activated = isModuleActivated(mod);
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 + i * 0.08 }}
                  onClick={() => handleModuleClick(mod)}
                  className={`group relative bg-white border border-slate-200 ${mod.hoverBorder} rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-0.5`}
                >
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${mod.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 ${mod.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-5.5 h-5.5 ${mod.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{mod.subtitle}</p>
                        </div>
                        {activated ? (
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {mod.description.map((item, j) => (
                          <span key={j} className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-medium rounded-md border border-slate-100">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center text-[11px] text-slate-300 mt-8"
          >
            Puedes cambiar de módulo en cualquier momento desde el menú lateral
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 text-center">
                <div className={`w-16 h-16 ${selectedModule.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Módulo no activado</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Hola <span className="font-semibold text-slate-700">{user?.name}</span>, el módulo{' '}
                  <span className="font-semibold text-slate-700">{selectedModule.title}</span> aún no está activado en tu cuenta.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  ¿Deseas activarlo ahora para comenzar a usarlo?
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Ahora no
                </button>
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="flex-1 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {activating ? (
                    'Activando...'
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Activar módulo
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Access */}
      {lastAccess && (
        <div className="fixed bottom-4 right-5 text-[10px] text-slate-300 select-none">
          Último acceso: {lastAccess}
        </div>
      )}
    </div>
  );
}
