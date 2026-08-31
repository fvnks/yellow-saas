'use client';

import { useState, useEffect } from 'react';
import { Anchor, Calculator, FileText, Download, Plus, CheckCircle2, ShieldCheck, DollarSign, ArrowUpRight, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportsPage() {
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/purchases/imports');
      const json = await res.json();
      if (json.success && json.data) {
        setImports(json.data);
      }
    } catch (e) {
      console.error('Error fetching imports data', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  const usd = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Gestión de Importaciones & Costo en Destino (Landed Cost)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> DIN Aduanas Chile
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cálculo de valor CIF, Ad Valorem (6%), IVA Importación, fletes internacionales y prorrateo de costos a bodega.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Nuevo calculador de importación abierto')}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Registrar DIN de Importación
          </button>
        </div>
      </div>

      {/* Imports Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Anchor className="w-4 h-4 text-slate-600" /> Declaraciones de Ingreso (DIN) & Factor Landed Cost
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Folio DIN Aduanas</th>
                <th className="px-6 py-3">Proveedor / Origen</th>
                <th className="px-6 py-3">FOB (USD)</th>
                <th className="px-6 py-3">CIF (USD / CLP)</th>
                <th className="px-6 py-3">Ad Valorem (6%)</th>
                <th className="px-6 py-3">Costo Total Puesto en Bodega</th>
                <th className="px-6 py-3">Factor Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {imports.map((imp) => (
                <tr key={imp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">N° {imp.din_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{imp.supplier_name}</div>
                    <div className="text-[11px] text-slate-500">{imp.country_origin}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{usd(imp.fob_usd)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    <div>{usd(imp.cif_usd)}</div>
                    <div className="text-[11px] text-slate-500">{clp(imp.cif_clp)}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-800">{clp(imp.ad_valorem_clp)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{clp(imp.total_landed_cost_clp)}</td>
                  <td className="px-6 py-4 font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-1 w-max">
                    +{((imp.landed_cost_factor - 1) * 100).toFixed(1)}% (x{imp.landed_cost_factor})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
