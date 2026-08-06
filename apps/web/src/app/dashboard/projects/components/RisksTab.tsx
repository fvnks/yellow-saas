'use client';

import { useState } from 'react';
import { Badge } from '@yellow-erp/ui';
import { AlertTriangle, Plus, Edit, Trash2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Risk {
  id: string;
  name: string;
  description: string | null;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'open' | 'mitigating' | 'closed' | 'realized';
  mitigation_plan: string | null;
  owner_name: string | null;
  identified_date: string | null;
  resolved_date: string | null;
}

const probLabels = { low: 'Baja', medium: 'Media', high: 'Alta' };
const impactLabels = { low: 'Bajo', medium: 'Medio', high: 'Alto' };
const statusLabels = { open: 'Abierto', mitigating: 'Mitigando', closed: 'Cerrado', realized: 'Materializado' };
const statusVariants: Record<string, string> = { open: 'warning', mitigating: 'info', closed: 'success', realized: 'danger' };

const getRiskLevel = (prob: string, imp: string) => {
  const score = (prob === 'high' ? 3 : prob === 'medium' ? 2 : 1) * (imp === 'high' ? 3 : imp === 'medium' ? 2 : 1);
  if (score >= 6) return { label: 'Alto', color: 'text-red-600 bg-red-50 border-red-200' };
  if (score >= 3) return { label: 'Medio', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { label: 'Bajo', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
};

export default function RisksTab({ projectId, risks, employees, onRefresh }: {
  projectId: string; risks: Risk[]; employees: any[]; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Risk | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', probability: 'medium', impact: 'medium',
    mitigation_plan: '', owner_id: '', identified_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const api = getApiClient();

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', probability: 'medium', impact: 'medium', mitigation_plan: '', owner_id: '', identified_date: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const openEdit = (r: Risk) => {
    setEditing(r);
    setForm({
      name: r.name, description: r.description || '', probability: r.probability, impact: r.impact,
      mitigation_plan: r.mitigation_plan || '', owner_id: '', identified_date: r.identified_date || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const data = { ...form, owner_id: form.owner_id || null };
      if (editing) {
        await api.updateProjectRisk(projectId, editing.id, data);
      } else {
        await api.createProjectRisk(projectId, data);
      }
      setShowForm(false); setEditing(null); onRefresh();
    } catch (err) { toast.error('Error al crear riesgo'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este riesgo?')) return;
    try {
      await api.deleteProjectRisk(projectId, id);
      onRefresh();
    } catch (err) { toast.error('Error al eliminar riesgo'); }
  };

  const handleStatusChange = async (risk: Risk, newStatus: string) => {
    try {
      await api.updateProjectRisk(projectId, risk.id, {
        status: newStatus, resolved_date: newStatus === 'closed' ? new Date().toISOString().split('T')[0] : null
      });
      onRefresh();
    } catch (err) { toast.error('Error al actualizar riesgo'); }
  };

  const openCount = risks.filter(r => r.status === 'open').length;
  const mitigatingCount = risks.filter(r => r.status === 'mitigating').length;
  const highRiskCount = risks.filter(r => r.probability === 'high' && r.impact === 'high' && r.status !== 'closed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Gestion de Riesgos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {openCount} abiertos · {mitigatingCount} mitigando
            {highRiskCount > 0 && <span className="ml-2 text-red-600 font-medium">· {highRiskCount} de alto riesgo</span>}
          </p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Riesgo
        </button>
      </div>

      {risks.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <Shield className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay riesgos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map(r => {
            const level = getRiskLevel(r.probability, r.impact);
            return (
              <div key={r.id} className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">{r.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${level.color}`}>
                        Riesgo {level.label}
                      </span>
                      <Badge variant={statusVariants[r.status] as any}>{statusLabels[r.status]}</Badge>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>Prob: {probLabels[r.probability]}</span>
                      <span>Impacto: {impactLabels[r.impact]}</span>
                      {r.owner_name && <span>Responsable: {r.owner_name}</span>}
                      {r.identified_date && <span>Identificado: {new Date(r.identified_date).toLocaleDateString('es-CL')}</span>}
                    </div>
                    {r.mitigation_plan && (
                      <div className="mt-2 p-2 bg-muted rounded-lg">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Plan de mitigacion</p>
                        <p className="text-xs text-slate-600 mt-0.5">{r.mitigation_plan}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {r.status === 'open' && (
                      <button onClick={() => handleStatusChange(r, 'mitigating')} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Mitigar">
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                    )}
                    {(r.status === 'open' || r.status === 'mitigating') && (
                      <button onClick={() => handleStatusChange(r, 'closed')} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="Cerrar">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </button>
                    )}
                    <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primarylg mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar Riesgo' : 'Nuevo Riesgo'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  placeholder="Descripcion del riesgo" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Probabilidad</label>
                  <select value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Impacto</label>
                  <select value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Plan de Mitigacion</label>
                <textarea value={form.mitigation_plan} onChange={e => setForm({ ...form, mitigation_plan: e.target.value })} rows={2}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  placeholder="Acciones para mitigar el riesgo..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
