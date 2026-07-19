'use client';

import { useState } from 'react';
import { Badge } from '@yellow-erp/ui';
import { Flag, Plus, Check, Trash2, Calendar } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  due_date: string;
  status: string;
  completed_at: string | null;
}

const milestoneStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: 'Pendiente', variant: 'info' },
  completed: { label: 'Completado', variant: 'success' },
  overdue: { label: 'Vencido', variant: 'danger' },
};

export default function MilestonesTab({ projectId, milestones, onRefresh }: { projectId: string; milestones: Milestone[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', due_date: '' });
  const [saving, setSaving] = useState(false);

  const api = getApiClient();

  const handleCreate = async () => {
    if (!form.name || !form.due_date) return;
    setSaving(true);
    try {
      await api.createProjectMilestone(projectId, form);
      setShowForm(false);
      setForm({ name: '', description: '', due_date: '' });
      onRefresh();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleComplete = async (m: Milestone) => {
    try {
      await api.updateProjectMilestone(projectId, m.id, { ...m, status: 'completed' });
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este hito?')) return;
    try {
      await api.deleteProjectMilestone(projectId, id);
      onRefresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Hitos del Proyecto</h3>
        <button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Hito
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Flag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay hitos definidos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map(m => {
            const isOverdue = m.status === 'pending' && new Date(m.due_date) < new Date();
            return (
              <div key={m.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.status === 'completed' ? 'bg-emerald-50' : isOverdue ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <Flag className={`w-5 h-5 ${m.status === 'completed' ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold ${m.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{m.name}</h4>
                      <Badge variant={isOverdue ? 'danger' : milestoneStatusConfig[m.status]?.variant || 'neutral'}>
                        {isOverdue ? 'Vencido' : milestoneStatusConfig[m.status]?.label}
                      </Badge>
                    </div>
                    {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.due_date).toLocaleDateString('es-CL')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {m.status === 'pending' && (
                    <button onClick={() => handleComplete(m)} className="p-2 hover:bg-emerald-50 rounded-lg transition-colors" title="Marcar completado">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(m.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nuevo Hito</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Fecha Limite *</label>
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !form.name || !form.due_date}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear Hito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
