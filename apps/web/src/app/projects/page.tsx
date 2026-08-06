'use client';

import { Suspense, useState, useEffect } from 'react';
import { FolderKanban, Plus, Search, Clock, CheckCircle2, DollarSign, Eye, Trash2, Edit, Users, Bell, AlertTriangle, Calendar, Archive } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import { PROJECT_STATUS_CONFIG } from '@/lib/constants';

const statusConfig = PROJECT_STATUS_CONFIG;

function ProjectDashboardInner() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const [projectsRes, notifRes] = await Promise.all([
        api.getProjects({ limit: 100 }),
        api.getProjectNotifications().catch(() => []),
      ]);
      setProjects(projectsRes.data || []);
      setNotifications(Array.isArray(notifRes) ? notifRes : []);
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

  const activeProjects = projects.filter(p => p.status === 'active' && !p.archived).length;
  const completedProjects = projects.filter(p => p.status === 'completed' && !p.archived).length;
  const archivedProjects = projects.filter(p => p.archived).length;
  const totalBudget = projects.filter(p => !p.archived).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

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
    { id: 'all', label: `Activos (${projects.filter(p => !p.archived).length})` },
    { id: 'active', label: `En Curso (${activeProjects})` },
    { id: 'planning', label: 'Planificacion' },
    { id: 'completed', label: `Completados (${completedProjects})` },
    { id: 'archived', label: `Archivados (${archivedProjects})` },
  ];

  const filteredByTab = (() => {
    let list = filteredProjects;
    if (statusFilter === 'archived') return projects.filter(p => p.archived);
    list = list.filter(p => !p.archived);
    if (statusFilter === 'all') return list;
    return list.filter(p => p.status === statusFilter);
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Panel principal de proyectos y presupuestos</p>
        </div>
        <Link href="/projects/new"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </Link>
      </div>

      {notifications.length > 0 && (
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)}
            className="bg-card border border-border rounded-xl shadow-sm p-4 w-full text-left hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{notifications.length} notificaciones de proyectos</p>
                  <p className="text-xs text-muted-foreground">Tareas atrasadas, hitos vencidos, presupuesto al límite</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {notifications.length}
              </span>
            </div>
          </button>
          {showNotifications && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
              {notifications.slice(0, 8).map((n, i) => (
                <Link key={i} href={`/projects/${n.project_id}`} className="block px-4 py-3 hover:bg-muted border-b border-slate-100 last:border-0 transition-colors">
                  <div className="flex items-start gap-3">
                    {n.severity === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> : <Calendar className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Proyectos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{projects.length}</p>
              <p className="text-xs text-emerald-600 mt-1">{activeProjects} activos</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">En Progreso</p>
              <p className="text-2xl font-bold text-foreground mt-1">{activeProjects}</p>
              <p className="text-xs text-emerald-600 mt-1">{completedProjects} completados</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Presupuesto Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">${(totalBudget / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground mt-1">CLP</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Completados</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completedProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">{projects.length > 0 ? Math.round(completedProjects / projects.length * 100) : 0}% del total</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <ContinuousTabs
          tabs={tabs}
          defaultActiveId={statusFilter}
          onChange={(id) => setStatusFilter(id)}
        />
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
              placeholder="Buscar por nombre, código o cliente..."
            />
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
                <div className="h-2 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredByTab.map(project => (
            <div key={project.id} className={`bg-card border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${project.archived ? 'border-amber-200 bg-amber-50/30 opacity-75' : 'border-border'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusConfig[project.status]?.variant === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : statusConfig[project.status]?.variant === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : statusConfig[project.status]?.variant === 'danger' ? 'bg-rose-50 text-rose-700 border-rose-200' : statusConfig[project.status]?.variant === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-muted text-slate-600 border-border'} border`}>
                      {statusConfig[project.status]?.label || project.status}
                    </span>
                    {project.archived && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <Archive className="w-2.5 h-2.5" /> Archivado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{project.code} {project.customer_name ? `• ${project.customer_name}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/projects/${project.id}`}>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </Link>
                  <Link href={`/projects/${project.id}/edit`}>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Inicio</p>
                  <p className="text-sm font-medium text-foreground mt-1">{project.start_date || '—'}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fin</p>
                  <p className="text-sm font-medium text-foreground mt-1">{project.end_date || '—'}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Presupuesto</p>
                  <p className="text-sm font-medium text-foreground mt-1">${(parseFloat(project.budget) / 1000000).toFixed(1)}M</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tareas</p>
                  <p className="text-sm font-medium text-foreground mt-1">{project.completed_tasks || 0}/{project.task_count || 0}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium text-foreground">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {project.project_manager_name && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs text-slate-600">
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
          <p className="text-sm text-muted-foreground">No se encontraron proyectos</p>
        </div>
      )}
    </div>
  );
}

export default function ProjectDashboardPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-muted-foreground p-6">Cargando...</div>}>
      <ProjectDashboardInner />
    </Suspense>
  );
}
