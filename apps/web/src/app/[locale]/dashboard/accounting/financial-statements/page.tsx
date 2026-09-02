'use client';

import { useState, useEffect } from 'react';
import { FileBarChart, Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function FinancialStatementsPage() {
  const [balance, setBalance] = useState<any[]>([]);
  const [incomeStatement, setIncomeStatement] = useState<any>(null);
  const [period, setPeriod] = useState('2026-03');
  const [activeTab, setActiveTab] = useState<'balance' | 'eerr'>('balance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/accounting/financial-statements?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setBalance(json.balance);
        setIncomeStatement(json.income_statement);
      }
    } catch (e) {
      console.error('Error fetching financial statements', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Estados Financieros
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Balance 8 Columnas + EERR
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Balance de 8 columnas clasificado y Estado de Resultados conforme a normativa SII Chile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'balance' ? 'bg-[#0F172A] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
        >
          Balance 8 Columnas
        </button>
        <button
          onClick={() => setActiveTab('eerr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'eerr' ? 'bg-[#0F172A] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
        >
          Estado de Resultados
        </button>
      </div>

      {activeTab === 'balance' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-slate-600" /> Balance de 8 Columnas — Período {period}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2" rowSpan={2}>Código</th>
                  <th className="px-4 py-2" rowSpan={2}>Cuenta</th>
                  <th className="px-4 py-2 text-center border-l border-slate-200" colSpan={2}>Sumas Anteriores</th>
                  <th className="px-4 py-2 text-center border-l border-slate-200" colSpan={2}>Movimientos del Mes</th>
                  <th className="px-4 py-2 text-center border-l border-slate-200" colSpan={2}>Saldos Balance</th>
                  <th className="px-4 py-2 text-center border-l border-slate-200" colSpan={2}>Resultado</th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border-l border-slate-200">Debe</th>
                  <th className="px-4 py-2">Haber</th>
                  <th className="px-4 py-2 border-l border-slate-200">Debe</th>
                  <th className="px-4 py-2">Haber</th>
                  <th className="px-4 py-2 border-l border-slate-200">Deudor</th>
                  <th className="px-4 py-2">Acreedor</th>
                  <th className="px-4 py-2 border-l border-slate-200">Pérdida</th>
                  <th className="px-4 py-2">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balance.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{row.code}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 font-mono border-l border-slate-100">{row.debit_before ? clp(row.debit_before) : ''}</td>
                    <td className="px-4 py-3 font-mono">{row.credit_before ? clp(row.credit_before) : ''}</td>
                    <td className="px-4 py-3 font-mono border-l border-slate-100">{row.debit_period ? clp(row.debit_period) : ''}</td>
                    <td className="px-4 py-3 font-mono">{row.credit_period ? clp(row.credit_period) : ''}</td>
                    <td className="px-4 py-3 font-mono font-bold border-l border-slate-100">{row.debit_balance ? clp(row.debit_balance) : ''}</td>
                    <td className="px-4 py-3 font-mono font-bold">{row.credit_balance ? clp(row.credit_balance) : ''}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600 border-l border-slate-100">{row.debit_result ? clp(row.debit_result) : ''}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">{row.credit_result ? clp(row.credit_result) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'eerr' && incomeStatement && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" /> Estado de Resultados — Período {period}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">Ingresos por Ventas</span>
              <span className="text-sm font-black text-emerald-700 font-mono">{clp(incomeStatement.revenue)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700 pl-4">(-) Costo de Ventas</span>
              <span className="text-sm font-bold text-rose-600 font-mono">({clp(incomeStatement.cost_of_sales)})</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200 bg-slate-50 px-4 -mx-6 sm:-mx-4">
              <span className="text-sm font-black text-slate-900">Margen Bruto</span>
              <span className={`text-sm font-black font-mono ${incomeStatement.gross_profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {clp(incomeStatement.gross_profit)}
              </span>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gastos Operacionales</p>
              <div className="flex items-center justify-between py-2 pl-4">
                <span className="text-sm text-slate-700">Remuneraciones</span>
                <span className="text-sm font-bold text-rose-600 font-mono">({clp(incomeStatement.operating_expenses.salaries)})</span>
              </div>
              <div className="flex items-center justify-between py-2 pl-4">
                <span className="text-sm text-slate-700">Depreciación</span>
                <span className="text-sm font-bold text-rose-600 font-mono">({clp(incomeStatement.operating_expenses.depreciation)})</span>
              </div>
              <div className="flex items-center justify-between py-2 pl-4 border-b border-slate-100">
                <span className="text-sm text-slate-700">Gastos Generales</span>
                <span className="text-sm font-bold text-rose-600 font-mono">({clp(incomeStatement.operating_expenses.general)})</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 bg-slate-900 text-white px-6 -mx-6 rounded-b-2xl mt-4">
              <span className="text-sm font-black">Resultado Operacional del Período</span>
              <span className={`text-lg font-black font-mono ${incomeStatement.operating_income >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {clp(incomeStatement.operating_income)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
