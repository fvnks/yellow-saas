'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Receipt, Puzzle, History } from 'lucide-react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import PlanTab from './components/PlanTab';
import BillingAccountTab from './components/BillingAccountTab';
import ModulesTab from './components/ModulesTab';
import ActivationsTab from './components/ActivationsTab';

const tabs = [
  { id: 'plan', label: 'Plan y Precios' },
  { id: 'billing', label: 'Facturación' },
  { id: 'modules', label: 'Módulos Adicionales' },
  { id: 'activations', label: 'Mis Activaciones' },
];

function MiCuentaPageInner() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'plan');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mi Cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona tu plan, facturación y módulos</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <ContinuousTabs
          tabs={tabs}
          defaultActiveId={activeTab}
          onChange={setActiveTab}
        />
        <div className="p-6">
          {activeTab === 'plan' && <PlanTab />}
          {activeTab === 'billing' && <BillingAccountTab />}
          {activeTab === 'modules' && <ModulesTab />}
          {activeTab === 'activations' && <ActivationsTab />}
        </div>
      </div>
    </div>
  );
}

export default function MiCuentaPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-slate-400 p-6">Cargando...</div>}>
      <MiCuentaPageInner />
    </Suspense>
  );
}
