'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Download, Search } from 'lucide-react';

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [accountCode, setAccountCode] = useState('1.1.01');
  const [period, setPeriod] = useState('2026-03');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [accountCode, period]);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/accounting/general-ledger?account=${accountCode}&period=${period}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
        setAccount(json.account);
      }
    } catch (e) {
      console.error('Error fetching general ledger', e);
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
              Libro Mayor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              General Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Detalle de movimientos por cuenta contable con saldos corrientes — Base para Balance 8 Columnas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Libro Mayor
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              placeholder="Código cuenta (1.1.01)"
              className="bg-transparent text-xs font-bold text-slate-900 outline-none w-40"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {account && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cuenta</p>
            <p className="text-sm font-black text-slate-900 mt-1">{account.code} — {account.name}</p>
            <p className="text-[11px] text-slate-500">{account.type}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Debe</p>
            <p className="text-lg font-black text-blue-700 mt-1">{clp(account.total_debit)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Haber</p>
            <p className="text-lg font-black text-rose-600 mt-1">{clp(account.total_credit)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saldo Final</p>
            <p className="text-lg font-black text-emerald-700 mt-1">{clp(account.closing_balance)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" /> Movimientos del Período
          </h3>
          <span className="text-xs font-bold text-slate-500">{entries.length} movimientos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">N° Asiento</th>
                <th className="px-6 py-3">Glosa / Descripción</th>
                <th className="px-6 py-3">Centro Costo</th>
                <th className="px-6 py-3">Debe</th>
                <th className="px-6 py-3">Haber</th>
                <th className="px-6 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600">{e.date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{e.journal_entry}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{e.description}</td>
                  <td className="px-6 py-4 text-slate-500">{e.cost_center}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-700">{e.debit ? clp(e.debit) : '—'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-rose-600">{e.credit ? clp(e.credit) : '—'}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-slate-900 bg-slate-50">{clp(e.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
