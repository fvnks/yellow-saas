'use client';

import { useState, useEffect } from 'react';
import { Puzzle, Check, Plus, ShoppingCart } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

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

export default function ModulesTab() {
  const [catalog, setCatalog] = useState<CatalogModule[]>([]);
  const [activated, setActivated] = useState<ActivatedModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

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

      setCatalog(catalogRes.data?.modules || []);
      setActivated(activatedRes.data?.modules || []);
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

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Módulos Adicionales</h3>
        <p className="text-sm text-slate-500">Activa módulos extra para potenciar tu ERP</p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 capitalize">{category}</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {catalog.filter(m => m.category === category).map(module => {
              const active = isActivated(module.name);
              return (
                <div key={module.id} className={`bg-white border rounded-xl p-5 transition-all ${active ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-100' : 'bg-indigo-50'}`}>
                        <Puzzle className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{module.label}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                      </div>
                    </div>
                    {active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivate(module.name)}
                        disabled={activating === module.name}
                        className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {activating === module.name ? 'Activando...' : <><Plus className="w-3 h-3" /> Activar</>}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Mensual</p>
                      <p className="text-sm font-bold text-slate-900">{formatPrice(module.price_monthly)}/mes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Anual</p>
                      <p className="text-sm font-bold text-slate-900">{formatPrice(module.price_yearly)}/año</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {module.features.map((feature, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-medium rounded-md border border-slate-100">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
