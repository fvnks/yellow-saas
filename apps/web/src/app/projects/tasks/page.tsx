'use client';

import { useState, useEffect } from 'react';
import { ListTodo, Plus, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const projectsRes = await api.getProjects({ limit: 100 });
      const projectsList = projectsRes.data || [];
      setProjects(projectsList);

      const allTasks: any[] = [];
      for (const project of projectsList.slice(0, 10)) {
        try {
          const tasksRes = await api.getProjectTasks(project.id);
          if (Array.isArray(tasksRes)) {
            tasksRes.forEach((t: any) => allTasks.push({ ...t, project_name: project.name }));
          }
        } catch {}
      }
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
    setLoading(false);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusTabs = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'in_progress', label: 'En Progreso' },
    { id: 'completed', label: 'Completadas' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'in_progress': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tareas</h1>
          <p className="text-sm text-muted-foreground mt-1">Todas las tareas de todos los proyectos</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Buscar tarea o proyecto..."
            />
          </div>
          <div className="flex gap-2">
            {statusTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === tab.id ? 'bg-primary text-white' : 'bg-muted text-slate-600 hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tarea</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proyecto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridad</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha Límite</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-xs font-medium text-foreground">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{task.project_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : task.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-muted text-slate-600 border border-border'}`}>
                        {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${task.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-muted text-slate-600 border border-border'}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{task.due_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ListTodo className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No se encontraron tareas</p>
        </div>
      )}
    </div>
  );
}
