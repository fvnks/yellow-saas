'use client';

import { useState, useEffect } from 'react';
import { Clock, User, ArrowRight, ChevronDown } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface ActivityEntry {
  id: string;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_name: string | null;
  old_value: any;
  new_value: any;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  created: 'creo',
  updated: 'actualizo',
  deleted: 'elimino',
  status_changed: 'cambio estado de',
  assigned: 'asigno',
  unassigned: 'desasigno',
  approved: 'aprobo',
  rejected: 'rechazo',
  completed: 'completo',
  reopened: 'reabrio',
};

const entityLabels: Record<string, string> = {
  project: 'proyecto',
  task: 'tarea',
  milestone: 'hito',
  timesheet: 'registro de horas',
  expense: 'gasto',
  document: 'documento',
};

export default function ActivityLog({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const api = getApiClient();

  useEffect(() => { loadActivities(); }, [page]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await api.getProjectActivityLog(projectId, { page, limit });
      setActivities(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `hace ${diffD}d`;
    return d.toLocaleDateString('es-CL');
  };

  const getDiffDisplay = (oldVal: any, newVal: any) => {
    if (!oldVal || !newVal) return null;
    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
    for (const key of allKeys) {
      if (oldVal[key] !== newVal[key] && key !== 'updated_at') {
        changes.push(key);
      }
    }
    return changes.length > 0 ? changes : null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Actividad del Proyecto</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <Clock className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No hay actividad registrada</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <div className="divide-y divide-slate-100">
            {activities.map(a => (
              <div key={a.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700">
                      <span className="font-medium">{a.actor_name || 'Sistema'}</span>
                      {' '}{actionLabels[a.action] || a.action}{' '}
                      <span className="font-medium">{entityLabels[a.entity_type] || a.entity_type}</span>
                      {a.entity_name && <span className="text-slate-500"> "{a.entity_name}"</span>}
                    </p>
                    {a.old_value && a.new_value && (
                      <div className="mt-1 text-[10px] text-slate-400">
                        {getDiffDisplay(a.old_value, a.new_value)?.map(key => (
                          <span key={key} className="inline-flex items-center gap-1 mr-2">
                            {key}: <span className="text-red-400 line-through">{String(a.old_value[key] || '—')}</span>
                            <ArrowRight className="w-2 h-2" />
                            <span className="text-emerald-500">{String(a.new_value[key] || '—')}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{formatTime(a.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50">
            Anterior
          </button>
          <span className="text-xs text-slate-500">Pagina {page} de {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
