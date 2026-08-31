'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Plus, CheckCircle2, Clock, ShieldCheck, DollarSign, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function RecurringSalesPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/sales/recurring');
      const json = await res.json();
      if (json.success && json.data) {
        setContracts(json.data);
      }
    } catch (e) {
      console.error('Error fetching recurring sales data', e);
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
              Facturación Recurrente & Suscripciones DTE Automáticas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Auto-Facturación DTE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Automatización de cobros mensuales y emisión programada de Facturas Electrónicas DTE con despacho por email.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Nuevo contrato recurrente configurado')}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contrato Recurrente
          </button>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-slate-600" /> Contratos de Servicio Programados
          </h3>
          <span className="text-xs font-bold text-slate-500">{contracts.length} contratos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Contrato / Servicio</th>
                <th className="px-6 py-3">Cliente / RUT</th>
                <th className="px-6 py-3">Frecuencia</th>
                <th className="px-6 py-3">Próxima Facturación</th>
                <th className="px-6 py-3">Monto Periódico</th>
                <th className="px-6 py-3">Auto-DTE SII</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{c.contract_name}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{c.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.customer_rut}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold capitalize text-slate-700">{c.frequency} (Día {c.billing_day})</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{c.next_billing_date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{clp(c.amount_clp)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3" /> Activo (Auto-DTE)
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
