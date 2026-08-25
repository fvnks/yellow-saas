'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Input } from '@yellow-erp/ui';
import { Plus, Search, Calendar, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  employee_name: string;
  employee_rut: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  hours_worked: number;
  overtime_hours: number;
  notes: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: any }> = {
  present: { label: 'Presente', variant: 'success', icon: CheckCircle2 },
  absent: { label: 'Ausente', variant: 'danger', icon: XCircle },
  late: { label: 'Tardanza', variant: 'warning', icon: Clock },
  partial: { label: 'Salida Parcial', variant: 'info', icon: AlertCircle },
  vacation: { label: 'Vacaciones', variant: 'info', icon: Calendar },
  sick_leave: { label: 'Licencia Médica', variant: 'info', icon: AlertCircle },
};

export default function AttendanceTab() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employee_id: '', date: new Date().toISOString().split('T')[0],
    check_in: '', check_out: '', status: 'present', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter);
      const [attRes, empRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/hr/attendance?${params}`).then(r => r.json()).catch(() => ({ data: [] })),
        getApiClient().getEmployees({ limit: '200' }).catch(() => ({ data: [] })),
      ]);
      setRecords(attRes.data || []);
      setEmployees(empRes.data || []);
    } catch { toast.error('Error al cargar asistencia'); }
    setLoading(false);
  }, [dateFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.employee_id) { toast.error('Selecciona un empleado'); return; }
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/hr/attendance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ employee_id: '', date: new Date().toISOString().split('T')[0], check_in: '', check_out: '', status: 'present', notes: '' });
      loadData(); toast.success('Asistencia registrada');
    } catch { toast.error('Error al registrar'); }
    setSaving(false);
  };

  const filtered = records.filter(r =>
    r.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.employee_rut?.includes(search)
  );

  const summary = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    total: records.length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{summary.present}</p>
          <p className="text-xs text-emerald-600">Presentes</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{summary.absent}</p>
          <p className="text-xs text-red-600">Ausentes</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{summary.late}</p>
          <p className="text-xs text-amber-600">Tardanzas</p>
        </div>
        <div className="bg-muted border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{summary.total}</p>
          <p className="text-xs text-muted-foreground">Total Registros</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar empleado..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 pl-9" />
          </div>
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-40" />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Registrar Asistencia
        </Button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-primary/20 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Registrar Asistencia</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar empleado...</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <Input type="time" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} placeholder="Hora entrada" />
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
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Entrada</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Salida</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Horas</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Sin registros de asistencia</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-foreground">{r.employee_name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.employee_rut}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.date}</td>
                  <td className="px-4 py-3 text-xs">{r.check_in || '—'}</td>
                  <td className="px-4 py-3 text-xs">{r.check_out || '—'}</td>
                  <td className="px-4 py-3 text-xs">{r.hours_worked || 0}h</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[r.status]?.variant || 'neutral'}>
                      {statusConfig[r.status]?.label || r.status}
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
