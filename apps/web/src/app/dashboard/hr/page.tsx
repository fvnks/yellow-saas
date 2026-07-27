'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@yellow-erp/ui';
import { UsersRound, Plus, Search, FileText, ClipboardCheck, BarChart3, GraduationCap, UserPlus, Eye, Edit, Trash2, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import ContractsTab from './components/ContractsTab';
import AttendanceTab from './components/AttendanceTab';
import EvaluationsTab from './components/EvaluationsTab';
import TrainingTab from './components/TrainingTab';
import OnboardingTab from './components/OnboardingTab';

const tabs = [
  { id: 'contracts', label: 'Contratos', icon: FileText },
  { id: 'attendance', label: 'Asistencia', icon: ClipboardCheck },
  { id: 'evaluations', label: 'Evaluaciones', icon: BarChart3 },
  { id: 'training', label: 'Capacitación', icon: GraduationCap },
  { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState('contracts');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recursos Humanos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de talento humano, contratos, asistencia y evaluaciones</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <ContinuousTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
