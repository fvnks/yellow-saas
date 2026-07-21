'use client';

import { useMemo } from 'react';
import { BarChart3, Clock, CheckCircle2, DollarSign, Calendar, AlertTriangle, TrendingUp, Users, ArrowRight } from 'lucide-react';

interface ProjectDashboardProps {
  project: any;
  tasks: any[];
  milestones: any[];
  expenses: any[];
  timesheets: any[];
  costs: any[];
  employees: any[];
}

export default function ProjectDashboard({ project, tasks, milestones, expenses, timesheets, costs, employees }: ProjectDashboardProps) {
  const stats = useMemo(() => {
    const budget = parseFloat(project.budget) || 0;
    const totalCosts = costs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalSpent = totalCosts + totalExpenses;
    const budgetPercent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

    const totalEstimated = tasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
    const totalActual = timesheets.reduce((sum, ts) => sum + (parseFloat(ts.hours) || 0), 0);

    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const upcomingMilestones = milestones
      .filter(m => m.due_date && new Date(m.due_date) >= new Date() && m.status !== 'completed')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 3);

    const overdueMilestones = milestones.filter(m => m.due_date && new Date(m.due_date) < new Date() && m.status !== 'completed').length;

    const taskStatusBreakdown = {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: inProgressTasks,
      review: tasks.filter(t => t.status === 'review').length,
      done: completedTasks,
    };

    const recentTimesheets = [...timesheets]
      .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
      .slice(0, 5);

    return {
      budget, totalSpent, budgetPercent, completedTasks, inProgressTasks, overdueTasks,
      totalEstimated, totalActual, completedMilestones, upcomingMilestones, overdueMilestones,
      taskStatusBreakdown, recentTimesheets, totalTasks: tasks.length, totalMilestones: milestones.length,
    };
  }, [project, tasks, milestones, expenses, timesheets, costs]);

  const statusColors: Record<string, string> = {
    todo: 'bg-slate-400',
    in_progress: 'bg-blue-500',
    review: 'bg-amber-500',
    done: 'bg-emerald-500',
  };

  const progressPercent = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Progreso</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{progressPercent}%</p>
              <p className="text-[10px] text-slate-500">{stats.completedTasks}/{stats.totalTasks} tareas</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p>
              <p className={`text-2xl font-bold mt-1 ${stats.budgetPercent > 90 ? 'text-red-600' : stats.budgetPercent > 70 ? 'text-amber-600' : 'text-slate-900'}`}>{stats.budgetPercent}%</p>
              <p className="text-[10px] text-slate-500">${(stats.totalSpent / 1000000).toFixed(1)}M / ${(stats.budget / 1000000).toFixed(1)}M</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.budgetPercent > 90 ? 'bg-red-50' : stats.budgetPercent > 70 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              <DollarSign className={`w-5 h-5 ${stats.budgetPercent > 90 ? 'text-red-600' : stats.budgetPercent > 70 ? 'text-amber-600' : 'text-emerald-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalActual.toFixed(0)}</p>
              <p className="text-[10px] text-slate-500">est: {stats.totalEstimated.toFixed(0)}h</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Alertas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.overdueTasks + stats.overdueMilestones}</p>
              <p className="text-[10px] text-slate-500">{stats.overdueTasks} tareas / {stats.overdueMilestones} hitos</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Estado de Tareas</h3>
          <div className="flex gap-1 h-6 rounded-full overflow-hidden mb-4">
            {Object.entries(stats.taskStatusBreakdown).map(([status, count]) => (
              count > 0 && (
                <div key={status} className={`${statusColors[status]} transition-all`} style={{ width: `${(count / stats.totalTasks) * 100}%` }} title={`${status}: ${count}`} />
              )
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Por Hacer', count: stats.taskStatusBreakdown.todo, color: 'bg-slate-400' },
              { label: 'En Progreso', count: stats.taskStatusBreakdown.in_progress, color: 'bg-blue-500' },
              { label: 'Revision', count: stats.taskStatusBreakdown.review, color: 'bg-amber-500' },
              { label: 'Completada', count: stats.taskStatusBreakdown.done, color: 'bg-emerald-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-slate-600">{item.label}</span>
                <span className="text-xs font-semibold text-slate-900 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Proximos Hitos</h3>
            <span className="text-[9px] text-slate-500">{stats.completedMilestones}/{stats.totalMilestones} completados</span>
          </div>
          {stats.upcomingMilestones.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No hay hitos proximos</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingMilestones.map(ms => {
                const daysUntil = Math.ceil((new Date(ms.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 3;
                return (
                  <div key={ms.id} className={`flex items-center gap-3 p-2 rounded-lg ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                    <Calendar className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${isUrgent ? 'text-red-700' : 'text-slate-900'}`}>{ms.name}</p>
                      <p className="text-[10px] text-slate-500">{new Date(ms.due_date).toLocaleDateString('es-CL')}</p>
                    </div>
                    <span className={`text-[10px] font-semibold ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>
                      {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Manana' : `${daysUntil} dias`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Actividad Reciente</h3>
          {stats.recentTimesheets.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No hay actividad reciente</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTimesheets.map(ts => {
                const emp = employees.find(e => e.id === ts.employee_id);
                const task = tasks.find(t => t.id === ts.task_id);
                return (
                  <div key={ts.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-900">
                        <span className="font-medium">{emp?.full_name || emp?.first_name || 'Empleado'}</span>
                        {' registro '}
                        <span className="font-semibold text-indigo-600">{parseFloat(ts.hours).toFixed(1)}h</span>
                        {task && <span> en <span className="font-medium">{task.name}</span></span>}
                      </p>
                      <p className="text-[10px] text-slate-400">{ts.date || ts.created_at?.split('T')[0]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hours Estimation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Estimacion de Horas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Estimadas</span>
                <span className="font-semibold text-slate-900">{stats.totalEstimated.toFixed(1)}h</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Reales</span>
                <span className={`font-semibold ${stats.totalActual > stats.totalEstimated ? 'text-red-600' : 'text-slate-900'}`}>{stats.totalActual.toFixed(1)}h</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className={`h-3 rounded-full ${stats.totalActual > stats.totalEstimated ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${stats.totalEstimated > 0 ? Math.min((stats.totalActual / stats.totalEstimated) * 100, 100) : 0}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {stats.totalActual > stats.totalEstimated ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">Sobreestimado en {(stats.totalActual - stats.totalEstimated).toFixed(1)}h</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">{(stats.totalEstimated - stats.totalActual).toFixed(1)}h restantes</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
