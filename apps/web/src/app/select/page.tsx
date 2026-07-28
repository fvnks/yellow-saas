'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Package, UsersRound, FolderKanban, Settings, CreditCard, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const userData = getUserFromCookie();
    if (!userData) { router.push('/login'); return; }
    setUser(userData);

    const api = getApiClient();
    api.getCompany()
      .then((companyRes) => {
        if (companyRes) setCompany(companyRes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 + i * 0.08 }}
                  onClick={() => router.push(mod.href)}
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
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
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
    </div>
  );
}
