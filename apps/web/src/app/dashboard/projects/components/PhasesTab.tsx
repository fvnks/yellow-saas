'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Phase {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  sort_order: number;
  status: string;
}

interface PhasesTabProps {
  projectId: string;
  phases: Phase[];
  onRefresh: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-muted text-foreground border-border' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelada', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function PhasesTab({ projectId, phases, onRefresh }: PhasesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [form, setForm] = useState({ name: '', description: '', budget: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const data = { ...form, budget: parseFloat(form.budget) || 0 };
      if (editingPhase) {
        await api.updateProjectPhase(projectId, editingPhase.id, data);
      } else {
        await api.createProjectPhase(projectId, data);
      }
      setShowForm(false);
      setEditingPhase(null);
      setForm({ name: '', description: '', budget: '', start_date: '', end_date: '' });
      onRefresh();
      toast.success(editingPhase ? 'Fase actualizada' : 'Fase creada');
    } catch (err) {
      toast.error('Error al guardar fase');
    }
    setSaving(false);
  };

  const handleEdit = (phase: Phase) => {
    setForm({
      name: phase.name, description: phase.description || '', budget: String(phase.budget || ''),
      start_date: phase.start_date || '', end_date: phase.end_date || '',
    });
    setEditingPhase(phase);
    setShowForm(true);
  };

  const handleDelete = async (phaseId: string) => {
    if (!confirm('Eliminar esta fase?')) return;
    try {
      const api = getApiClient();
      await api.deleteProjectPhase(projectId, phaseId);
      onRefresh();
      toast.success('Fase eliminada');
    } catch (err) {
      toast.error('Error al eliminar fase');
    }
  };

  const totalBudget = phases.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = phases.reduce((sum, p) => sum + (p.spent || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Fases del Proyecto</h3>
        <button onClick={() => { setShowForm(true); setEditingPhase(null); setForm({ name: '', description: '', budget: '', start_date: '', end_date: '' }); }}
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Fase
        </button>
      </div>

      {phases.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-foreground">Resumen Presupuesto</span>
            <span className="text-xs text-muted-foreground">{phases.length} fases</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Gastado: ${totalSpent.toLocaleString()}</span>
            <span>Presupuesto: ${totalBudget.toLocaleString()}</span>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Ej: Fase 1 - Planificacion" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Descripcion</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Descripcion..." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Presupuesto</label>
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Fecha Inicio</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Fecha Fin</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setEditingPhase(null); }} className="px-3 py-1.5 text-xs text-foreground hover:text-foreground">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !form.name}
              className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : editingPhase ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {phases.length === 0 ? (
        <div className="text-center py-8 bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <DollarSign className="w-10 h-10 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No hay fases definidas</p>
          <p className="text-[10px] text-muted-foreground mt-1">Divide el proyecto en fases para mejor control presupuestario</p>
        </div>
      ) : (
        <div className="space-y-2">
          {phases.map(phase => {
            const usage = phase.budget > 0 ? Math.round((phase.spent / phase.budget) * 100) : 0;
            return (
              <div key={phase.id} className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{phase.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusConfig[phase.status]?.color || 'bg-muted text-foreground border-border'}`}>
                        {statusConfig[phase.status]?.label || phase.status}
                      </span>
                    </div>
                    {phase.description && <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>${(phase.budget || 0).toLocaleString()} presupuesto</span>
                      <span>${(phase.spent || 0).toLocaleString()} gastado</span>
                      <span>{usage}%</span>
                      {phase.start_date && <span>{phase.start_date} - {phase.end_date || '...'}</span>}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div className={`h-1.5 rounded-full transition-all ${usage > 90 ? 'bg-red-500' : usage > 70 ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(usage, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(phase)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(phase.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
