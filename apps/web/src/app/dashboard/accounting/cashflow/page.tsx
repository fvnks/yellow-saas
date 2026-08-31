'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Download, Calendar, ShieldCheck } from 'lucide-react';

export default function CashflowPage() {
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/cashflow');
      const json = await res.json();
      if (json.success && json.data) {
        setCashflow(json.data);
      }
    } catch (e) {
      console.error('Error fetching cashflow data', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Flujo de Caja Proyectado (Cashflow CLP / UF)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Liquidez OK
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Proyección de ingresos por cobranza DTE y egresos por pagos a proveedores, remuneraciones y F29 SII.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Informe Cashflow
          </button>
        </div>
      </div>

      {/* Cashflow Monthly Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" /> Proyección Mes a Mes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Mes Proyectado</th>
                <th className="px-6 py-3">Saldo Inicial</th>
                <th className="px-6 py-3">Ingresos Esperados (Cobranzas)</th>
                <th className="px-6 py-3">Egresos Esperados (Compras/Nómina)</th>
                <th className="px-6 py-3">Flujo Neto del Mes</th>
                <th className="px-6 py-3">Saldo Final Estimado</th>
                <th className="px-6 py-3">Equivalente UF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashflow.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{row.month}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-600">{clp(row.initial_balance)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-600">+{clp(row.expected_inflows)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-rose-600">-{clp(row.expected_outflows)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">+{clp(row.net_cashflow)}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-slate-900 bg-slate-50">{clp(row.final_balance)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-amber-700">{row.uf_equivalent} UF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
