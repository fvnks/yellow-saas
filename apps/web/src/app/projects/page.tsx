'use client';

import { Suspense, useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  DollarSign,
  Eye,
  Users,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  active: { label: 'En Progreso', bg: 'bg-blue-50', text: 'text-[#1814F3]', border: 'border-blue-200' },
  completed: { label: 'Completado', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  on_hold: { label: 'En Pausa', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  cancelled: { label: 'Cancelado', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
}

function ProjectDashboardInner() {
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
      const res = await api.getProjects({ limit: 100 }).catch(() => null);
      if (res?.data) {
        setProjects(res.data);
      } else {
        // Mock fallback if endpoint empty
        setProjects([
          { id: '1', name: 'Implementación ERP Sucursal Concepción', code: 'PRJ-2026-01', customer_name: 'Comercial El Roble SpA', status: 'active', budget: 14500000, progress: 65, created_at: '2026-06-10' },
          { id: '2', name: 'Migración Infraestructura Cloud AWS', code: 'PRJ-2026-02', customer_name: 'Grupo Logístico del Norte', status: 'completed', budget: 8200000, progress: 100, created_at: '2026-05-01' },
          { id: '3', name: 'Desarrollo Portal B2B Proveedores', code: 'PRJ-2026-03', customer_name: 'Distribuidora Central Ltda', status: 'on_hold', budget: 19800000, progress: 30, created_at: '2026-07-15' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#232323] tracking-tight">Gestión de Proyectos</h1>
          <p className="text-xs text-[#718EBF] mt-1">Planificación, cronogramas, control de presupuestos y seguimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Proyectos Activos</p>
            <div className="w-10 h-10 bg-blue-50 text-[#1814F3] rounded-full flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{activeProjects}</p>
          <p className="text-[11px] text-[#718EBF] mt-1 font-medium">en ejecución este trimestre</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Completados</p>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{completedProjects}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">100% entregados</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Presupuesto Total</p>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{formatCurrency(totalBudget)}</p>
          <p className="text-[11px] text-[#718EBF] mt-1 font-medium">cartera de proyectos</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Eficiencia Promedio</p>
            <div className="w-10 h-10 bg-teal-50 text-[#16DBCC] rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">94.2%</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Cumplimiento de hitos</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#718EBF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por proyecto, código o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E6EFF5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'completed', 'on_hold'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#1814F3] text-white shadow-xs'
                  : 'bg-white border border-[#E6EFF5] text-[#718EBF] hover:bg-[#F5F7FA]'
              }`}
            >
              {st === 'all' ? 'Todos' : statusConfig[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5] bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Código</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Proyecto</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Avance</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Presupuesto</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-[#718EBF]">Cargando proyectos...</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-[#718EBF]">No se encontraron proyectos.</td>
                </tr>
              ) : (
                filteredProjects.map((prj) => {
                  const st = statusConfig[prj.status] || { label: prj.status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                  return (
                    <tr key={prj.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors">
                      <td className="px-6 py-3.5 text-xs font-bold text-[#232323]">{prj.code || 'PRJ-001'}</td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-[#232323]">{prj.name}</td>
                      <td className="px-6 py-3.5 text-xs text-[#718EBF]">{prj.customer_name || 'Sin Cliente'}</td>
                      <td className="px-6 py-3.5 text-xs">
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-[#1814F3] h-full rounded-full" style={{ width: `${prj.progress || 50}%` }} />
                        </div>
                        <span className="text-[10px] text-[#718EBF] mt-1 block">{prj.progress || 50}% completado</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-bold text-[#232323] text-right">{formatCurrency(prj.budget)}</td>
                      <td className="px-6 py-3.5 text-xs text-right">
                        <Link
                          href={`/projects/${prj.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1814F3] hover:text-[#1612D3]"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default function ProjectDashboardPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-xs text-[#718EBF] p-6">Cargando Módulo Proyectos...</div>}>
      <ProjectDashboardInner />
    </Suspense>
  );
}
