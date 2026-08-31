'use client';

import { useState, useEffect } from 'react';
import { Calculator, FileText, Download, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function F29AssistantPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    fetchF29Data();
  }, [period]);

  async function fetchF29Data() {
    try {
      setLoading(true);
      const res = await fetch(`/api/accounting/f29?period=${period}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Error fetching F29 data', e);
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
              Asistente Formulario 29 SII (Declaración Mensual de Impuestos)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              SII Chile
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cálculo automático de Débito/Crédito IVA (19%), PPM de Primera Categoría y Retención Honorarios (13.75%).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
          />
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Borrador F29
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <p className="text-xs text-slate-500 font-bold uppercase">Débito Fiscal IVA</p>
            <p className="text-xl font-black text-slate-900 mt-1">{clp(data.summary.debitIva)}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ventas Netas: {clp(data.summary.totalSalesNet)}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <p className="text-xs text-slate-500 font-bold uppercase">Crédito Fiscal IVA</p>
            <p className="text-xl font-black text-slate-900 mt-1">{clp(data.summary.creditIva)}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Compras Netas: {clp(data.summary.totalPurchasesNet)}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <p className="text-xs text-slate-500 font-bold uppercase">PPM (1.5%) + Retención (13.75%)</p>
            <p className="text-xl font-black text-slate-900 mt-1">{clp(data.summary.ppmAmount + data.summary.honorariosRetencion)}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Pagos Provisionales & Honorarios</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs bg-amber-500/10 border-amber-400/30">
            <p className="text-xs text-amber-800 font-extrabold uppercase">TOTAL F29 A PAGAR</p>
            <p className="text-2xl font-black text-slate-950 mt-1">{clp(data.summary.totalF29Payable)}</p>
            <p className="text-[11px] text-amber-700 font-bold mt-0.5">Vencimiento: 12 al 20 del mes subsiguiente</p>
          </div>
        </div>
      )}

      {/* SII Form Lines Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-600" /> Códigos Oficiales Formulario 29 (SII Chile)
          </h3>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Cálculo Validado SII
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Código SII</th>
                <th className="px-6 py-3">Descripción de la Línea</th>
                <th className="px-6 py-3 text-right">Monto CLP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.linesSII?.map((line: any) => (
                <tr key={line.code} className={line.code === '091' ? 'bg-amber-50 font-black text-slate-900' : 'hover:bg-slate-50/80'}>
                  <td className="px-6 py-4 font-mono font-extrabold text-blue-600">[{line.code}]</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{line.description}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{clp(Number(line.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
