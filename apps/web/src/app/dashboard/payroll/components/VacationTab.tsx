'use client';

import { useEffect, useState } from 'react';
import { Button, Badge, Input, Select } from '@yellow-erp/ui';
import { Plus, Calendar, Check, X, Clock, AlertTriangle, Plane, Trash2 } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface VacationBalance {
  id: string;
  employee_id: string;
  year: number;
  days_earned: number;
  days_used: number;
  days_pending: number;
  days_available: number;
  first_name: string;
  last_name: string;
  rut: string;
  position: string;
  department: string;
  hire_date: string;
}

interface VacationRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  first_name: string;
  last_name: string;
  rut: string;
  position: string;
  department: string;
  created_at: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: typeof Check }> = {
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  approved: { label: 'Aprobada', variant: 'success', icon: Check },
  rejected: { label: 'Rechazada', variant: 'danger', icon: X },
  cancelled: { label: 'Cancelada', variant: 'neutral', icon: X },
};

export default function VacationTab() {
  const [balances, setBalances] = useState<VacationBalance[]>([]);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'balances' | 'requests'>('balances');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    const api = getApiClient();
    try {
      const [balRes, reqRes, empRes] = await Promise.all([
        api.getVacationBalances({ year: yearFilter }),
        api.getVacationRequests({ limit: '200' }),
        api.getEmployees({ limit: '200' }),
      ]);
      setBalances(balRes.data || balRes || []);
      setRequests(reqRes.data || []);
      setEmployees(empRes.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [yearFilter]);

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const totalDaysEarned = balances.reduce((s, b) => s + (b.days_earned || 0), 0);
  const totalDaysUsed = balances.reduce((s, b) => s + (b.days_used || 0), 0);
  const totalDaysAvailable = balances.reduce((s, b) => s + (b.days_available || 0), 0);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const handleApprove = async (id: string) => {
    const api = getApiClient();
    await api.updateVacationRequest(id, { status: 'approved' });
    loadData();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (reason === null) return;
    const api = getApiClient();
    await api.updateVacationRequest(id, { status: 'rejected', rejection_reason: reason || undefined });
    loadData();
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta solicitud?')) return;
    const api = getApiClient();
    await api.updateVacationRequest(id, { status: 'cancelled' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    const api = getApiClient();
    await api.deleteVacationRequest(id);
    loadData();
  };

  if (loading) {
    return <div className="animate-pulse bg-slate-200 h-32 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Días Ganados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalDaysEarned}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Días Usados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalDaysUsed}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Disponibles</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{totalDaysAvailable}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{pendingRequests}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex items-center justify-between px-4">
            <div className="flex">
              {[
                { id: 'balances' as const, label: 'Saldos por Empleado' },
                { id: 'requests' as const, label: 'Solicitudes', count: requests.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                    subTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {'count' in tab && (
                    <span className="ml-1 bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 py-2">
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                options={[
                  { value: '2026', label: '2026' },
                  { value: '2025', label: '2025' },
                  { value: '2024', label: '2024' },
                ]}
              />
              {subTab === 'balances' ? (
                <Button onClick={() => setShowBalanceModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Asignar Saldo
                </Button>
              ) : (
                <Button onClick={() => setShowRequestModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Solicitud
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Balances Tab */}
        {subTab === 'balances' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ingreso</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ganados</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Usados</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pendientes</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Disponibles</th>
                </tr>
              </thead>
              <tbody>
                {balances.map(b => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{b.first_name} {b.last_name}</p>
                        <p className="text-[9px] text-slate-500">{b.rut}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{b.position || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{b.hire_date ? new Date(b.hire_date).toLocaleDateString('es-CL') : '—'}</td>
                    <td className="px-4 py-3 text-xs text-center font-medium text-slate-700">{b.days_earned}</td>
                    <td className="px-4 py-3 text-xs text-center text-rose-600">{b.days_used}</td>
                    <td className="px-4 py-3 text-xs text-center text-amber-600">{b.days_pending}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        b.days_available > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {b.days_available} días
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {balances.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No hay saldos de vacaciones para {yearFilter}</p>
                <p className="text-xs text-slate-400 mt-1">Asigna saldos a los empleados para comenzar</p>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {subTab === 'requests' && (
          <>
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos los estados' },
                    { value: 'pending', label: 'Pendientes' },
                    { value: 'approved', label: 'Aprobadas' },
                    { value: 'rejected', label: 'Rechazadas' },
                    { value: 'cancelled', label: 'Canceladas' },
                  ]}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Desde</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Hasta</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Días</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{r.first_name} {r.last_name}</p>
                          <p className="text-[9px] text-slate-500">{r.department || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">{new Date(r.start_date).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{new Date(r.end_date).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-center font-bold text-slate-900">{r.days}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{r.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[r.status]?.variant || 'neutral'}>
                          {statusConfig[r.status]?.label || r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(r.id)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Aprobar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(r.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleCancel(r.id)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRequests.length === 0 && (
                <div className="p-12 text-center">
                  <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay solicitudes de vacaciones</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <VacationRequestModal
          employees={employees}
          balances={balances}
          onClose={() => setShowRequestModal(false)}
          onSave={() => { setShowRequestModal(false); loadData(); }}
        />
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <VacationBalanceModal
          employees={employees}
          year={parseInt(yearFilter)}
          onClose={() => setShowBalanceModal(false)}
          onSave={() => { setShowBalanceModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function VacationRequestModal({ employees, balances, onClose, onSave }: {
  employees: Employee[];
  balances: VacationBalance[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedBalance = balances.find(b => b.employee_id === employeeId);

  const handleSave = async () => {
    if (!employeeId || !startDate || !endDate) {
      setError('Selecciona empleado y fechas');
      return;
    }
    setSaving(true);
    setError('');
    const api = getApiClient();
    try {
      await api.createVacationRequest({ employee_id: employeeId, start_date: startDate, end_date: endDate, reason: reason || undefined });
      onSave();
    } catch (e: any) {
      setError(e?.message || 'Error al crear solicitud');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Nueva Solicitud de Vacación</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">{error}</div>}
          <Select
            label="Empleado"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            options={[{ value: '', label: 'Seleccionar...' }, ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))]}
          />
          {selectedBalance && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              Saldo disponible: <strong>{selectedBalance.days_available} días</strong>
            </div>
          )}
          <Input label="Fecha Inicio" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
          <Input label="Fecha Término" type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Motivo de la solicitud..."
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            {saving ? 'Creando...' : 'Crear Solicitud'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function VacationBalanceModal({ employees, year, onClose, onSave }: {
  employees: Employee[];
  year: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [daysEarned, setDaysEarned] = useState(15);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!employeeId) {
      setError('Selecciona un empleado');
      return;
    }
    setSaving(true);
    setError('');
    const api = getApiClient();
    try {
      await api.createVacationBalance({ employee_id: employeeId, year, days_earned: daysEarned, notes: notes || undefined });
      onSave();
    } catch (e: any) {
      setError(e?.message || 'Error al asignar saldo');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Asignar Saldo de Vacaciones</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">{error}</div>}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            Período: <strong>{year}</strong> — Por ley, 15 días hábiles después del primer año de antigüedad (+1 día por cada 3 años, máx 20 días).
          </div>
          <Select
            label="Empleado"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            options={[{ value: '', label: 'Seleccionar...' }, ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))]}
          />
          <Input label="Días a Asignar" type="number" value={daysEarned} onChange={(e: any) => setDaysEarned(parseInt(e.target.value) || 0)} />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Asignar Saldo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
