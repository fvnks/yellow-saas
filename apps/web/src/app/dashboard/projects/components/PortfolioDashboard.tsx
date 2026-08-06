'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, DollarSign, CheckCircle2, AlertTriangle, FolderKanban } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface PortfolioData {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_tasks: number;
  completed_tasks: number;
  total_budget: number;
  total_spent: number;
  overdue_tasks: number;
  projects: any[];
}

export default function PortfolioDashboard() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPortfolio(); }, []);

  const loadPortfolio = async () => {
    try {
      const api = getApiClient();
      const projects = await api.getProjects();
      const projectList = Array.isArray(projects) ? projects : [];

      let totalTasks = 0;
      let completedTasks = 0;
      let overdueTasks = 0;
      let totalBudget = 0;
      let totalSpent = 0;

      for (const project of projectList) {
        totalBudget += parseFloat(project.budget || 0);
        totalSpent += parseFloat(project.spent || 0);

        try {
          const tasks = await api.getProjectTasks(project.id);
          const taskList = Array.isArray(tasks) ? tasks : [];
          totalTasks += taskList.length;
          completedTasks += taskList.filter((t: any) => t.status === 'done').length;
          overdueTasks += taskList.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
        } catch {}
      }

      setData({
        total_projects: projectList.length,
        active_projects: projectList.filter((p: any) => p.status === 'active').length,
        completed_projects: projectList.filter((p: any) => p.status === 'completed').length,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_budget: totalBudget,
        total_spent: totalSpent,
        overdue_tasks: overdueTasks,
        projects: projectList,
      });
    } catch (err) {
      toast.error('Error al cargar portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const completionRate = data.total_tasks > 0 ? Math.round((data.completed_tasks / data.total_tasks) * 100) : 0;
  const budgetUsage = data.total_budget > 0 ? Math.round((data.total_spent / data.total_budget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Vista general de todos los proyectos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Proyectos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{data.total_projects}</p>
              <p className="text-xs text-emerald-600 mt-1">{data.active_projects} activos</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tareas Completadas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{data.completed_tasks}/{data.total_tasks} tareas</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Uso Presupuesto</p>
              <p className="text-2xl font-bold text-foreground mt-1">{budgetUsage}%</p>
              <p className="text-xs text-muted-foreground mt-1">${data.total_spent.toLocaleString()} / ${data.total_budget.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tareas Vencidas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{data.overdue_tasks}</p>
              <p className="text-xs text-rose-600 mt-1">{data.overdue_tasks > 0 ? 'Requiere atencion' : 'Todo al dia'}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-foreground">Proyectos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proyecto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Progreso</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Presupuesto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha Fin</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((project: any) => {
                const progress = project.progress || 0;
                return (
                  <tr key={project.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{project.name}</p>
                      <p className="text-[10px] text-muted-foreground">{project.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        project.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        project.status === 'completed' ? 'bg-muted text-slate-600 border border-border' :
                        project.status === 'on_hold' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-muted text-slate-600 border border-border'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24 bg-muted rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{progress}%</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      ${parseFloat(project.budget || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {project.end_date ? new Date(project.end_date).toLocaleDateString('es-CL') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
