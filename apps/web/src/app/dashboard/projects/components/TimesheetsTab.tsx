'use client';

import { useState } from 'react';
import { Badge } from '@yellow-erp/ui';
import { Clock, Plus, Trash2, Check, Filter } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface Timesheet {
  id: string;
  date: string;
  hours: number;
  description: string | null;
  employee_name: string | null;
  task_name: string | null;
  billable: boolean;
  approved: boolean;
}

export default function TimesheetsTab({ projectId, timesheets, tasks, employees, onRefresh }: {
  projectId: string; timesheets: Timesheet[]; tasks: any[]; employees: any[]; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_id: '', task_id: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', billable: true });
  const [saving, setSaving] = useState(false);
  const [weekFilter, setWeekFilter] = useState(false);

  const api = getApiClient();

  const handleCreate = async () => {
    if (!form.date || !form.hours) return;
    setSaving(true);
    try {
      await api.createProjectTimesheet(projectId, { ...form, hours: parseFloat(form.hours), employee_id: form.employee_id || null, task_id: form.task_id || null });
      setShowForm(false);
      setForm({ employee_id: '', task_id: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', billable: true });
      onRefresh();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este registro?')) return;
    try { await api.deleteProjectTimesheet(projectId, id); onRefresh(); } catch (err) { console.error(err); }
  };

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const filtered = weekFilter
    ? timesheets.filter(t => { const d = new Date(t.date); return d >= weekStart && d <= weekEnd; })
    : timesheets;

  const totalHours = filtered.reduce((s, t) => s + Number(t.hours), 0);
  const billableHours = filtered.filter(t => t.billable).reduce((s, t) => s + Number(t.hours), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Control de Horas</h3>
          <p className="text-xs text-slate-500 mt-0.5">{totalHours.toFixed(1)}h total · {billableHours.toFixed(1)}h facturables</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekFilter(!weekFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${weekFilter ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <Filter className="w-3 h-3 mr-1 inline" /> Esta semana
          </button>
          <button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Registrar Horas
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay registros de horas</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tarea</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horas</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-700">{new Date(t.date).toLocaleDateString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{t.employee_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{t.task_name || '—'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{Number(t.hours).toFixed(1)}h</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{t.description || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.billable ? 'success' : 'neutral'}>{t.billable ? 'Facturable' : 'No fact.'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Registrar Horas</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fecha *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Horas *</label>
                  <input type="number" step="0.5" min="0.5" max="24" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Empleado</label>
                  <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin asignar</option>
                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name || e.first_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Tarea</label>
                  <select value={form.task_id} onChange={e => setForm({ ...form, task_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Sin tarea</option>
                    {tasks.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="billable" checked={form.billable} onChange={e => setForm({ ...form, billable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <label htmlFor="billable" className="text-sm text-slate-700">Horas facturables</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !form.date || !form.hours}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
