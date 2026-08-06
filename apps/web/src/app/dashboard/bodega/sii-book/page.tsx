'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

export default function SIIBookPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (periodStart) params.period_start = periodStart;
      if (periodEnd) params.period_end = periodEnd;
      const res = await api.getSIIInventoryBook(params);
      setEntries(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const totalOpeningValue = entries.reduce((s, e) => s + (parseFloat(e.opening_value) || 0), 0);
  const totalEntriesValue = entries.reduce((s, e) => s + (parseFloat(e.entries_value) || 0), 0);
  const totalExitsValue = entries.reduce((s, e) => s + (parseFloat(e.exits_value) || 0), 0);
  const totalClosingValue = entries.reduce((s, e) => s + (parseFloat(e.closing_value) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bodega" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Libro Inventario SII</h1>
          <p className="text-sm text-slate-500 mt-1">Control de inventario para SII (Servicio de Impuestos Internos)</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Periodo Inicio</label>
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Periodo Fin</label>
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <button onClick={loadEntries}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-5">
            Filtrar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Inicial</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${totalOpeningValue.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Entradas</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">${totalEntriesValue.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Salidas</p>
          <p className="text-lg font-bold text-rose-600 mt-1">${totalExitsValue.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Final</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${totalClosingValue.toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Metodo</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Apertura Qty</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Apertura Valor</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Entradas Qty</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Entradas Valor</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Salidas Qty</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Salidas Valor</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cierre Qty</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cierre Valor</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-500">Cargando...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay registros en el libro de inventario</p>
                </td></tr>
              ) : entries.map((e, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{e.product_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{e.warehouse_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600">{e.cost_method || 'FIFO'}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-700">{e.opening_qty || 0}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-900">${Number(e.opening_value || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-700">{e.entries_qty || 0}</td>
                  <td className="px-4 py-3 text-xs text-right text-emerald-600">${Number(e.entries_value || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-700">{e.exits_qty || 0}</td>
                  <td className="px-4 py-3 text-xs text-right text-rose-600">${Number(e.exits_value || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">{e.closing_qty || 0}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">${Number(e.closing_value || 0).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
