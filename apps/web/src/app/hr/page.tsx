'use client'; import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, ClipboardCheck, BarChart3, GraduationCap, UserPlus } from 'lucide-react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import ContractsTab from './components/ContractsTab';
import AttendanceTab from './components/AttendanceTab';
import EvaluationsTab from './components/EvaluationsTab';
import TrainingTab from './components/TrainingTab';
import OnboardingTab from './components/OnboardingTab'; const tabs = [ { id: 'contracts', label: 'Contratos' }, { id: 'attendance', label: 'Asistencia' }, { id: 'evaluations', label: 'Evaluaciones' }, { id: 'training', label: 'Capacitación' }, { id: 'onboarding', label: 'Onboarding' },
]; function HRPageInner() { const searchParams = useSearchParams(); const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'contracts'); useEffect(() => { const tab = searchParams.get('tab'); if (tab && tabs.some(t => t.id === tab)) { setActiveTab(tab); } }, [searchParams]); return ( <div className="space-y-6"> <div className="flex items-center justify-between"> <div> <h1 className="text-xl font-bold text-foreground">Recursos Humanos</h1> <p className="text-sm text-muted-foreground mt-1">Gestión de talento humano, contratos, asistencia y evaluaciones</p> </div> </div> <div className="bg-card border border-border rounded-xl shadow-sm"> <ContinuousTabs tabs={tabs} defaultActiveId={activeTab} onChange={setActiveTab} /> <div className="p-6"> {activeTab === 'contracts' && <ContractsTab />} {activeTab === 'attendance' && <AttendanceTab />} {activeTab === 'evaluations' && <EvaluationsTab />} {activeTab === 'training' && <TrainingTab />} {activeTab === 'onboarding' && <OnboardingTab />} </div> </div> </div> );
} export default function HRPage() { return ( <Suspense fallback={<div className="animate-pulse text-sm text-muted-foreground p-6">Cargando...</div>}> <HRPageInner /> </Suspense> );
}
