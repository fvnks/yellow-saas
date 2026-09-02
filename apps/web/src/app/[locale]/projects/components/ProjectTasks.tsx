'use client';

import { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit, User, ChevronDown, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  assignee_name?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress?: number;
  parent_id?: string;
}

interface ProjectTasksProps {
  projectId: string;
  tasks: Task[];
  members: any[];
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Por Hacer', icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
  { value: 'in_progress', label: 'En Progreso', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' },
  { value: 'review', label: 'Revisión', icon: Eye, color: 'text-amber-500', bg: 'bg-amber-100' },
  { value: 'done', label: 'Completada', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', color: 'bg-muted text-foreground border-border' },
  { value: 'medium', label: 'Media', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'high', label: 'Alta', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'urgent', label: 'Urgente', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export default function ProjectTasks({ projectId, tasks, members, onRefresh }: ProjectTasksProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', assignee_id: '', due_date: '', estimated_hours: '' });

  const filtered = tasks.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditingTask(null);
    setForm({ name: '', description: '', priority: 'medium', assignee_id: '', due_date: '', estimated_hours: '' });
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      assignee_id: '',
      due_date: task.due_date || '',
      estimated_hours: task.estimated_hours?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const api = (await import('@/lib/api-client')).getApiClient();
    if (editingTask) {
      await api.updateProjectTask(projectId, editingTask.id, {
        name: form.name,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      });
    } else {
      await api.createProjectTask(projectId, {
        name: form.name,
        description: form.description,
        priority: form.priority,
        assignee_id: form.assignee_id || null,
        due_date: form.due_date || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      });
    }
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Eliminar esta tarea?')) return;
    const api = (await import('@/lib/api-client')).getApiClient();
    await api.deleteProjectTask(projectId, taskId);
    onRefresh();
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const api = (await import('@/lib/api-client')).getApiClient();
    await api.updateProjectTask(projectId, taskId, { status: newStatus });
    onRefresh();
  };

  const getPriority = (p: string) => PRIORITY_OPTIONS.find(o => o.value === p) || PRIORITY_OPTIONS[1];
  const getStatus = (s: string) => STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="search" placeholder="Buscar tarea..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.value} onClick={() => setStatusFilter(statusFilter === s.value ? 'all' : s.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${statusFilter === s.value ? `${s.bg} ${s.color}` : 'text-muted-foreground hover:bg-muted'}`}>
                  <Icon className="w-3 h-3" /> {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Tarea
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tarea</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridad</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Asignado</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Vencimiento</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => {
              const st = getStatus(task.status);
              const pr = getPriority(task.priority);
              const StIcon = st.icon;
              return (
                <tr key={task.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-foreground">{task.name}</p>
                    {task.description && <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-xs">{task.description}</p>}
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold border ${pr.color}`}>{pr.label}</span></td>
                  <td className="px-4 py-3 text-xs text-foreground">{task.assignee_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{task.due_date || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                      className="bg-transparent border-0 text-[10px] font-semibold cursor-pointer focus:outline-none">
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEdit(task)}>
                          <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-xs text-muted-foreground">No hay tareas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Asignar a</label>
                  <select value={form.assignee_id} onChange={e => setForm(p => ({ ...p, assignee_id: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="">Sin asignar</option>
                    {members.map((m: any) => <option key={m.user_id || m.id} value={m.user_id || m.id}>{m.user_name || m.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Vencimiento</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Horas Estimadas</label>
                  <input type="number" value={form.estimated_hours} onChange={e => setForm(p => ({ ...p, estimated_hours: e.target.value }))} placeholder="0"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">{editingTask ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
