'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Package, UsersRound, Settings, ArrowRight, Building2 } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface ModuleOption {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  href: string;
  requiredModules: string[];
}

const modules: ModuleOption[] = [
  {
    id: 'erp',
    title: 'ERP',
    subtitle: 'Gestión Empresarial',
    description: ['Inventario y Bodegas', 'Ventas y Compras', 'Contabilidad', 'Proyectos', 'CRM'],
    icon: Package,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200 hover:border-indigo-400',
    href: '/dashboard',
    requiredModules: ['inventory', 'products', 'sales', 'purchases', 'accounting', 'projects', 'crm'],
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    subtitle: 'Gestión de Talento',
    description: ['Contratos Laborales', 'Control de Asistencia', 'Evaluaciones', 'Capacitación', 'Onboarding'],
    icon: UsersRound,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    href: '/hr',
    requiredModules: ['hr'],
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

  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  const availableModules = modules.filter(mod => {
    if (isOwner) return true;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{company?.name || 'Yellow ERP'}</h1>
              <p className="text-xs text-slate-500">Selecciona un módulo para continuar</p>
            </div>
          </div>
          <a href="/dashboard/settings" className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" /> Configuración
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-slate-900">¿Qué deseas hacer hoy?</h2>
            <p className="text-slate-500 mt-2">Elige el módulo al que deseas acceder</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableModules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  onClick={() => router.push(mod.href)}
                  className={`group relative bg-white border-2 ${mod.borderColor} rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1`}
                >
                  <div className={`w-14 h-14 ${mod.bgColor} rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                    <Icon className={`w-7 h-7 ${mod.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{mod.subtitle}</p>
                  <ul className="mt-4 space-y-2">
                    {mod.description.map((item, j) => (
                      <li key={j} className="text-sm text-slate-600 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${mod.bgColor.replace('bg-', 'bg-')}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className={`mt-6 flex items-center gap-2 text-sm font-medium ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Entrar <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
