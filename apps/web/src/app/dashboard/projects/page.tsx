'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, KPICard } from '@yellow-erp/ui';
import { FolderKanban, Plus, Search, Calendar, Users, Clock, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../lib/api-client';

const mockProjects = [
  { id: 'PRJ-001', name: 'Implementación ERP Cliente A', client: 'Empresa Norte SpA', status: 'in_progress', progress: 65, startDate: '2026-04-01', endDate: '2026-08-30', budget: 15000000, spent: 9750000, team: ['Juan Pérez', 'María López'] },
  { id: 'PRJ-002', name: 'Desarrollo App Móvil', client: 'TechStart Ltda', status: 'in_progress', progress: 40, startDate: '2026-05-15', endDate: '2026-11-30', budget: 25000000, spent: 10000000, team: ['Carlos Muñoz'] },
  { id: 'PRJ-003', name: 'Migración Sistema Legacy', client: 'Distribuidora Sur', status: 'planning', progress: 10, startDate: '2026-07-01', endDate: '2026-12-31', budget: 8000000, spent: 800000, team: ['Ana García', 'Pedro Soto', 'Laura Díaz'] },
  { id: 'PRJ-004', name: 'Capacitación Usuarios', client: 'Almacenes Centro', status: 'completed', progress: 100, startDate: '2026-03-01', endDate: '2026-05-30', budget: 3500000, spent: 3200000, team: ['María López'] },
  { id: 'PRJ-005', name: 'Integración Pasarela de Pago', client: 'E-Commerce SpA', status: 'on_hold', progress: 25, startDate: '2026-06-01', endDate: '2026-09-30', budget: 6000000, spent: 1500000, team: ['Carlos Muñoz', 'Juan Pérez'] },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  planning: { label: 'Planificación', variant: 'info' },
  in_progress: { label: 'En Progreso', variant: 'success' },
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
  const [projects, setProjects] = useState(mockProjects);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient('demo-company-id');
    // No dedicated projects API yet — fall back to mock data
    // When endpoint is available, replace with: api.projects.list()
    setLoading(false);
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de proyectos y presupuestos</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Proyectos" value={projects.length} icon={FolderKanban} trend="+2 este mes" trendUp={true} />
        <KPICard label="En Progreso" value={activeProjects} icon={Clock} trend={`${Math.round(activeProjects/projects.length*100)}% del total`} trendUp={true} />
        <KPICard label="Presupuesto Total" value={`$${(totalBudget/1000000).toFixed(1)}M`} icon={BarChart3} trend="CLP" trendUp={true} />
        <KPICard label="Ejecutado" value={`${Math.round(totalSpent/totalBudget*100)}%`} icon={CheckCircle2} trend={`$${(totalSpent/1000000).toFixed(1)}M gastado`} trendUp={true} />
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
              placeholder="Buscar por nombre, cliente o código..."
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'planning', label: 'Planificación' },
              { value: 'in_progress', label: 'En Progreso' },
              { value: 'on_hold', label: 'En Pausa' },
              { value: 'completed', label: 'Completado' },
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                  <Badge variant={statusConfig[project.status]?.variant || 'neutral'}>{statusConfig[project.status]?.label || project.status}</Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1">{project.id} · {project.client}</p>
              </div>
              <Button variant="secondary" size="sm">Ver Detalles</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Inicio</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{project.startDate}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fin</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{project.endDate}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto</p>
                <p className="text-sm font-medium text-slate-900 mt-1">${(project.budget/1000000).toFixed(1)}M</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Equipo</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{project.team.length} personas</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Progreso</span>
                <span className="font-medium text-slate-900">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              {project.team.slice(0, 3).map((member, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                  <Users className="w-3 h-3" />
                  {member}
                </div>
              ))}
              {project.team.length > 3 && (
                <span className="text-xs text-slate-400">+{project.team.length - 3} más</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron proyectos</p>
        </div>
      )}
    </div>
  );
}
