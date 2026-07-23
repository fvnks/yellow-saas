'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, ZapOff, Play } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_value: string;
  action_type: string;
  action_config: any;
  is_active: boolean;
  last_triggered_at: string;
  trigger_count: number;
}

interface AutomationManagerProps {
  projectId: string;
}

const triggerLabels: Record<string, string> = {
  status_change: 'Cambio de estado',
  task_completed: 'Tarea completada',
  milestone_reached: 'Hito alcanzado',
  due_date_passed: 'Fecha límite pasada',
};

const actionLabels: Record<string, string> = {
  create_task: 'Crear tarea',
  assign_task: 'Asignar tarea',
  change_status: 'Cambiar estado',
  send_notification: 'Enviar notificación',
  update_field: 'Actualizar campo',
};

export default function AutomationManager({ projectId }: AutomationManagerProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', trigger_type: 'status_change', trigger_value: '', action_type: 'create_task',
    action_config: '{}',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRules(); }, [projectId]);

  const loadRules = async () => {
    try {
      const api = getApiClient();
      const res = await api.getAutomationRules(projectId);
      setRules(Array.isArray(res) ? res : []);
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.createAutomationRule(projectId, {
        name: form.name,
        trigger_type: form.trigger_type,
        trigger_value: form.trigger_value || null,
        action_type: form.action_type,
        action_config: JSON.parse(form.action_config),
      });
      setShowCreate(false);
      setForm({ name: '', trigger_type: 'status_change', trigger_value: '', action_type: 'create_task', action_config: '{}' });
      loadRules();
      toast.success('Regla creada');
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear regla');
    }
    setSaving(false);
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      const api = getApiClient();
      await api.toggleAutomationRule(projectId, rule.id, !rule.is_active);
      loadRules();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Eliminar esta regla?')) return;
    try {
      const api = getApiClient();
      await api.deleteAutomationRule(projectId, ruleId);
      loadRules();
      toast.success('Regla eliminada');
    } catch { toast.error('Error'); }
  };

  const getPresetConfig = (actionType: string): string => {
    switch (actionType) {
      case 'create_task': return JSON.stringify({ name: 'Nueva tarea automática', priority: 'medium' }, null, 2);
      case 'change_status': return JSON.stringify({ new_status: 'in_progress' }, null, 2);
      case 'send_notification': return JSON.stringify({ title: 'Notificación', message: 'Evento detectado' }, null, 2);
      default: return '{}';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Automatización</h3>
          <span className="text-[10px] text-slate-400">{rules.length} reglas</span>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Regla
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800 space-y-3">
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nombre de la regla..." />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Cuando...</label>
              <select value={form.trigger_type} onChange={e => setForm({ ...form, trigger_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {(form.trigger_type === 'status_change') && (
                <select value={form.trigger_value} onChange={e => setForm({ ...form, trigger_value: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Cualquier estado</option>
                  <option value="todo">Por Hacer</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="review">En Revisión</option>
                  <option value="done">Completada</option>
                </select>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Entonces...</label>
              <select value={form.action_type} onChange={e => setForm({ ...form, action_type: e.target.value, action_config: getPresetConfig(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase">Configuración (JSON)</label>
            <textarea value={form.action_config} onChange={e => setForm({ ...form, action_config: e.target.value })} rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">Cancelar</button>
            <button onClick={handleCreate} disabled={saving || !form.name}
              className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear Regla'}
            </button>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="text-center py-8 bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <Zap className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Sin reglas de automatización</p>
          <p className="text-[10px] text-slate-400 mt-1">Crea reglas para automatizar flujos de trabajo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className={`bg-white border rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 transition-shadow ${rule.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rule.is_active ? 'bg-amber-50' : 'bg-slate-100'}`}>
                    {rule.is_active ? <Zap className="w-4 h-4 text-amber-500" /> : <ZapOff className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{rule.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {triggerLabels[rule.trigger_type]}{rule.trigger_value ? ` → ${rule.trigger_value}` : ''} → {actionLabels[rule.action_type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{rule.trigger_count}x ejecutado</span>
                  <button onClick={() => handleToggle(rule)}
                    className={`p-1.5 rounded-lg transition-colors ${rule.is_active ? 'hover:bg-amber-50' : 'hover:bg-slate-100'}`}>
                    {rule.is_active ? <Zap className="w-3.5 h-3.5 text-amber-500" /> : <ZapOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
