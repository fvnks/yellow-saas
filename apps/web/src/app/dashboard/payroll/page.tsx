'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, KPICard } from '@yellow-erp/ui';
import { Wallet, Plus, Search, Users, Calculator, FileText, Download, Eye, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  status: string;
  hireDate: string;
  lastPayroll: string;
}

interface PayrollRecord {
  id: string;
  period: string;
  status: string;
  totalAmount: number;
  employees: number;
  paidDate: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  active: { label: 'Activo', variant: 'success' },
  on_leave: { label: 'En Permiso', variant: 'warning' },
  inactive: { label: 'Inactivo', variant: 'danger' },
  paid: { label: 'Pagado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  processing: { label: 'Procesando', variant: 'info' },
};

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'employees' | 'history'>('employees');

  useEffect(() => {
    const api = getApiClient();
    api.getEmployees().then(res => {
      const mapped = (res.data || []).map((e: Record<string, unknown>) => ({
        id: String(e.id),
        name: String(e.name || ''),
        position: String(e.position || ''),
        department: String(e.department || ''),
        salary: Number(e.salary || 0),
        status: String(e.status || 'active'),
        hireDate: '',
        lastPayroll: '',
      }));
      setEmployees(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const departments = [...new Set(employees.map(e => e.department))];

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const totalPayroll = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);
  const activeEmployees = employees.filter(e => e.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nómina</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de remuneraciones y beneficios</p>
        </div>
        {activeTab === 'employees' ? (
          <Link href="/dashboard/payroll/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </Link>
        ) : (
          <Button>
            <Calculator className="w-4 h-4 mr-2" />
            Generar Nómina
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Empleados Activos" value={activeEmployees} icon={Users} trend={`${employees.length} total`} trendUp={true} />
        <KPICard label="Nómina Mensual" value={`$${(totalPayroll/1000000).toFixed(1)}M`} icon={Wallet} trend="+3% vs anterior" trendUp={true} />
        <KPICard label="Ñšltimo Período" value="Jun 2026" icon={Calendar} trend="Pagado" trendUp={true} />
        <KPICard label="Provisión" value={`$${(totalPayroll*0.35/1000000).toFixed(1)}M`} icon={DollarSign} trend="35% carga social" trendUp={true} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { id: 'employees' as const, label: 'Empleados', icon: Users, count: employees.length },
              { id: 'history' as const, label: 'Historial de Nóminas', icon: FileText, count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && <Badge variant="neutral">{tab.count}</Badge>}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {activeTab === 'employees' && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Buscar por nombre, ID o cargo..."
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
        )}

        {activeTab === 'employees' && (
          <div role="tabpanel">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cargo</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Departamento</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sueldo Base</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Ingreso</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(employee => (
                    <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{employee.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{employee.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{employee.position}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{employee.department}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[employee.status]?.variant || 'neutral'}>
                          {statusConfig[employee.status]?.label || employee.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">${employee.salary.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{employee.hireDate}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">ID Nómina</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Período</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleados</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto Total</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Pago</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payrollHistory.map(payroll => (
                  <tr key={payroll.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-900 font-medium">{payroll.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{payroll.period}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-center">{payroll.employees}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">${payroll.totalAmount.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{payroll.paidDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[payroll.status]?.variant || 'neutral'}>
                        {statusConfig[payroll.status]?.label || payroll.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Boleta
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

