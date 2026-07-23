'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, Layers } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

const PROJECT_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500',
  'bg-rose-500', 'bg-violet-500', 'bg-cyan-500', 'bg-orange-500',
  'bg-teal-500', 'bg-pink-500',
];

export default function AllocationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => { loadAllocation(); }, [period]);

  const loadAllocation = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getResourceAllocation(period);
      setData(res);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>
    </div>
  );

  if (!data) return null;

  const { allocation, employees, projects } = data;

  const getEmployeeAllocation = (employeeId: string) =>
    allocation.filter((a: any) => a.employee_id === employeeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Asignacion de Recursos</h1>
          <p className="text-sm text-slate-500 mt-1">Distribucion de horas por empleado en proyectos</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === opt.value ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas Totales</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{employees.reduce((s: number, e: any) => s + parseFloat(e.total_hours), 0).toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyectos Activos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Distribucion por Empleado</h3>
        </div>
        <div className="p-6">
          {employees.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No hay horas registradas en este periodo</p>
          ) : (
            <div className="space-y-6">
              {employees.map((emp: any) => {
                const empAllocation = getEmployeeAllocation(emp.employee_id);
                const projectCount = empAllocation.length;
                return (
                  <div key={emp.employee_id} className="border border-slate-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{emp.employee_name}</span>
                        <span className="text-xs text-slate-500 ml-2">{emp.total_hours}h en {projectCount} proyecto{projectCount !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{emp.active_days} dias activos</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      {empAllocation.map((a: any, i: number) => {
                        const pct = parseFloat(a.allocation_pct) || 0;
                        return (
                          <div key={i} className={`${PROJECT_COLORS[i % PROJECT_COLORS.length]} relative group cursor-default`}
                            style={{ width: `${pct}%` }}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {a.project_name}: {pct}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {empAllocation.map((a: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${PROJECT_COLORS[i % PROJECT_COLORS.length]}`} />
                          <span className="text-[10px] text-slate-600">{a.project_name}</span>
                          <span className="text-[10px] font-semibold text-slate-900">{a.allocation_pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Carga por Proyecto</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {projects.map((p: any) => (
              <div key={p.project_id} className="flex items-center gap-4">
                <span className="text-xs text-slate-700 w-40 truncate">{p.project_name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min((parseFloat(p.total_hours) / (projects[0] ? parseFloat(projects[0].total_hours) : 1)) * 100, 100)}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-900 w-12 text-right">{parseFloat(p.total_hours).toFixed(0)}h</span>
                <span className="text-[10px] text-slate-400 w-20 text-right">{p.employee_count} personas</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
