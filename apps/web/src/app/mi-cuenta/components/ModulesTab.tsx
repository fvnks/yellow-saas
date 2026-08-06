'use client';

import { useState, useEffect } from 'react';
import { Puzzle, Check, Plus } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CatalogModule {
  id: string;
  name: string;
  label: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  category: string;
}

interface ActivatedModule {
  module_name: string;
  status: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ventas: 'Ventas',
  rrhh: 'RRHH',
  finanzas: 'Finanzas',
  inventario: 'Inventario',
  proyectos: 'Proyectos',
  soporte: 'Soporte',
  desarrollo: 'Desarrollo',
  general: 'General',
};

export default function ModulesTab() {
  const [catalog, setCatalog] = useState<CatalogModule[]>([]);
  const [activated, setActivated] = useState<ActivatedModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catalogRes, activatedRes] = await Promise.all([
        fetch('/api/modules-catalog').then(r => r.json()),
        (async () => {
          const api = getApiClient();
          const companyId = api['companyId'];
          const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
          const res = await fetch(`/api/companies/${companyId}/modules`, { headers: { Authorization: `Bearer ${token}` } });
          return res.json();
        })(),
      ]);

      const catalogData = catalogRes.data?.modules || [];
      setCatalog(catalogData);
      setActivated(activatedRes.data?.modules || []);

      const categories = [...new Set(catalogData.map((m: CatalogModule) => m.category))] as string[];
      if (categories.length > 0 && !activeCategory) {
        setActiveCategory(categories[0]);
      }
    } catch (err) {
      console.error('Failed to load modules:', err);
    }
    setLoading(false);
  };

  const handleActivate = async (moduleName: string) => {
    setActivating(moduleName);
    try {
      const api = getApiClient();
      const companyId = api['companyId'];
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

      const res = await fetch(`/api/companies/${companyId}/modules/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ module_name: moduleName }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Módulo activado correctamente');
        loadData();
      } else {
        toast.error(data.error || 'Error al activar módulo');
      }
    } catch (err) {
      toast.error('Error al activar módulo');
    }
    setActivating(null);
  };

  const isActivated = (name: string) => activated.some(a => a.module_name === name && a.status === 'active');

  const formatPrice = (cents: number) => `$${(cents / 100).toLocaleString('es-CL')}`;

  const categories = [...new Set(catalog.map(m => m.category))];
  const filteredModules = catalog.filter(m => m.category === activeCategory);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Módulos Adicionales</h3>
        <p className="text-sm text-slate-500">Activa módulos extra para potenciar tu ERP</p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {categories.map(category => {
          const isActive = activeCategory === category;
          const categoryCount = catalog.filter(m => m.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              {CATEGORY_LABELS[category] || category}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[9px] font-semibold",
                isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-500"
              )}>
                {categoryCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map(module => {
          const active = isActivated(module.name);
          return (
            <div key={module.id} className={`bg-white border rounded-xl p-6 transition-all ${active ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-100' : 'bg-indigo-50'}`}>
                    <Puzzle className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{module.label}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-center flex-1 py-2 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Mensual</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatPrice(module.price_monthly)}<span className="text-xs font-normal text-slate-400">/mes</span></p>
                </div>
                <div className="text-center flex-1 py-2 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Anual</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatPrice(module.price_yearly)}<span className="text-xs font-normal text-slate-400">/año</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {module.features.map((feature, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-medium rounded-md border border-slate-100">
                    {feature}
                  </span>
                ))}
              </div>

              {active ? (
                <div className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" /> Módulo Activo
                </div>
              ) : (
                <button
                  onClick={() => handleActivate(module.name)}
                  disabled={activating === module.name}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {activating === module.name ? 'Activando...' : <><Plus className="w-3.5 h-3.5" /> Activar Módulo</>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
