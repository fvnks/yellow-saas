'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, GripVertical, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  assignee_name?: string;
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
  parent_id?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (task: Task, newStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (status: string) => void;
}

const columns = [
  { id: 'todo', label: 'Por Hacer', color: 'bg-muted0', bgColor: 'bg-muted', borderColor: 'border-border' },
  { id: 'in_progress', label: 'En Progreso', color: 'bg-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'review', label: 'En Revision', color: 'bg-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'done', label: 'Completada', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-muted text-slate-600' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Alta', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
};

function TaskCard({ task, onEdit, onDelete, onDragStart }: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{task.name}</p>
          {task.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-7 bg-card border border-border rounded-lg shadow-lg z-20 dark:bg-primary dark:border-slate-800 py-1 min-w-[120px]">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2">
                  <Edit className="w-3 h-3" /> Editar
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${priority.color}`}>
          {priority.label}
        </span>
        {isOverdue && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-100 text-red-700">
            Vencida
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {task.assignee_name && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-indigo-600">
                  {task.assignee_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="truncate max-w-[60px]">{task.assignee_name.split(' ')[0]}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              <Calendar className="w-2.5 h-2.5" />
              {new Date(task.due_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {task.estimated_hours && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {task.estimated_hours}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete, onAddTask }: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const tasksByStatus = columns.map(col => ({
    ...col,
    tasks: tasks.filter(t => t.status === col.id && !t.parent_id),
  }));

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/json', JSON.stringify(task));
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json')) as Task;
      if (taskData && taskData.status !== columnId) {
        onStatusChange(taskData, columnId);
      }
    } catch {
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {tasksByStatus.map(col => (
        <div
          key={col.id}
          className={`flex-1 min-w-[280px] max-w-[350px] rounded-xl transition-all ${
            dragOverColumn === col.id ? 'ring-2 ring-indigo-300 ring-offset-2' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, col.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${col.bgColor} border ${col.borderColor}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-xs font-semibold text-foreground">{col.label}</span>
              <span className="text-[10px] font-medium text-muted-foreground bg-card/60 px-1.5 py-0.5 rounded">
                {col.tasks.length}
              </span>
            </div>
            <button
              onClick={() => onAddTask(col.id)}
              className="p-1 hover:bg-card/60 rounded transition-colors"
            >
              <span className="text-muted-foreground text-sm">+</span>
            </button>
          </div>

          <div className={`space-y-2 p-2 min-h-[200px] rounded-b-xl border border-t-0 ${col.borderColor} ${col.bgColor}/30`}>
            {col.tasks.length === 0 ? (
              <div className="h-full min-h-[160px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <p className="text-[10px] text-muted-foreground">Arrastra tareas aqui</p>
              </div>
            ) : (
              col.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id)}
                  onDragStart={handleDragStart}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
