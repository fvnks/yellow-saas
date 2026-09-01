'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import PlanTab from './PlanTab';
import BillingAccountTab from './BillingAccountTab';
import ModulesTab from './ModulesTab';
import ActivationsTab from './ActivationsTab';

const tabs = [
  { id: 'plan', label: 'Plan y Precios' },
  { id: 'billing', label: 'Facturación' },
  { id: 'modules', label: 'Módulos Adicionales' },
  { id: 'activations', label: 'Mis Activaciones' },
];

function Content() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'plan');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Account Blue Personality */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">Mi Cuenta</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Suscripción ERP
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">Gestiona tu plan activo, facturación electrónica, datos de empresa y módulos habilitados</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
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

export default function MiCuentaClient() {
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-muted-foreground p-6">Cargando...</div>}>
      <Content />
    </Suspense>
  );
}
