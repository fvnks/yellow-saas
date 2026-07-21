'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Allocation {
  id: string;
  employee_id: string;
  employee_name: string;
  position: string;
  allocation_percent: number;
  start_date: string;
  end_date: string;
  role_in_project: string;
  hourly_rate: number;
  hours_this_week: number;
  hours_this_month: number;
}

interface ResourceAllocationFormProps {
  projectId: string;
  employees: any[];
  onRefresh?: () => void;
}

export default function ResourceAllocationForm({ projectId, employees, onRefresh }: ResourceAllocationFormProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employee_id: '', allocation_percent: '100', role_in_project: '', hourly_rate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAllocations(); }, [projectId]);

  const loadAllocations = async () => {
    try {
      const api = getApiClient();
      const res = await api.getProjectAllocations(projectId);
      setAllocations(Array.isArray(res) ? res : []);
    } catch {} finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.employee_id) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.setProjectAllocation(projectId, {
        employee_id: form.employee_id,
        allocation_percent: parseInt(form.allocation_percent) || 100,
        role_in_project: form.role_in_project || null,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      });
      setForm({ employee_id: '', allocation_percent: '100', role_in_project: '', hourly_rate: '' });
      setShowAdd(false);
      loadAllocations();
      toast.success('Recurso asignado');
    } catch { toast.error('Error al asignar'); }
    setSaving(false);
  };

  const handleRemove = async (allocationId: string) => {
    if (!confirm('Remover esta asignación?')) return;
    try {
      const api = getApiClient();
      await api.removeProjectAllocation(projectId, allocationId);
      loadAllocations();
      toast.success('Recurso removido');
    } catch { toast.error('Error'); }
  };

  const handlePercentChange = async (allocation: Allocation, newPercent: number) => {
    try {
      const api = getApiClient();
      await api.setProjectAllocation(projectId, {
        employee_id: allocation.employee_id,
        allocation_percent: newPercent,
        role_in_project: allocation.role_in_project,
        hourly_rate: allocation.hourly_rate,
      });
      loadAllocations();
    } catch { toast.error('Error al actualizar'); }
  };

  const availableEmployees = employees.filter(e => !allocations.some(a => a.employee_id === e.id));
  const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation_percent, 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Asignación de Recursos</h3>
          {totalAllocation > 100 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3" /> {totalAllocation}% total
            </span>
          )}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Asignar
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Seleccionar empleado...</option>
              {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="100" value={form.allocation_percent} onChange={e => setForm({ ...form, allocation_percent: e.target.value })}
                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <span className="text-xs text-slate-500">% dedicación</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.role_in_project} onChange={e => setForm({ ...form, role_in_project: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Rol en proyecto..." />
            <input type="number" step="0.01" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tarifa hora..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">Cancelar</button>
            <button onClick={handleAdd} disabled={saving || !form.employee_id}
              className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Asignar'}
            </button>
          </div>
        </div>
      )}

      {allocations.length === 0 ? (
        <div className="text-center py-8 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Sin recursos asignados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allocations.map(alloc => (
            <div key={alloc.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600">
                      {alloc.employee_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{alloc.employee_name}</h4>
                    <p className="text-[10px] text-slate-400">{alloc.role_in_project || alloc.position || 'Sin rol'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <input type="range" min="0" max="100" step="5" value={alloc.allocation_percent}
                      onChange={e => handlePercentChange(alloc, parseInt(e.target.value))}
                      className="w-20 h-1 accent-indigo-600" />
                    <span className={`text-xs font-bold ${alloc.allocation_percent > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                      {alloc.allocation_percent}%
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">{alloc.hours_this_week}h esta semana</p>
                    <p className="text-[10px] text-slate-400">{alloc.hours_this_month}h este mes</p>
                  </div>
                  <button onClick={() => handleRemove(alloc.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${alloc.allocation_percent > 100 ? 'bg-red-500' : alloc.allocation_percent > 80 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(alloc.allocation_percent, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
