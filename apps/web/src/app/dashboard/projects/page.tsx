'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, Input, Select, KPICard } from '@yellow-erp/ui';
import { FolderKanban, Plus, Search, Calendar, Clock, CheckCircle2, BarChart3, Edit, Trash2, Eye, Users, DollarSign, Filter } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  planning: { label: 'Planificacion', variant: 'info' },
  active: { label: 'Activo', variant: 'success' },
  on_hold: { label: 'En Pausa', variant: 'warning' },
  completed: { label: 'Completado', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const priorityConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  low: { label: 'Baja', variant: 'neutral' },
  medium: { label: 'Media', variant: 'info' },
  high: { label: 'Alta', variant: 'warning' },
  urgent: { label: 'Urgente', variant: 'danger' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', code: '', description: '', customer_id: '', start_date: '', end_date: '',
    budget: '', status: 'planning', project_manager_id: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const [projectsRes, customersRes, usersRes] = await Promise.all([
        api.getProjects({ limit: 100 }),
        api.getCustomers({ limit: '100' }),
        api.getUsers({ limit: 100 }),
      ]);
      setProjects(projectsRes.data || []);
      setCustomers(customersRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
    setLoading(false);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const data = {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : 0,
        customer_id: form.customer_id || null,
        project_manager_id: form.project_manager_id || null,
      };
      if (editingProject) {
        await api.updateProject(editingProject.id, data);
      } else {
        await api.createProject(data);
      }
      setShowForm(false);
      setEditingProject(null);
      setForm({ name: '', code: '', description: '', customer_id: '', start_date: '', end_date: '', budget: '', status: 'planning', project_manager_id: '' });
      loadData();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
    setSaving(false);
  };

  const handleEdit = (project: any) => {
    setForm({
      name: project.name || '',
      code: project.code || '',
      description: project.description || '',
      customer_id: project.customer_id || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || '',
      status: project.status || 'planning',
      project_manager_id: project.project_manager_id || '',
    });
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Eliminar este proyecto?')) return;
    try {
      const api = getApiClient();
      await api.deleteProject(projectId);
      loadData();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const tabs = [
    { id: 'all', label: `Todos (${projects.length})` },
    { id: 'active', label: `Activos (${activeProjects})` },
    { id: 'planning', label: 'Planificacion' },
    { id: 'completed', label: `Completados (${completedProjects})` },
  ];

  const filteredByTab = statusFilter === 'all' ? filteredProjects : filteredProjects.filter(p => p.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestion de proyectos y presupuestos</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingProject(null); setForm({ name: '', code: '', description: '', customer_id: '', start_date: '', end_date: '', budget: '', status: 'planning', project_manager_id: '' }); }}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Proyectos" value={projects.length} icon={FolderKanban} trend={`${activeProjects} activos`} trendUp={true} />
        <KPICard label="En Progreso" value={activeProjects} icon={Clock} trend={`${completedProjects} completados`} trendUp={activeProjects > 0} />
        <KPICard label="Presupuesto Total" value={`$${(totalBudget / 1000000).toFixed(1)}M`} icon={DollarSign} trend="CLP" trendUp={true} />
        <KPICard label="Completados" value={completedProjects} icon={CheckCircle2} trend={`${projects.length > 0 ? Math.round(completedProjects / projects.length * 100) : 0}% del total`} trendUp={true} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <ContinuousTabs
          tabs={tabs}
          defaultActiveId={statusFilter}
          onChange={(id) => setStatusFilter(id)}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Buscar por nombre, codigo o cliente..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-2 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredByTab.map(project => (
            <div key={project.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                    <Badge variant={statusConfig[project.status]?.variant || 'neutral'}>{statusConfig[project.status]?.label || project.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{project.code} {project.customer_name ? `· ${project.customer_name}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-slate-500" />
                    </button>
                  </Link>
                  <button onClick={() => handleEdit(project)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Inicio</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{project.start_date || '—'}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fin</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{project.end_date || '—'}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">${(parseFloat(project.budget) / 1000000).toFixed(1)}M</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tareas</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{project.completed_tasks || 0}/{project.task_count || 0}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progreso</span>
                  <span className="font-medium text-slate-900">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {project.project_manager_name && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                    <Users className="w-3 h-3" />
                    {project.project_manager_name}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filteredByTab.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron proyectos</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button onClick={() => { setShowForm(false); setEditingProject(null); }} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Codigo *</label>
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Cliente</label>
                  <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin cliente</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Gerente</label>
                  <select value={form.project_manager_id} onChange={e => setForm({ ...form, project_manager_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin asignar</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fecha Inicio</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fecha Fin</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Presupuesto (CLP)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Estado</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="planning">Planificacion</option>
                  <option value="active">Activo</option>
                  <option value="on_hold">En Pausa</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingProject(null); }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.code}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editingProject ? 'Actualizar' : 'Crear Proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
