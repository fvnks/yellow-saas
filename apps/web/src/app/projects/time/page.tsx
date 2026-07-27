'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, Search } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

export default function ProjectTimePage() {
  const [timers, setTimers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

      const allTimers: any[] = [];
      for (const project of projectsList.slice(0, 10)) {
        try {
          const timersRes = await api.getProjectTimers(project.id);
          if (Array.isArray(timersRes)) {
            timersRes.forEach((t: any) => allTimers.push({ ...t, project_name: project.name }));
          }
        } catch {}
      }
      setTimers(allTimers);
    } catch (err) {
      console.error('Failed to load timers:', err);
    }
    setLoading(false);
  };

  const filteredTimers = timers.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeTimers = timers.filter(t => !t.end_time);
  const totalHours = timers.reduce((sum, t) => sum + (t.hours || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registro de Tiempo</h1>
          <p className="text-sm text-slate-500 mt-1">Control de tiempo por proyecto</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Timer Activo</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeTimers.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Horas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Registros</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{timers.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Pause className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
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
              placeholder="Buscar por descripción, proyecto o empleado..."
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyecto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimers.map((timer, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{timer.employee_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{timer.project_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{timer.description || '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{timer.hours?.toFixed(1) || '0.0'}h</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${!timer.end_time ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {!timer.end_time ? 'Activo' : 'Completado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredTimers.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron registros de tiempo</p>
        </div>
      )}
    </div>
  );
}
