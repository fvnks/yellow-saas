'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ProjectCalendarProps {
  tasks: any[];
  milestones: any[];
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
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
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents: { type: string; name: string; color: string; status?: string }[] = [];

    for (const task of tasks) {
      if (task.due_date === dateStr) {
        dayEvents.push({
          type: 'task',
          name: task.name,
          color: priorityColors[task.priority] || 'bg-slate-100 text-slate-600',
          status: task.status,
        });
      }
      if (task.start_date === dateStr && task.start_date !== task.due_date) {
        dayEvents.push({
          type: 'task-start',
          name: `▶ ${task.name}`,
          color: 'bg-indigo-50 text-indigo-700',
          status: task.status,
        });
      }
    }

    for (const ms of milestones) {
      if (ms.due_date === dateStr) {
        dayEvents.push({
          type: 'milestone',
          name: `◆ ${ms.name}`,
          color: 'bg-purple-50 text-purple-700',
          status: ms.status,
        });
      }
    }

    return dayEvents;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Calendario</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-semibold text-slate-900 min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
            const events = getEventsForDay(day);

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
                  {events.length > 3 && (
                    <span className="text-[9px] text-slate-400">+{events.length - 3} más</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
