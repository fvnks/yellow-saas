'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface EmployeeResource {
  employee_id: string;
  employee_name: string;
  position: string;
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  in_progress_tasks: number;
  pending_hours: number;
  total_estimated_hours: number;
  logged_hours: number;
  logged_this_week: number;
}

interface ResourceAllocationProps {
  projectId?: string;
}

export default function ResourceAllocation({ projectId }: ResourceAllocationProps) {
  const [resources, setResources] = useState<EmployeeResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadResources(); }, [projectId]);

  const loadResources = async () => {
    try {
      const api = getApiClient();
      const res = await api.getProjectResources(projectId);
      setResources(Array.isArray(res) ? res : []);
    } catch (err) { toast.error('Error al cargar recursos'); }
    finally { setLoading(false); }
  };

  const getWorkloadLevel = (r: EmployeeResource) => {
    if (r.in_progress_tasks >= 5 || r.pending_hours >= 40) return { level: 'overloaded', color: 'bg-red-500', label: 'Sobrecargado', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    if (r.in_progress_tasks >= 3 || r.pending_hours >= 20) return { level: 'high', color: 'bg-amber-500', label: 'Alta carga', textColor: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    if (r.active_tasks > 0) return { level: 'normal', color: 'bg-emerald-500', label: 'Normal', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
    return { level: 'available', color: 'bg-slate-300', label: 'Disponible', textColor: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const overloaded = resources.filter(r => getWorkloadLevel(r).level === 'overloaded').length;
  const highWorkload = resources.filter(r => getWorkloadLevel(r).level === 'high').length;
  const available = resources.filter(r => getWorkloadLevel(r).level === 'available').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Asignacion de Recursos</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" />{overloaded} sobrecargados</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" />{highWorkload} alta carga</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full" />{available} disponibles</span>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-8 bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No hay empleados asignados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map(r => {
            const workload = getWorkloadLevel(r);
            const completionRate = r.total_tasks > 0 ? Math.round((r.completed_tasks / r.total_tasks) * 100) : 0;
            return (
              <div key={r.employee_id} className={`bg-white border ${workload.borderColor} rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-indigo-600">
                        {r.employee_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{r.employee_name}</h4>
                      <p className="text-[10px] text-slate-400">{r.position || 'Sin cargo'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${workload.bgColor} ${workload.textColor} border ${workload.borderColor}`}>
                    {workload.label}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase">Tareas</p>
                    <p className="text-sm font-bold text-slate-900">{r.active_tasks}<span className="text-xs font-normal text-slate-400">/{r.total_tasks}</span></p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase">Horas Pend.</p>
                    <p className="text-sm font-bold text-slate-900">{Math.round(r.pending_hours)}h</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase">Registradas</p>
                    <p className="text-sm font-bold text-slate-900">{Math.round(r.logged_hours)}h</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase">Esta Semana</p>
                    <p className="text-sm font-bold text-slate-900">{Math.round(r.logged_this_week)}h</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Progreso</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${workload.color}`} style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
