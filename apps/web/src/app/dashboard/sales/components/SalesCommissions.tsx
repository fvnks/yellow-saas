'use client';

import { useState, useEffect } from 'react';
import { Percent, TrendingUp, DollarSign, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';

interface CommissionDetail {
  order_id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  employee_name: string;
  commission_rate: number;
  commission_amount: number;
  customer_name: string;
}

interface EmployeeSummary {
  name: string;
  email: string;
  rate: number;
  totalSales: number;
  totalCommission: number;
  orderCount: number;
}

export default function SalesCommissions() {
  const [summary, setSummary] = useState<any>(null);
  const [byEmployee, setByEmployee] = useState<EmployeeSummary[]>([]);
  const [details, setDetails] = useState<CommissionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/sales-commissions?year=${selectedYear}&month=${selectedMonth}`);
      if (res.ok) {
        const json = await res.json();
        setSummary(json.data.summary);
        setByEmployee(json.data.byEmployee || []);
        setDetails(json.data.details || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formatMoney = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Comisiones de Venta</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            {[0, 1].map(offset => <option key={offset} value={new Date().getFullYear() - offset}>{new Date().getFullYear() - offset}</option>)}
          </select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase">Ventas Totales</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{formatMoney(summary.totalSales)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.orderCount} órdenes</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase">Comisiones Totales</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{formatMoney(summary.totalCommissions)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.totalSales > 0 ? ((summary.totalCommissions / summary.totalSales) * 100).toFixed(1) : 0}% promedio</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase">Vendedores Activos</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{byEmployee.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Vendedor</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Tasa</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Ventas</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Órdenes</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Comisión</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {byEmployee.map((emp, idx) => {
                const isExpanded = expandedEmployee === emp.name;
                const empDetails = details.filter(d => d.employee_name === emp.name);
                return (
                  <>
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedEmployee(isExpanded ? null : emp.name)}>
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{emp.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-50 text-indigo-700">{emp.rate}%</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-slate-600">{formatMoney(emp.totalSales)}</td>
                      <td className="px-4 py-3 text-xs text-center text-slate-600">{emp.orderCount}</td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-emerald-600">{formatMoney(emp.totalCommission)}</td>
                      <td className="px-4 py-3 text-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${idx}-details`}>
                        <td colSpan={6} className="px-4 pb-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Factura</th>
                                <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Cliente</th>
                                <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
                                <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Monto</th>
                                <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Comisión</th>
                              </tr>
                            </thead>
                            <tbody>
                              {empDetails.map(d => (
                                <tr key={d.order_id} className="border-b border-slate-50">
                                  <td className="px-3 py-2 text-xs text-slate-900">{d.order_number}</td>
                                  <td className="px-3 py-2 text-xs text-slate-600">{d.customer_name}</td>
                                  <td className="px-3 py-2 text-xs text-slate-600">{new Date(d.created_at).toLocaleDateString('es-CL')}</td>
                                  <td className="px-3 py-2 text-xs text-right text-slate-600">{formatMoney(d.total_amount)}</td>
                                  <td className="px-3 py-2 text-xs text-right font-bold text-emerald-600">{formatMoney(d.commission_amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {byEmployee.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-xs text-slate-400">Sin comisiones este período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
