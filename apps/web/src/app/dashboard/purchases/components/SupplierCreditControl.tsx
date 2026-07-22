'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, Users, TrendingDown } from 'lucide-react';

export default function SupplierCreditControl() {
  const [supplierTotals, setSupplierTotals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [agingDetails, setAgingDetails] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/supplier-credit-control`);
      if (res.ok) { const j = await res.json(); setSupplierTotals(j.data.supplierTotals || []); setSummary(j.data.summary || null); setAgingDetails(j.data.aging || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const bucketCfg: Record<string, { label: string; color: string; bg: string }> = {
    current: { label: 'Corriente', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    '1-30': { label: '1-30 días', color: 'text-amber-700', bg: 'bg-amber-50' },
    '31-60': { label: '31-60 días', color: 'text-orange-700', bg: 'bg-orange-50' },
    '61-90': { label: '61-90 días', color: 'text-red-700', bg: 'bg-red-50' },
    '90+': { label: '90+ días', color: 'text-red-900', bg: 'bg-red-100' },
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-slate-500" />
        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Control de Crédito Proveedores</span>
      </div>

      {summary && (
        <div className="grid grid-cols-5 gap-3">
          {(['current', '1-30', '31-60', '61-90', '90+'] as const).map(bucket => {
            const cfg = bucketCfg[bucket];
            return (
              <div key={bucket} className={`${cfg.bg} border border-slate-200 rounded-xl p-4`}>
                <p className={`text-[9px] font-semibold ${cfg.color} uppercase`}>{cfg.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{fmt(summary[bucket])}</p>
              </div>
            );
          })}
        </div>
      )}

      {summary && (
        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-slate-300" /><span className="text-sm font-medium">Total a Pagar</span></div>
          <span className="text-xl font-bold">{fmt(summary.total)}</span>
        </div>
      )}

      <div className="space-y-2">
        {supplierTotals.map(s => {
          const details = agingDetails.filter(a => a.id === s.id);
          const isExpanded = expandedSupplier === s.id;
          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50" onClick={() => setExpandedSupplier(isExpanded ? null : s.id)}>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="text-[9px] text-slate-500">{s.tax_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><p className="text-sm font-bold text-slate-900">{fmt(s.total_balance)}</p><p className="text-[9px] text-slate-500">Saldo</p></div>
                  {s.overdue_amount > 0 && <div className="text-right"><p className="text-xs font-bold text-red-600">{fmt(s.overdue_amount)}</p><p className="text-[9px] text-red-500">Vencido</p></div>}
                </div>
              </div>
              {isExpanded && details.length > 0 && (
                <div className="border-t border-slate-100 px-4 pb-4">
                  <table className="w-full mt-2">
                    <thead><tr className="border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Factura</th>
                      <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Monto</th>
                      <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Pagado</th>
                      <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Saldo</th>
                      <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Vencimiento</th>
                      <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Días</th>
                    </tr></thead>
                    <tbody>
                      {details.map((d: any) => {
                        const cfg = bucketCfg[d.aging_bucket] || bucketCfg.current;
                        return (
                          <tr key={d.invoice_id} className="border-b border-slate-50">
                            <td className="px-3 py-2 text-xs text-slate-900">{d.invoice_number}</td>
                            <td className="px-3 py-2 text-xs text-right text-slate-600">{fmt(d.total_amount)}</td>
                            <td className="px-3 py-2 text-xs text-right text-emerald-600">{fmt(d.paid_amount)}</td>
                            <td className="px-3 py-2 text-xs text-right font-bold text-slate-900">{fmt(d.balance)}</td>
                            <td className="px-3 py-2 text-xs text-right text-slate-600">{new Date(d.due_date).toLocaleDateString('es-CL')}</td>
                            <td className="px-3 py-2 text-right"><span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{d.days_overdue > 0 ? `${d.days_overdue}d` : 'OK'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        {supplierTotals.length === 0 && (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Sin facturas pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
