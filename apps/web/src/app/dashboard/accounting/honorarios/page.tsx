'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, DollarSign, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function HonorariosPage() {
  const [bheList, setBheList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/honorarios');
      const json = await res.json();
      if (json.success && json.data) {
        setBheList(json.data);
      }
    } catch (e) {
      console.error('Error fetching BHE data', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const totalGross = bheList.reduce((sum, item) => sum + Number(item.gross_amount_clp), 0);
  const totalRetention = bheList.reduce((sum, item) => sum + Number(item.retention_amount_clp), 0);
  const totalNet = bheList.reduce((sum, item) => sum + Number(item.net_amount_clp), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Libro de Boletas de Honorarios Electrónicas (BHE SII)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Retención 13.75% SII
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registro de honorarios recibidos de prestadores independientes y cálculo de la retención a pagar en el Formulario 29.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Libro de Honorarios PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase">Monto Bruto Total</p>
          <p className="text-xl font-black text-slate-900 mt-1">{clp(totalGross)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase">Retención 13.75% F29</p>
          <p className="text-xl font-black text-rose-600 mt-1">{clp(totalRetention)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase">Monto Líquido a Pagar</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{clp(totalNet)}</p>
        </div>
      </div>

      {/* BHE Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" /> Boletas de Honorarios Recibidas
          </h3>
          <span className="text-xs font-bold text-slate-500">{bheList.length} boletas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Folio BHE</th>
                <th className="px-6 py-3">Prestador / RUT</th>
                <th className="px-6 py-3">Fecha Emisión</th>
                <th className="px-6 py-3">Monto Bruto</th>
                <th className="px-6 py-3">Retención (13.75%)</th>
                <th className="px-6 py-3">Monto Líquido</th>
                <th className="px-6 py-3">Estado SII</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bheList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">N° {item.folio_bhe}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.issuer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.issuer_rut}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{item.issue_date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{clp(item.gross_amount_clp)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-rose-600">-{clp(item.retention_amount_clp)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{clp(item.net_amount_clp)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3" /> Aceptada SII
                    </span>
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
