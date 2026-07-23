'use client';

import { useState, useMemo } from 'react';
import { Clock, Download, BarChart3, Users } from 'lucide-react';
import { downloadCSV, downloadExcel } from '@/lib/export-utils';

interface HoursReportProps {
  timesheets: any[];
  tasks: any[];
  employees: any[];
}

export default function HoursReport({ timesheets, tasks, employees }: HoursReportProps) {
  const [viewMode, setViewMode] = useState<'employee' | 'task'>('employee');

  const employeeStats = useMemo(() => {
    const stats = new Map<string, { name: string; totalHours: number; billableHours: number; taskCount: number; tasks: Set<string> }>();

    for (const ts of timesheets) {
      const empId = ts.employee_id;
      if (!empId) continue;
      if (!stats.has(empId)) {
        const emp = employees.find(e => e.id === empId);
        stats.set(empId, { name: emp?.full_name || emp?.first_name || 'Sin asignar', totalHours: 0, billableHours: 0, taskCount: 0, tasks: new Set() });
      }
      const s = stats.get(empId)!;
      const hours = parseFloat(ts.hours) || 0;
      s.totalHours += hours;
      if (ts.billable !== false) s.billableHours += hours;
      if (ts.task_id && !s.tasks.has(ts.task_id)) {
        s.tasks.add(ts.task_id);
        s.taskCount++;
      }
    }

    return Array.from(stats.entries()).map(([id, s]) => ({
      id, ...s, tasks: undefined,
    })).sort((a, b) => b.totalHours - a.totalHours);
  }, [timesheets, employees]);

  const taskStats = useMemo(() => {
    const stats = new Map<string, { name: string; totalHours: number; assignee: string; status: string }>();

    for (const ts of timesheets) {
      const taskId = ts.task_id;
      if (!taskId) continue;
      if (!stats.has(taskId)) {
        const task = tasks.find(t => t.id === taskId);
        stats.set(taskId, { name: task?.name || 'Tarea desconocida', totalHours: 0, assignee: task?.assignee_name || '—', status: task?.status || '—' });
      }
      const s = stats.get(taskId)!;
      s.totalHours += parseFloat(ts.hours) || 0;
    }

    return Array.from(stats.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [timesheets, tasks]);

  const totalHours = employeeStats.reduce((sum, e) => sum + e.totalHours, 0);
  const totalBillable = employeeStats.reduce((sum, e) => sum + e.billableHours, 0);

  const handleExport = (type: 'csv' | 'excel') => {
    const data = viewMode === 'employee'
      ? employeeStats.map(e => ({
          Empleado: e.name,
          'Horas Totales': e.totalHours.toFixed(1),
          'Horas Facturables': e.billableHours.toFixed(1),
          Tareas: e.taskCount,
        }))
      : taskStats.map(t => ({
          Tarea: t.name,
          Asignado: t.assignee,
          Estado: t.status,
          Horas: t.totalHours.toFixed(1),
        }));

    const filename = viewMode === 'employee' ? 'horas_por_empleado' : 'horas_por_tarea';
    if (type === 'csv') downloadCSV(data, filename);
    else downloadExcel(data, filename);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Reporte de Horas</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('employee')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'employee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Users className="w-3.5 h-3.5 inline mr-1" />Por Empleado
            </button>
            <button onClick={() => setViewMode('task')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'task' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />Por Tarea
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => handleExport('csv')} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600 hover:bg-slate-50">CSV</button>
            <button onClick={() => handleExport('excel')} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600 hover:bg-slate-50">Excel</button>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Horas</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalHours.toFixed(1)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas Facturables</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{totalBillable.toFixed(1)}</p>
          <p className="text-[10px] text-slate-400">{totalHours > 0 ? Math.round((totalBillable / totalHours) * 100) : 0}% del total</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleados</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{employeeStats.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {viewMode === 'employee' ? (
                  <>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas Totales</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Facturables</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tareas</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Distribucion</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tarea</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Asignado</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Distribucion</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {viewMode === 'employee' ? (
                employeeStats.map((emp, i) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{emp.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 text-right font-semibold">{emp.totalHours.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-xs text-slate-700 text-right">{emp.billableHours.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-xs text-slate-700 text-right">{emp.taskCount}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${totalHours > 0 ? (emp.totalHours / totalHours) * 100 : 0}%` }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                taskStats.map((task, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{task.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{task.assignee}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        task.status === 'done' ? 'bg-emerald-50 text-emerald-700' :
                        task.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status === 'done' ? 'Completada' : task.status === 'in_progress' ? 'En Progreso' : task.status === 'review' ? 'Revision' : 'Por Hacer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 text-right font-semibold">{task.totalHours.toFixed(1)}h</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${totalHours > 0 ? (task.totalHours / totalHours) * 100 : 0}%` }} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {((viewMode === 'employee' && employeeStats.length === 0) || (viewMode === 'task' && taskStats.length === 0)) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                    No hay horas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
