'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, FileText, AlertCircle, ExternalLink } from 'lucide-react';

export default function PortalPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => { setError('Error al cargar'); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4" />
        <div className="h-4 bg-slate-200 rounded w-48 mx-auto" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Proyecto no encontrado</h1>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
      </div>
    </div>
  );

  const { project, summary, milestones, tasks, documents, change_orders, costs } = data;

  const statusConfig: Record<string, { label: string; color: string }> = {
    planning: { label: 'Planificacion', color: 'bg-slate-100 text-slate-700' },
    active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
    on_hold: { label: 'En Pausa', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  };

  const coStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    implemented: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <p className="text-sm text-slate-500 mt-1">{project.code}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[project.status]?.color || 'bg-slate-100 text-slate-700'}`}>
              {statusConfig[project.status]?.label || project.status}
            </span>
          </div>
          {project.description && <p className="text-sm text-slate-600 mt-4">{project.description}</p>}

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Progreso</p>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
              </div>
              <p className="text-xs text-slate-600 mt-1">{project.progress || 0}%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Tareas</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{summary.done_tasks}/{summary.total_tasks}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Hitos</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{summary.done_milestones}/{summary.total_milestones}</p>
            </div>
            {project.budget && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Presupuesto</p>
                <p className="text-lg font-bold text-slate-900 mt-1">${Number(project.budget).toLocaleString('es-CL')}</p>
              </div>
            )}
          </div>

          {project.start_date && (
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Inicio: {new Date(project.start_date).toLocaleDateString('es-CL')}</span>
              {project.end_date && <span>Fin: {new Date(project.end_date).toLocaleDateString('es-CL')}</span>}
            </div>
          )}
        </div>

        {milestones.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Hitos</h2>
            <div className="space-y-3">
              {milestones.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  {m.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-900">{m.name}</p>
                    {m.description && <p className="text-[10px] text-slate-500">{m.description}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(m.due_date).toLocaleDateString('es-CL')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {documents.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Documentos</h2>
            <div className="space-y-2">
              {documents.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-900 flex-1">{d.name}</span>
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {change_orders.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Ordenes de Cambio</h2>
            <div className="space-y-2">
              {change_orders.map((co: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs font-mono text-slate-500">CO-{co.order_number}</span>
                  <span className="text-xs text-slate-900 flex-1">{co.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${coStatusColors[co.status] || 'bg-slate-100 text-slate-700'}`}>
                    {co.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-400 mt-8">
          Portal de proyecto generado por Yellow ERP
        </div>
      </div>
    </div>
  );
}
