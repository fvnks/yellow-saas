'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Download, CheckCircle2, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/fixed-assets');
      const json = await res.json();
      if (json.success) {
        setAssets(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error('Error fetching fixed assets', e);
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
              Activo Fijo & Depreciación
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              Vida Útil SII
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Control de activos fijos, depreciación lineal por tabla SII y valor libro para Balance Tributario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Registrar Activo
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Costo Adquisición Total</p>
            <p className="text-lg font-black text-slate-900 mt-1">{clp(summary.total_acquisition_cost)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Depreciación Acumulada</p>
            <p className="text-lg font-black text-rose-600 mt-1">{clp(summary.total_accumulated_depreciation)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Valor Libro Neto</p>
            <p className="text-lg font-black text-emerald-700 mt-1">{clp(summary.total_book_value)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gasto Depreciación /Mes</p>
            <p className="text-lg font-black text-amber-700 mt-1">{clp(summary.monthly_depreciation_expense)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" /> Registro de Activos Fijos
          </h3>
          <span className="text-xs font-bold text-slate-500">{assets.length} activos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Descripción / Categoría</th>
                <th className="px-6 py-3">Adquisición</th>
                <th className="px-6 py-3">Costo CLP</th>
                <th className="px-6 py-3">Vida Útil SII</th>
                <th className="px-6 py-3">Dep. Acumulada</th>
                <th className="px-6 py-3">Valor Libro</th>
                <th className="px-6 py-3">Dep. Mensual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a) => {
                const pct = Math.round((a.accumulated_depreciation / a.acquisition_cost_clp) * 100);
                return (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{a.code}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{a.description}</div>
                      <div className="text-[11px] text-slate-500">{a.category}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">{a.acquisition_date}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{clp(a.acquisition_cost_clp)}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{a.sii_vida_util} años (Lineal)</td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-rose-600">{clp(a.accumulated_depreciation)}</div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{pct}% depreciado</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-extrabold text-emerald-700">{clp(a.book_value)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-amber-700">{clp(a.monthly_depreciation)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
