'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Clock, Award, GraduationCap, UserCheck, Plus } from 'lucide-react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import ContractsTab from './components/ContractsTab';
import AttendanceTab from './components/AttendanceTab';
import EvaluationsTab from './components/EvaluationsTab';
import TrainingTab from './components/TrainingTab';
import OnboardingTab from './components/OnboardingTab';

const tabs = [
  { id: 'contracts', label: 'Contratos' },
  { id: 'attendance', label: 'Asistencia' },
  { id: 'evaluations', label: 'Evaluaciones' },
  { id: 'training', label: 'Capacitación' },
  { id: 'onboarding', label: 'Onboarding' },
];

function HRPageInner() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'contracts');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with HR Rose Personality */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">Recursos Humanos</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Talento & Nómina
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">Gestión integral de colaboradores, asistencia, evaluaciones y clima laboral</p>
        </div>
        <button className="bg-amber-500 hover:bg-[#EAB308] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm">
          <Plus className="w-4 h-4" />
          Nuevo Colaborador
        </button>
      </div>

      {/* HR Highlights Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up stagger-1 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dotación Total</p>
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">48</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">+3 incorporaciones este mes</p>
        </div>

        <div className="animate-fade-in-up stagger-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Asistencia Hoy</p>
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">96.8%</p>
          <p className="text-[11px] text-slate-500 mt-1">45/48 presentes a tiempo</p>
        </div>

        <div className="animate-fade-in-up stagger-3 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Evaluaciones Pendientes</p>
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">7</p>
          <p className="text-[11px] text-amber-600 mt-1 font-semibold">Ciclo de desempeño Q3</p>
        </div>

        <div className="animate-fade-in-up stagger-4 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">En Onboarding</p>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">4</p>
          <p className="text-[11px] text-slate-500 mt-1">Nuevos ingresos en inducción</p>
        </div>
      </div>

      {/* Main Tabbed Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <ContinuousTabs
          tabs={tabs}
          defaultActiveId={activeTab}
          onChange={setActiveTab}
        />
        <div className="p-6">
          {activeTab === 'contracts' && <ContractsTab />}
          {activeTab === 'attendance' && <AttendanceTab />}
          {activeTab === 'evaluations' && <EvaluationsTab />}
          {activeTab === 'training' && <TrainingTab />}
          {activeTab === 'onboarding' && <OnboardingTab />}
        </div>
      </div>
    </div>
  );
}

export default function HRPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-[#64748B] p-6">Cargando Recursos Humanos...</div>}>
      <HRPageInner />
    </Suspense>
  );
}
