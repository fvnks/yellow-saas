'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

export default function ProjectReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getProjectReports();
      setReports(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
    setLoading(false);
  };

  const summary = reports?.summary || {};
  const byStatus = reports?.by_status || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Informes y estadísticas de proyectos</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Proyectos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total_projects || 0}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Activos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.active_projects || 0}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Completados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.completed_projects || 0}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${((summary.total_budget || 0) / 1000000).toFixed(1)}M</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Proyectos por Estado</h3>
            <div className="space-y-3">
              {byStatus.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${item.status === 'active' ? 'bg-indigo-500' : item.status === 'completed' ? 'bg-emerald-500' : item.status === 'planning' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <span className="text-sm text-slate-700 capitalize">{item.status}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Resumen de Presupuesto</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-slate-900 mt-1">${((summary.total_budget || 0) / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Promedio</p>
                <p className="text-lg font-bold text-slate-900 mt-1">${((summary.avg_budget || 0) / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Máximo</p>
                <p className="text-lg font-bold text-slate-900 mt-1">${((summary.max_budget || 0) / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Mínimo</p>
                <p className="text-lg font-bold text-slate-900 mt-1">${((summary.min_budget || 0) / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
