'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Badge, Input, Select, KPICard } from '@yellow-erp/ui';
import { Wallet, Plus, Search, Users, Calculator, FileText, Download, Eye, Calendar, DollarSign, Edit, Trash2, AlertTriangle, Check, Settings } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import EmployeeFormModal from './components/EmployeeFormModal';
import PeriodModal from './components/PeriodModal';
import VacationTab from './components/VacationTab';
import LiquidationModal from './components/LiquidationModal';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  active: { label: 'Activo', variant: 'success' },
  on_leave: { label: 'En Permiso', variant: 'warning' },
  terminated: { label: 'Retirado', variant: 'danger' },
  draft: { label: 'Borrador', variant: 'neutral' },
  calculated: { label: 'Calculada', variant: 'info' },
  approved: { label: 'Aprobada', variant: 'success' },
  paid: { label: 'Pagada', variant: 'success' },
};

const contractTypeLabels: Record<string, string> = {
  indefinido: 'Indefinido',
  plazo_fijo: 'Plazo Fijo',
  part_time: 'Medio Tiempo',
  temporada: 'Temporada',
  boleta_7a: 'Boleta 7a',
};

export default function PayrollPageWrapper() {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-8 w-48 bg-slate-200 rounded animate-pulse" /></div>}>
      <PayrollPage />
    </Suspense>
  );
}

function PayrollPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'employees' | 'periods') || 'employees';
  const [employees, setEmployees] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'employees' | 'periods' | 'vacation'>(initialTab as any);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [showLiquidationModal, setShowLiquidationModal] = useState(false);
  const [calculating, setCalculating] = useState<string | null>(null);
  const [showUFModal, setShowUFModal] = useState(false);
  const [ufValue, setUFValue] = useState(38500);
  const [ufInput, setUFInput] = useState('');

  const loadData = useCallback(async () => {
    const api = getApiClient();
    try {
      const [empRes, runRes, ufRes] = await Promise.all([
        api.getEmployees({ limit: '200' }),
        api.getPayrollRuns({ limit: '50' }),
        api.getUFValue().catch(() => ({ data: { uf_value: 38500 } })),
      ]);
      setEmployees(empRes.data || []);
      setRuns(runRes.data || []);
      if (ufRes.data?.uf_value) {
        setUFValue(ufRes.data.uf_value);
        setUFInput(ufRes.data.uf_value.toLocaleString('es-CL'));
      }
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveUF = async () => {
    const parsed = parseInt(ufInput.replace(/\./g, '').replace(/,/g, ''), 10);
    if (!parsed || parsed <= 0) return;
    try {
      const api = getApiClient();
      await api.setUFValue(parsed);
      setUFValue(parsed);
      setShowUFModal(false);
    } catch { }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(e => {
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         e.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalPayroll = activeEmployees.reduce((sum, e) => sum + (e.base_salary || 0), 0);
  const latestRun = runs[0];

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('¿Eliminar este empleado?')) return;
    const api = getApiClient();
    await api.deleteEmployee(id);
    loadData();
  };

  const handleCalculate = async (runId: string) => {
    setCalculating(runId);
    const api = getApiClient();
    try {
      await api.calculatePayroll(runId);
      loadData();
    } catch { }
    setCalculating(null);
  };

  const handleApprove = async (runId: string) => {
    const api = getApiClient();
    await api.updatePayrollRun(runId, { status: 'approved' });
    loadData();
  };

  const handlePay = async (runId: string) => {
    const api = getApiClient();
    await api.updatePayrollRun(runId, { status: 'paid', paid_at: new Date().toISOString() });
    loadData();
  };

  const handleDeleteRun = async (runId: string) => {
    if (!confirm('¿Eliminar esta nómina? Solo se puede eliminar en estado borrador.')) return;
    const api = getApiClient();
    await api.deletePayrollRun(runId);
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Remuneraciones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de nómina chilena</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setUFInput(ufValue.toLocaleString('es-CL')); setShowUFModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            title="Configurar valor UF"
          >
            <DollarSign className="w-3.5 h-3.5" />
            UF ${ufValue.toLocaleString('es-CL')}
          </button>
          {activeTab === 'employees' ? (
            <>
              <Button onClick={() => setShowLiquidationModal(true)} variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Liquidacion
              </Button>
              <Button onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Empleado
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowPeriodModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Período
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Empleados Activos" value={activeEmployees.length} icon={Users} trend={`${employees.length} total`} trendUp={true} />
        <KPICard label="Nómina Mensual" value={`$${(totalPayroll / 1000000).toFixed(1)}M`} icon={Wallet} trend="+35% carga social" trendUp={true} />
        <KPICard label="Último Período" value={latestRun?.period_label || '—'} icon={Calendar} trend={latestRun ? statusConfig[latestRun.status]?.label : 'Sin datos'} trendUp={latestRun?.status === 'paid'} />
        <KPICard label="Costo Total Empleador" value={`$${((totalPayroll * 1.35) / 1000000).toFixed(1)}M`} icon={DollarSign} trend="Incluye cargas" trendUp={true} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { id: 'employees' as const, label: 'Empleados', icon: Users, count: employees.length },
              { id: 'periods' as const, label: 'Períodos de Nómina', icon: FileText, count: runs.length },
              { id: 'vacation' as const, label: 'Vacaciones', icon: Calendar, count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="ml-1 bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'employees' && (
          <>
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Buscar por nombre, RUT o cargo..."
                  />
                </div>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos los departamentos' },
                    ...departments.map(d => ({ value: d, label: d })),
                  ]}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cargo</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Departamento</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Contrato</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">AFP</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Salud</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sueldo Base</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(employee => (
                    <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{employee.first_name} {employee.last_name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{employee.rut || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{employee.position || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{employee.department || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{contractTypeLabels[employee.contract_type] || employee.contract_type}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{employee.afp_fund || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{employee.health_type === 'isapre' ? 'Isapre' : 'FONASA'}</td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">${(employee.base_salary || 0).toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[employee.status]?.variant || 'neutral'}>
                          {statusConfig[employee.status]?.label || employee.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingEmployee(employee); setShowEmployeeModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No se encontraron empleados</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'periods' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Período</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleados</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sueldo Imponible</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cargas Empleador</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Retenciones</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Líquido a Pagar</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <tr key={run.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{run.period_label}</td>
                    <td className="px-4 py-3 text-xs text-center text-slate-700">{run.employee_count || 0}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-700">${(run.gross_amount || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-700">${(run.total_employer || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-700">${((run.total_deductions || 0) + (run.total_tax || 0)).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">${(run.net_amount || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[run.status]?.variant || 'neutral'}>
                        {statusConfig[run.status]?.label || run.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/dashboard/payroll/${run.id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        {run.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleCalculate(run.id)}
                              disabled={calculating === run.id}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Calcular nómina"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRun(run.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {run.status === 'calculated' && (
                          <button
                            onClick={() => handleApprove(run.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {run.status === 'approved' && (
                          <button
                            onClick={() => handlePay(run.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Marcar como pagada"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {runs.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No hay períodos de nómina</p>
                <p className="text-xs text-slate-400 mt-1">Crea un nuevo período para comenzar a calcular</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vacation' && (
          <div className="p-6">
            <VacationTab />
          </div>
        )}
      </div>

      {showEmployeeModal && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => { setShowEmployeeModal(false); setEditingEmployee(null); }}
          onSave={() => { setShowEmployeeModal(false); setEditingEmployee(null); loadData(); }}
        />
      )}

      {showPeriodModal && (
        <PeriodModal
          onClose={() => setShowPeriodModal(false)}
          onSave={() => { setShowPeriodModal(false); loadData(); }}
        />
      )}

      {showUFModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Valor UF Actual</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Se usa para calcular gratificaciones y aguinaldo navideño.
              </p>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Valor (CLP)</label>
                <input
                  type="text"
                  value={ufInput}
                  onChange={e => setUFInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="38500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowUFModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveUF}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLiquidationModal && (
        <LiquidationModal
          employees={employees}
          onClose={() => setShowLiquidationModal(false)}
        />
      )}
    </div>
  );
}
