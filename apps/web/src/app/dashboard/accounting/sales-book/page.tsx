'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Download, ShieldCheck, AlertTriangle, FileText, Calendar } from 'lucide-react';

export default function SalesBookPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [period, setPeriod] = useState('2026-03');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/accounting/sales-book?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
        setTotals(json.totals);
      }
    } catch (e) {
      console.error('Error fetching sales book', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const dteColor = (type: number) => {
    if (type === 61) return 'text-rose-600';
    if (type === 39) return 'text-purple-600';
    if (type === 34) return 'text-slate-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Libro de Ventas SII (RCV)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Registro Compras/Ventas SII
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registro cronológico oficial de DTE emitidos para declaración F29 al SII — Código 502/503/519/520.
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
            Exportar Libro
          </button>
        </div>
      </div>

      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Neto</p>
            <p className="text-lg font-black text-slate-900 mt-1">{clp(totals.total_net)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">IVA Débito Fiscal</p>
            <p className="text-lg font-black text-blue-700 mt-1">{clp(totals.total_iva)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Exento</p>
            <p className="text-lg font-black text-slate-600 mt-1">{clp(totals.total_exempt)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Período</p>
            <p className="text-lg font-black text-emerald-700 mt-1">{clp(totals.total_amount)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" /> Detalle Libro de Ventas — Período {period}
          </h3>
          <span className="text-xs font-bold text-slate-500">{entries.length} documentos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Tipo DTE</th>
                <th className="px-6 py-3">Folio</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">RUT Receptor</th>
                <th className="px-6 py-3">Razón Social</th>
                <th className="px-6 py-3">Exento</th>
                <th className="px-6 py-3">Neto</th>
                <th className="px-6 py-3">IVA 19%</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Estado SII</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className={`px-6 py-4 font-bold ${dteColor(e.dte_type)}`}>
                    {e.dte_type_label}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">N° {e.folio}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{e.date}</td>
                  <td className="px-6 py-4 font-mono text-slate-700">{e.customer_rut}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{e.customer_name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{e.exempt_amount ? clp(e.exempt_amount) : '—'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{clp(e.net_amount)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-700">{clp(e.iva_amount)}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-slate-900">{clp(e.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3" /> Aceptado SII
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totals && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80">
            <div className="flex items-center justify-end gap-8 text-xs font-extrabold">
              <span className="text-slate-500">TOTALES PERÍODO:</span>
              <span className="text-slate-500">{clp(totals.total_exempt)}</span>
              <span className="text-slate-900">{clp(totals.total_net)}</span>
              <span className="text-blue-700">{clp(totals.total_iva)}</span>
              <span className="text-emerald-700">{clp(totals.total_amount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
