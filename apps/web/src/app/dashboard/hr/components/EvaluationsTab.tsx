'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Input } from '@yellow-erp/ui';
import { Plus, Search, BarChart3, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Evaluation {
  id: string;
  employee_name: string;
  employee_rut: string;
  evaluator_name: string;
  period: string;
  overall_score: number;
  competencies_score: number;
  goals_score: number;
  comments: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  completed: { label: 'Completada', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
};

function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-emerald-600';
  if (score >= 3.5) return 'text-blue-600';
  if (score >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

export default function EvaluationsTab() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employee_id: '', period: '', overall_score: '', competencies_score: '', goals_score: '', comments: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const [evalRes, empRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/hr/evaluations`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/companies/' + localStorage.getItem('company_id') + '/employees?limit=200').then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setEvaluations(evalRes.data || []);
      setEmployees(empRes.data || []);
    } catch { toast.error('Error al cargar evaluaciones'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.employee_id || !form.period) { toast.error('Empleado y período son requeridos'); return; }
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/hr/evaluations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, overall_score: parseFloat(form.overall_score) || 0, competencies_score: parseFloat(form.competencies_score) || 0, goals_score: parseFloat(form.goals_score) || 0 }),
      });
      setShowForm(false);
      setForm({ employee_id: '', period: '', overall_score: '', competencies_score: '', goals_score: '', comments: '' });
      loadData(); toast.success('Evaluación creada');
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const filtered = evaluations.filter(e =>
    e.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.period?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Buscar evaluación..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" icon={Search} />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Evaluación
        </Button>
      </div>

      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-slate-900">Nueva Evaluación de Desempeño</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar empleado...</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
            <Input label="Período" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="Ej: 2026-Q1" />
            <Input label="Score General (1-5)" type="number" min="1" max="5" step="0.1" value={form.overall_score} onChange={e => setForm({ ...form, overall_score: e.target.value })} />
            <Input label="Competencias (1-5)" type="number" min="1" max="5" step="0.1" value={form.competencies_score} onChange={e => setForm({ ...form, competencies_score: e.target.value })} />
            <Input label="Metas (1-5)" type="number" min="1" max="5" step="0.1" value={form.goals_score} onChange={e => setForm({ ...form, goals_score: e.target.value })} />
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Comentarios</label>
              <textarea value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm h-[38px] resize-none" placeholder="Observaciones..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Período</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">General</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Competencias</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Metas</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-slate-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-slate-400">Sin evaluaciones registradas</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-900">{e.employee_name}</p>
                    <p className="text-[10px] text-slate-400">{e.employee_rut}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{e.period}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${getScoreColor(e.overall_score)}`}>{e.overall_score?.toFixed(1) || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${getScoreColor(e.competencies_score)}`}>{e.competencies_score?.toFixed(1) || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${getScoreColor(e.goals_score)}`}>{e.goals_score?.toFixed(1) || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[e.status]?.variant || 'neutral'}>
                      {statusConfig[e.status]?.label || e.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.created_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
