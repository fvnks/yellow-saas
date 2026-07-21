'use client';

import { useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  start_date: string | null;
  due_date: string | null;
  status: string;
  progress?: number;
  assignee_name?: string;
}

interface Dependency {
  task_id: string;
  depends_on_id: string;
  dependency_type: string;
}

interface GanttChartProps {
  tasks: Task[];
  dependencies?: Dependency[];
  startDate?: string;
  endDate?: string;
}

const statusColors: Record<string, string> = {
  todo: 'bg-slate-300',
  in_progress: 'bg-blue-500',
  review: 'bg-amber-500',
  done: 'bg-emerald-500',
};

function parseDate(d: string | null): Date | null {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function GanttChart({ tasks, dependencies = [], startDate, endDate }: GanttChartProps) {
  const { chartStart, chartEnd, totalDays, tasks: enrichedTasks, months } = useMemo(() => {
    const allDates = tasks.flatMap(t => [parseDate(t.start_date), parseDate(t.due_date)]).filter(Boolean) as Date[];
    if (allDates.length === 0) {
      const now = new Date();
      return { chartStart: now, chartEnd: new Date(now.getTime() + 30 * 86400000), totalDays: 30, tasks: [], months: [] };
    }

    const cs = startDate ? new Date(startDate) : new Date(Math.min(...allDates.map(d => d.getTime())));
    const ce = endDate ? new Date(endDate) : new Date(Math.max(...allDates.map(d => d.getTime())));
    cs.setDate(1);
    ce.setMonth(ce.getMonth() + 1, 0);
    const td = daysBetween(cs, ce) + 1;

    const enriched = tasks.map(t => {
      const s = parseDate(t.start_date);
      const e = parseDate(t.due_date);
      return {
        ...t,
        _start: s ? daysBetween(cs, s) : 0,
        _width: s && e ? Math.max(daysBetween(s, e) + 1, 1) : 7,
      };
    });

    const ms: { label: string; days: number }[] = [];
    const d = new Date(cs);
    while (d <= ce) {
      const monthStart = new Date(d);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const end = monthEnd > ce ? ce : monthEnd;
      ms.push({
        label: d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }),
        days: daysBetween(monthStart, end) + 1,
      });
      d.setMonth(d.getMonth() + 1);
    }

    return { chartStart: cs, chartEnd: ce, totalDays: td, tasks: enriched, months: ms };
  }, [tasks, dependencies, startDate, endDate]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
        <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No hay tareas con fechas para mostrar en el Gantt</p>
      </div>
    );
  }

  const dayWidth = 28;
  const rowHeight = 40;
  const labelWidth = 220;

  const taskIndexMap = new Map(enrichedTasks.map((t, i) => [t.id, i]));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Diagrama de Gantt</h3>
        <span className="text-xs text-slate-500">{chartStart.toLocaleDateString('es-CL')} — {chartEnd.toLocaleDateString('es-CL')}</span>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: labelWidth + totalDays * dayWidth }}>
          {/* Month headers */}
          <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
            <div style={{ width: labelWidth }} className="px-4 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
              Tarea
            </div>
            <div className="flex flex-1">
              {months.map((m, i) => (
                <div key={i} style={{ width: m.days * dayWidth }} className="px-2 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 text-center">
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          {enrichedTasks.map((task, idx) => (
            <div key={task.id} className={`flex border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`} style={{ height: rowHeight }}>
              <div style={{ width: labelWidth }} className="px-4 py-2 border-r border-slate-200 flex flex-col justify-center">
                <span className="text-xs font-medium text-slate-900 truncate">{task.name}</span>
                {task.assignee_name && <span className="text-[9px] text-slate-400 truncate">{task.assignee_name}</span>}
              </div>
              <div className="flex-1 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {months.map((m, i) => (
                    <div key={i} style={{ width: m.days * dayWidth }} className="border-r border-slate-100" />
                  ))}
                </div>

                {/* Today line */}
                {(() => {
                  const today = new Date();
                  const dayOffset = daysBetween(chartStart, today);
                  if (dayOffset >= 0 && dayOffset <= totalDays) {
                    return (
                      <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: dayOffset * dayWidth + dayWidth / 2 }} />
                    );
                  }
                  return null;
                })()}

                {/* Task bar */}
                <div
                  className={`absolute top-2 bottom-2 rounded-md ${statusColors[task.status] || 'bg-slate-300'} shadow-sm flex items-center px-2 transition-all`}
                  style={{
                    left: task._start * dayWidth + 2,
                    width: task._width * dayWidth - 4,
                    minWidth: 20,
                  }}
                >
                  {task.progress !== undefined && task.progress > 0 && (
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-md opacity-30 bg-white"
                      style={{ width: `${task.progress}%` }}
                    />
                  )}
                  <span className="text-[9px] font-semibold text-white truncate relative z-10">
                    {task.progress !== undefined ? `${task.progress}%` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Dependency arrows */}
          {dependencies.length > 0 && (
            <svg
              className="absolute pointer-events-none"
              style={{ top: 0, left: labelWidth, width: totalDays * dayWidth, height: enrichedTasks.length * rowHeight }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
                </marker>
              </defs>
              {dependencies.map((dep, i) => {
                const fromIdx = taskIndexMap.get(dep.depends_on_id);
                const toIdx = taskIndexMap.get(dep.task_id);
                if (fromIdx === undefined || toIdx === undefined) return null;
                const fromTask = enrichedTasks[fromIdx];
                const toTask = enrichedTasks[toIdx];
                const fromX = (fromTask._start + fromTask._width) * dayWidth;
                const fromY = fromIdx * rowHeight + rowHeight / 2;
                const toX = toTask._start * dayWidth;
                const toY = toIdx * rowHeight + rowHeight / 2;
                const midX = fromX + (toX - fromX) / 2;
                return (
                  <path
                    key={i}
                    d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrowhead)"
                    opacity="0.6"
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-4">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-[9px] text-slate-500 capitalize">{status === 'in_progress' ? 'En Progreso' : status === 'todo' ? 'Por Hacer' : status === 'review' ? 'Revision' : 'Hecho'}</span>
          </div>
        ))}
        {dependencies.length > 0 && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" /><polygon points="16,2 20,5 16,8" fill="#6366f1" /></svg>
            <span className="text-[9px] text-slate-500">Dependencia</span>
          </div>
        )}
      </div>
    </div>
  );
}
