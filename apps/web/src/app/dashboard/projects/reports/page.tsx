'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, TrendingUp, Target } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

export default function ProjectReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => { loadReports(); }, [projectFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getProjectReports(projectFilter || undefined);
      setData(res);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
      </div>
    </div>
  );

  if (!data) return null;

  const { employees, projects, taskStatus, weeklyTrend, summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reportes de Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Utilizacion de recursos y analisis de tiempo</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Empleados Activos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.total_employees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Horas Totales (30d)</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.total_hours}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Utilizacion</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.utilization_rate}%</p>
              <p className="text-[10px] text-muted-foreground">{summary.avg_hours_per_employee}h/empleado</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Horas/Semana</p>
              <div className="space-y-1 mt-2">
                {weeklyTrend.slice(-4).map((w: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-1.5 bg-muted rounded-full flex-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((parseFloat(w.total_hours) / 200) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground w-6 text-right">{Math.round(parseFloat(w.total_hours))}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Horas por Empleado (30 dias)</h3>
          </div>
          <div className="p-6">
            {employees.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No hay horas registradas</p>
            ) : (
              <div className="space-y-3">
                {employees.slice(0, 10).map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-32 truncate">{e.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((parseFloat(e.total_hours) / (employees[0] ? parseFloat(employees[0].total_hours) : 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-12 text-right">{parseFloat(e.total_hours).toFixed(0)}h</span>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{e.project_count} proyectos</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Horas por Proyecto (30 dias)</h3>
          </div>
          <div className="p-6">
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No hay horas registradas</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 10).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-32 truncate">{p.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min((parseFloat(p.total_hours) / (projects[0] ? parseFloat(projects[0].total_hours) : 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-12 text-right">{parseFloat(p.total_hours).toFixed(0)}h</span>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{p.contributor_count} personas</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Estado de Tareas por Proyecto</h3>
        </div>
        <div className="p-6">
          {taskStatus.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay tareas creadas</p>
          ) : (
            <div className="space-y-4">
              {taskStatus.map((ts: any) => {
                const total = parseInt(ts.total) || 1;
                return (
                  <div key={ts.project_id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{ts.project_name}</span>
                      <span className="text-[10px] text-muted-foreground">{ts.total} tareas</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div className="bg-muted" style={{ width: `${(parseInt(ts.todo_count) / total) * 100}%` }} />
                      <div className="bg-blue-400" style={{ width: `${(parseInt(ts.in_progress_count) / total) * 100}%` }} />
                      <div className="bg-amber-400" style={{ width: `${(parseInt(ts.review_count) / total) * 100}%` }} />
                      <div className="bg-emerald-400" style={{ width: `${(parseInt(ts.done_count) / total) * 100}%` }} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-muted rounded-full" />{ts.todo_count} por hacer</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />{ts.in_progress_count} en progreso</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />{ts.review_count} revision</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{ts.done_count} hecho</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
