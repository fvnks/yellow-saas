'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Input } from '@yellow-erp/ui';
import { Plus, Search, UserPlus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Onboarding {
  id: string;
  employee_name: string;
  employee_rut: string;
  start_date: string;
  end_date: string | null;
  status: string;
  progress: number;
  tasks_total: number;
  tasks_completed: number;
  mentor_name: string;
  notes: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: 'Pendiente', variant: 'neutral' },
  in_progress: { label: 'En Progreso', variant: 'warning' },
  completed: { label: 'Completado', variant: 'success' },
  dropped: { label: 'Abandonado', variant: 'danger' },
};

export default function OnboardingTab() {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employee_id: '', start_date: '', mentor_name: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const [onbRes, empRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/hr/onboarding`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/companies/' + localStorage.getItem('company_id') + '/employees?limit=200').then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setOnboardings(onbRes.data || []);
      setEmployees(empRes.data || []);
    } catch { toast.error('Error al cargar onboardings'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.employee_id || !form.start_date) { toast.error('Empleado y fecha son requeridos'); return; }
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/hr/onboarding`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ employee_id: '', start_date: '', mentor_name: '', notes: '' });
      loadData(); toast.success('Onboarding creado');
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const filtered = onboardings.filter(o =>
    o.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.mentor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar onboarding..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 pl-9" />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Onboarding
        </Button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-primary/20 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Nuevo Proceso de Onboarding</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar empleado...</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
            <Input label="Fecha Inicio" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Mentor" value={form.mentor_name} onChange={e => setForm({ ...form, mentor_name: e.target.value })} placeholder="Nombre del mentor" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Notas del proceso..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Empleado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Inicio</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Mentor</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Progreso</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tareas</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Sin procesos de onboarding</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-foreground">{o.employee_name}</p>
                    <p className="text-[10px] text-muted-foreground">{o.employee_rut}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{o.start_date}</td>
                  <td className="px-4 py-3 text-xs">{o.mentor_name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${o.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-foreground">{o.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{o.tasks_completed || 0}/{o.tasks_total || 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[o.status]?.variant || 'neutral'}>
                      {statusConfig[o.status]?.label || o.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
