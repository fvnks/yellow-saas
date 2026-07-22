'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Grid3X3, Rows3 } from 'lucide-react';

interface ProjectCalendarProps {
  tasks: any[];
  milestones: any[];
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-700',
  urgent: 'bg-red-50 text-red-700',
};

const statusColors: Record<string, string> = {
  todo: 'border-l-slate-400',
  in_progress: 'border-l-blue-500',
  review: 'border-l-amber-500',
  done: 'border-l-emerald-500',
};

export default function ProjectCalendar({ tasks, milestones }: ProjectCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayEvents: { type: string; name: string; color: string; status?: string }[] = [];

    for (const task of tasks) {
      if (task.due_date === dateStr) {
        dayEvents.push({ type: 'task', name: task.name, color: priorityColors[task.priority] || 'bg-slate-100 text-slate-600', status: task.status });
      }
      if (task.start_date === dateStr && task.start_date !== task.due_date) {
        dayEvents.push({ type: 'task-start', name: `▶ ${task.name}`, color: 'bg-indigo-50 text-indigo-700', status: task.status });
      }
    }

    for (const ms of milestones) {
      if (ms.due_date === dateStr) {
        dayEvents.push({ type: 'milestone', name: `◆ ${ms.name}`, color: 'bg-purple-50 text-purple-700', status: ms.status });
      }
    }

    return dayEvents;
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].substring(0, 3)} — ${end.getDate()} ${MONTHS[end.getMonth()].substring(0, 3)} ${end.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Calendario</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Grid3X3 className="w-3.5 h-3.5 inline mr-1" />Mes
            </button>
            <button onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Rows3 className="w-3.5 h-3.5 inline mr-1" />Semana
            </button>
          </div>
          <button onClick={goToday} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
            Hoy
          </button>
          <div className="flex items-center gap-1">
            <button onClick={viewMode === 'month' ? prevMonth : prevWeek} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-900 min-w-[180px] text-center">
              {viewMode === 'month' ? `${MONTHS[month]} ${year}` : formatWeekRange()}
            </span>
            <button onClick={viewMode === 'month' ? nextMonth : nextWeek} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {viewMode === 'month' ? (
          <div className="grid grid-cols-7">
            {DAYS.map(day => (
              <div key={day} className="px-2 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase border-b border-slate-200 bg-slate-50">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const events = getEventsForDay(new Date(year, month, day));
              return (
                <div key={day} className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${isToday ? 'bg-indigo-50/30' : 'hover:bg-slate-50'} transition-colors`}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>
                    {isToday && <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px]">{day}</span>}
                    {!isToday && day}
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((event, j) => (
                      <div key={j} className={`text-[9px] px-1 py-0.5 rounded truncate border-l-2 ${event.color} ${statusColors[event.status || ''] || 'border-l-transparent'}`}
                        title={event.name}>
                        {event.name}
                      </div>
                    ))}
                    {events.length > 3 && <span className="text-[9px] text-slate-400">+{events.length - 3} mas</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200">
              {weekDays.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString();
                return (
                  <div key={i} className={`px-2 py-3 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                    <div className="text-[9px] font-semibold text-slate-500 uppercase">{DAYS[day.getDay()]}</div>
                    <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 min-h-[300px]">
              {weekDays.map((day, i) => {
                const events = getEventsForDay(day);
                const isToday = day.toDateString() === today.toDateString();
                return (
                  <div key={i} className={`border-r border-slate-100 last:border-r-0 p-1.5 ${isToday ? 'bg-indigo-50/20' : ''}`}>
                    <div className="space-y-1">
                      {events.map((event, j) => (
                        <div key={j} className={`text-[9px] px-1.5 py-1 rounded border-l-2 ${event.color} ${statusColors[event.status || ''] || 'border-l-transparent'} truncate`}
                          title={event.name}>
                          {event.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-50 border-l-2 border-l-indigo-500 rounded" /> Inicio tarea</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-50 border-l-2 border-l-blue-500 rounded" /> Fin tarea</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-50 border-l-2 border-l-purple-500 rounded" /> Hito</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-50 border-l-2 border-l-emerald-500 rounded" /> Completada</span>
      </div>
    </div>
  );
}
