'use client';

import { useState } from 'react';
import { Button } from '@yellow-erp/ui';
import { X, Calculator, Download } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { generateLiquidationPDF, LiquidationData } from '@/lib/pdf-design';

interface Props {
  employees: any[];
  onClose: () => void;
}

const terminationTypes = [
  { value: 'despido_sin_causa', label: 'Despido sin Causa (indemnizacion completa)' },
  { value: 'mutuo_acuerdo', label: 'Mutuo Acuerdo (50% indemnizacion)' },
  { value: 'renuncia', label: 'Renuncia Voluntaria (sin indemnizacion)' },
  { value: 'despido_con_causa', label: 'Despido con Causa (sin indemnizacion)' },
];

export default function LiquidationModal({ employees, onClose }: Props) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [terminationType, setTerminationType] = useState('despido_sin_causa');
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split('T')[0]);
  const [noticeGiven, setNoticeGiven] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    if (!selectedEmployee) return;
    setCalculating(true);
    try {
      const api = getApiClient();
      const res = await api.calculateLiquidation({
        employee_id: selectedEmployee,
        termination_type: terminationType,
        termination_date: terminationDate,
        notice_given: noticeGiven,
      });
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Error calculando liquidacion');
    }
    setCalculating(false);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const api = getApiClient();
    api.getCompany().then((companyRes: any) => {
      const data: LiquidationData = {
        company: companyRes.data,
        employee_name: result.employee_name,
        employee_rut: result.employee_rut,
        position: result.position,
        department: result.department,
        contract_type: result.contract_type,
        hire_date: result.hire_date,
        base_salary: result.base_salary,
        termination_type: result.termination_type,
        termination_date: result.termination_date,
        years_of_service: result.years_of_service,
        items: result.items,
        totals: result.totals,
      };
      const doc = generateLiquidationPDF(data);
      doc.save(`liquidacion-${result.employee_rut}.pdf`);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Liquidacion de Remuneraciones</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Empleado</label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Seleccionar empleado...</option>
              {employees.filter(e => e.status === 'active').map(e => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.rut}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Tipo de Baja</label>
              <select
                value={terminationType}
                onChange={e => setTerminationType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {terminationTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Fecha de Baja</label>
              <input
                type="date"
                value={terminationDate}
                onChange={e => setTerminationDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {terminationType === 'despido_sin_causa' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notice_given"
                checked={noticeGiven}
                onChange={e => setNoticeGiven(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="notice_given" className="text-xs text-slate-700">
                Se dio aviso previo al empleado (sin recargo del 25%)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleCalculate} disabled={!selectedEmployee || calculating}>
              <Calculator className="w-4 h-4 mr-2" />
              {calculating ? 'Calculando...' : 'Calcular'}
            </Button>
          </div>

          {result && (
            <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Resultado — {result.employee_name}
                </h3>
                <Button onClick={handleDownloadPDF} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-emerald-600 font-medium">Haberes</p>
                  <p className="text-lg font-bold text-emerald-700">${result.totals.earnings.toLocaleString('es-CL')}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-600 font-medium">Indemnizaciones</p>
                  <p className="text-lg font-bold text-blue-700">${result.totals.severance.toLocaleString('es-CL')}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-400 font-medium">Liquido a Pagar</p>
                  <p className="text-lg font-bold text-white">${result.totals.net_total.toLocaleString('es-CL')}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Codigo</th>
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Concepto</th>
                      <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-mono text-slate-500">{item.code}</td>
                        <td className="px-3 py-2 text-slate-700">{item.concept}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">${item.amount.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[9px] text-slate-400 text-center">
                Antiguedad: {result.years_of_service} años — Contrato: {result.contract_type} — Base: ${result.base_salary.toLocaleString('es-CL')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
