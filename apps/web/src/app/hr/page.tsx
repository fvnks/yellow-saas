'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Users, Clock, Award, GraduationCap, UserPlus, Plus } from 'lucide-react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import ContractsTab from './components/ContractsTab';
import AttendanceTab from './components/AttendanceTab';
import EvaluationsTab from './components/EvaluationsTab';
import TrainingTab from './components/TrainingTab';
import OnboardingTab from './components/OnboardingTab';

const tabs = [
  { id: 'contracts', label: 'Contratos & Liquidaciones' },
  { id: 'attendance', label: 'Control de Asistencia' },
  { id: 'evaluations', label: 'Evaluaciones de Desempeño' },
  { id: 'training', label: 'Capacitación & Cursos' },
  { id: 'onboarding', label: 'Onboarding & Ingresos' },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#232323] tracking-tight">Recursos Humanos & Nómina</h1>
          <p className="text-xs text-[#718EBF] mt-1">Gestión integral de colaboradores, contratos, asistencia y talento</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-xs">
            <Plus className="w-4 h-4" />
            Nuevo Contrato
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Total Colaboradores</p>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">42</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">+3 contratos este mes</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Asistencia Hoy</p>
            <div className="w-10 h-10 bg-teal-50 text-[#16DBCC] rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">97.6%</p>
          <p className="text-[11px] text-[#718EBF] mt-1 font-medium">41 marcaciones a tiempo</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Evaluaciones Pendientes</p>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">5</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Cierre de periodo Q3</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Capacitaciones Activas</p>
            <div className="w-10 h-10 bg-blue-50 text-[#1814F3] rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">3 Cursos</p>
          <p className="text-[11px] text-[#718EBF] mt-[2px] font-medium">18 inscritos</p>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs overflow-hidden p-2 sm:p-6">
        <ContinuousTabs tabs={tabs} defaultActiveId={activeTab} onChange={setActiveTab} />
        <div className="pt-6">
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
    <Suspense fallback={<div className="animate-pulse text-xs text-[#718EBF] p-6">Cargando Módulo RRHH...</div>}>
      <HRPageInner />
    </Suspense>
  );
}
