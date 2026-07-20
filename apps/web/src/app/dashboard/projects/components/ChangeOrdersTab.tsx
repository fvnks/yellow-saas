'use client';

import { useState } from 'react';
import { Badge } from '@yellow-erp/ui';
import { GitPullRequest, Plus, Edit, Trash2, Check, X, DollarSign, Clock } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface ChangeOrder {
  id: string;
  order_number: number;
  title: string;
  description: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  type: 'scope' | 'timeline' | 'budget' | 'resource' | 'other';
  budget_impact: number;
  timeline_impact_days: number;
  requested_by: string | null;
  reviewer_name: string | null;
  review_notes: string | null;
  created_at: string;
}

const typeLabels = { scope: 'Alcance', timeline: 'Plazo', budget: 'Presupuesto', resource: 'Recurso', other: 'Otro' };
const statusLabels = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', implemented: 'Implementado' };
const statusVariants: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'danger', implemented: 'info' };

export default function ChangeOrdersTab({ projectId, changeOrders, onRefresh }: {
  projectId: string; changeOrders: ChangeOrder[]; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChangeOrder | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', reason: '', type: 'scope',
    budget_impact: '', timeline_impact_days: '', requested_by: '',
  });
  const [saving, setSaving] = useState(false);
  const api = getApiClient();

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', reason: '', type: 'scope', budget_impact: '', timeline_impact_days: '', requested_by: '' });
    setShowForm(true);
  };

  const openEdit = (co: ChangeOrder) => {
    setEditing(co);
    setForm({
      title: co.title, description: co.description || '', reason: co.reason || '', type: co.type,
      budget_impact: String(co.budget_impact || ''), timeline_impact_days: String(co.timeline_impact_days || ''),
      requested_by: co.requested_by || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        budget_impact: form.budget_impact ? parseFloat(form.budget_impact) : 0,
        timeline_impact_days: form.timeline_impact_days ? parseInt(form.timeline_impact_days) : 0,
      };
      if (editing) {
        await api.updateProjectChangeOrder(projectId, editing.id, data);
      } else {
        await api.createProjectChangeOrder(projectId, data);
      }
      setShowForm(false); setEditing(null); onRefresh();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta orden de cambio?')) return;
    try { await api.deleteProjectChangeOrder(projectId, id); onRefresh(); } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (co: ChangeOrder, newStatus: string) => {
    try {
      await api.updateProjectChangeOrder(projectId, co.id, { status: newStatus });
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const pendingCount = changeOrders.filter(co => co.status === 'pending').length;
  const approvedCount = changeOrders.filter(co => co.status === 'approved').length;
  const totalBudgetImpact = changeOrders.filter(co => co.status === 'approved').reduce((s, co) => s + (Number(co.budget_impact) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Ordenes de Cambio</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {pendingCount} pendientes · {approvedCount} aprobadas
            {totalBudgetImpact !== 0 && <span className="ml-2">· Impacto: ${totalBudgetImpact.toLocaleString('es-CL')}</span>}
          </p>
        </div>
        <button onClick={openCreate} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Orden
        </button>
      </div>

      {changeOrders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
          <GitPullRequest className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay ordenes de cambio</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Titulo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Impacto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map(co => (
                <tr key={co.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">CO-{co.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-900">{co.title}</p>
                    {co.description && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{co.description}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge variant="neutral">{typeLabels[co.type]}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusVariants[co.status] as any}>{statusLabels[co.status]}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3 text-[10px]">
                      {Number(co.budget_impact) !== 0 && (
                        <span className={`flex items-center gap-0.5 ${Number(co.budget_impact) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          <DollarSign className="w-2.5 h-2.5" />
                          {Number(co.budget_impact) > 0 ? '+' : ''}{Number(co.budget_impact).toLocaleString('es-CL')}
                        </span>
                      )}
                      {co.timeline_impact_days !== 0 && (
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Clock className="w-2.5 h-2.5" />
                          {co.timeline_impact_days > 0 ? '+' : ''}{co.timeline_impact_days}d
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {co.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusChange(co, 'approved')} className="p-1 hover:bg-emerald-50 rounded-lg transition-colors" title="Aprobar">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          </button>
                          <button onClick={() => handleStatusChange(co, 'rejected')} className="p-1 hover:bg-red-50 rounded-lg transition-colors" title="Rechazar">
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </>
                      )}
                      {co.status === 'approved' && (
                        <button onClick={() => handleStatusChange(co, 'implemented')} className="p-1 hover:bg-blue-50 rounded-lg transition-colors" title="Implementar">
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                      )}
                      <button onClick={() => openEdit(co)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(co.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Editar Orden' : 'Nueva Orden de Cambio'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Titulo *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Descripcion del cambio" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="scope">Alcance</option>
                    <option value="timeline">Plazo</option>
                    <option value="budget">Presupuesto</option>
                    <option value="resource">Recurso</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Solicitado por</label>
                  <input type="text" value={form.requested_by} onChange={e => setForm({ ...form, requested_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nombre" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Razon del cambio</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Por que es necesario este cambio?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Impacto Presupuesto (CLP)</label>
                  <input type="number" value={form.budget_impact} onChange={e => setForm({ ...form, budget_impact: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Impacto Plazo (dias)</label>
                  <input type="number" value={form.timeline_impact_days} onChange={e => setForm({ ...form, timeline_impact_days: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
