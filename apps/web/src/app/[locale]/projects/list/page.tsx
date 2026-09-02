'use client';

import { useState, useEffect } from 'react';
import { FolderKanban, Plus, Search, Eye, Trash2, Edit, Archive } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import { PROJECT_STATUS_CONFIG } from '@/lib/constants';

const statusConfig = PROJECT_STATUS_CONFIG;

export default function ProjectListPage() {
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
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Activos' },
    { id: 'planning', label: 'Planificación' },
    { id: 'completed', label: 'Completados' },
    { id: 'archived', label: 'Archivados' },
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
          <h1 className="text-xl font-bold text-foreground">Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Listado completo de proyectos</p>
        </div>
        <Link href="/projects/new"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </Link>
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
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
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
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Inicio</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fin</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Progreso</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredByTab.map(project => (
                  <tr key={project.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{project.code}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusConfig[project.status]?.variant === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : statusConfig[project.status]?.variant === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : statusConfig[project.status]?.variant === 'danger' ? 'bg-rose-50 text-rose-700 border-rose-200' : statusConfig[project.status]?.variant === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-muted text-foreground border-border'} border`}>
                        {statusConfig[project.status]?.label || project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{project.start_date || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{project.end_date || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </Link>
                        <Link href={`/projects/${project.id}/edit`}>
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(project.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredByTab.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No se encontraron proyectos</p>
        </div>
      )}
    </div>
  );
}
