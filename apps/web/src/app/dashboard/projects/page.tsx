'use client';

import { useState, useEffect } from 'react';
import { Badge, KPICard } from '@yellow-erp/ui';
import { FolderKanban, Plus, Search, Clock, CheckCircle2, DollarSign, Eye, Trash2, Edit, Users } from 'lucide-react';
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

export default function ProjectsPage() {
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
      setProjects(projectsRes.data || []);
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
        <Link href="/dashboard/projects/new"
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </Link>
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
                  <Link href={`/dashboard/projects/${project.id}/edit`}>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-slate-500" />
                    </button>
                  </Link>
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
    </div>
  );
}

