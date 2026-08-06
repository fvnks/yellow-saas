'use client';

import { useEffect, useState } from 'react';
import { Button, Badge } from '@yellow-erp/ui';
import { ArrowLeft, Download, Check, DollarSign, Users, Calculator, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { generatePayslipPDF, PayslipData } from '@/lib/pdf-design';

interface PayrollItem {
  id: string;
  code: string;
  concept: string;
  type: string;
  category: string;
  amount: number;
  quantity: number;
  unit_value: number;
  is_taxable: boolean;
  is_employer: boolean;
  employee_id: string;
  first_name: string;
  last_name: string;
  rut: string;
  position: string;
  base_salary: number;
}

interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  period_label: string;
  status: string;
  employee_count: number;
  gross_amount: number;
  total_deductions: number;
  total_employer: number;
  total_tax: number;
  net_amount: number;
  total_amount: number;
  paid_at: string;
  items: PayrollItem[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  calculated: { label: 'Calculada', variant: 'info' },
  approved: { label: 'Aprobada', variant: 'success' },
  paid: { label: 'Pagada', variant: 'success' },
};

export default function PayrollRunDetailPage() {
  const params = useParams();
  const runId = params.id as string;
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getPayrollRun(runId),
      api.getCompany().catch(() => null),
    ]).then(([runData, companyData]) => {
      setRun(runData as unknown as PayrollRun);
      setCompany(companyData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [runId]);

  const generatePayslip = (empId: string) => {
    if (!run || !company) return;

    const empItems = run.items.filter(i => i.employee_id === empId);
    if (empItems.length === 0) return;

    const firstItem = empItems[0];
    const earnings = empItems.filter(i => i.category === 'earning');
    const deductions = empItems.filter(i => i.category === 'deduction' && !i.is_employer);
    const employer = empItems.filter(i => i.category === 'employer');

    const gross = earnings.reduce((s, i) => s + i.amount, 0);
    const totalDeductions = deductions.reduce((s, i) => s + i.amount, 0);
    const totalEmployer = employer.reduce((s, i) => s + i.amount, 0);
    const totalTax = deductions.filter(i => i.code === 'IMP-2C').reduce((s, i) => s + i.amount, 0);

    const payslipData: PayslipData = {
      company: {
        name: company?.name || '',
        tax_id: company?.tax_id,
        razon_social: company?.razon_social,
        giro: company?.giro,
        address: company?.address,
        city: company?.city,
        region: company?.region,
        logo_url: company?.logo_url,
      },
      employee: {
        first_name: firstItem.first_name,
        last_name: firstItem.last_name,
        rut: firstItem.rut,
        position: firstItem.position || '',
        department: '',
        contract_type: '',
        hire_date: '',
        afp_fund: '',
        health_type: '',
      },
      period: {
        label: run.period_label,
        start_date: run.period_start,
        end_date: run.period_end,
      },
      earnings: earnings.map(e => ({
        concept: e.concept,
        amount: e.amount,
        quantity: e.quantity,
        unit_value: e.unit_value,
      })),
      deductions: deductions.map(d => ({
        concept: d.concept,
        amount: d.amount,
      })),
      employerContributions: employer.map(c => ({
        concept: c.concept,
        amount: c.amount,
      })),
      totals: { gross, total_deductions: totalDeductions, total_employer: totalEmployer, total_tax: totalTax, net_pay: gross - totalDeductions - totalTax },
    };

    const doc = generatePayslipPDF(payslipData);
    doc.save(`boleta-${run.period_label}-${firstItem.first_name}-${firstItem.last_name}.pdf`);
  };

  const generateAllPayslips = () => {
    if (!run) return;
    const empIds = [...new Set(run.items.map(i => i.employee_id))];
    empIds.forEach(id => generatePayslip(id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/payroll?tab=periods" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 dark:bg-slate-900 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">Nómina no encontrada</p>
        </div>
      </div>
    );
  }

  // Group items by employee
  const employeeMap = new Map<string, { name: string; rut: string; base_salary: number; items: PayrollItem[] }>();
  for (const item of run.items || []) {
    const key = item.employee_id || `${item.first_name}-${item.last_name}`;
    if (!employeeMap.has(key)) {
      employeeMap.set(key, {
        name: `${item.first_name} ${item.last_name}`,
        rut: item.rut || '—',
        base_salary: item.base_salary || 0,
        items: [],
      });
    }
    employeeMap.get(key)!.items.push(item);
  }

  const employeeEntries = Array.from(employeeMap.entries());

  const getEmployeeTotals = (items: PayrollItem[]) => {
    const earnings = items.filter(i => i.category === 'earning').reduce((s, i) => s + i.amount, 0);
    const deductions = items.filter(i => i.category === 'deduction' && !i.is_employer).reduce((s, i) => s + i.amount, 0);
    const employer = items.filter(i => i.category === 'employer').reduce((s, i) => s + i.amount, 0);
    const tax = items.filter(i => i.code === 'IMP-2C').reduce((s, i) => s + i.amount, 0);
    return { earnings, deductions, employer, tax, net: earnings - deductions - tax };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/payroll?tab=periods" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Nómina {run.period_label}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {run.period_start} al {run.period_end}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusConfig[run.status]?.variant || 'neutral'}>
            {statusConfig[run.status]?.label || run.status}
          </Badge>
          <Button onClick={generateAllPayslips} variant="secondary" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Generar Boletas
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{run.employee_count}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sueldo Imponible</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${(run.gross_amount || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Retenciones</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${((run.total_deductions || 0) + (run.total_tax || 0)).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Líquido a Pagar</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">${(run.net_amount || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Detalle por Empleado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sueldo Base</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Haberes</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Retenciones</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Impuesto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Líquido</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {employeeEntries.map(([empId, emp]) => {
                const totals = getEmployeeTotals(emp.items);
                const isExpanded = expandedEmployee === empId;
                return (
                  <>
                    <tr key={empId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{emp.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{emp.rut}</td>
                      <td className="px-4 py-3 text-xs text-right text-slate-700">${emp.base_salary.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-emerald-600">${totals.earnings.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-rose-600">${totals.deductions.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-right text-slate-700">${totals.tax.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">${totals.net.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setExpandedEmployee(isExpanded ? null : empId)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            {isExpanded ? 'Ocultar' : 'Ver'}
                          </button>
                          <button
                            onClick={() => generatePayslip(empId)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Descargar boleta"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${empId}-detail`}>
                        <td colSpan={8} className="px-4 py-3 bg-slate-50">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-slate-700 mb-2">Haberes</p>
                              {emp.items.filter(i => i.category === 'earning').map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1">
                                  <span className="text-slate-600">{item.concept}</span>
                                  <span className="font-medium text-emerald-600">${item.amount.toLocaleString('es-CL')}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 mb-2">Descuentos</p>
                              {emp.items.filter(i => i.category === 'deduction' && !i.is_employer).map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1">
                                  <span className="text-slate-600">{item.concept}</span>
                                  <span className="font-medium text-rose-600">${item.amount.toLocaleString('es-CL')}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 mb-2">Cargas Empleador</p>
                              {emp.items.filter(i => i.category === 'employer').map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1">
                                  <span className="text-slate-600">{item.concept}</span>
                                  <span className="font-medium text-indigo-600">${item.amount.toLocaleString('es-CL')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {employeeEntries.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sin datos de empleados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
