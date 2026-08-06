'use client';

import { useState, useEffect } from 'react';
import { Search, DollarSign, AlertTriangle, Clock, TrendingDown, Users, FileText } from 'lucide-react';
import { Badge } from '@yellow-erp/ui';

const agingLabels: Record<string, { label: string; color: string }> = {
  current: { label: 'Corriente', color: 'text-emerald-600' },
  '1-30': { label: '1-30 días', color: 'text-amber-600' },
  '31-60': { label: '31-60 días', color: 'text-orange-600' },
  '61-90': { label: '61-90 días', color: 'text-rose-600' },
  '90+': { label: '90+ días', color: 'text-rose-800' },
};

export default function CobranzaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/credit-control`)
      .then(r => r.json())
      .then(res => setData(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || {};
  const customerTotals = data?.customerTotals || [];
  const aging = data?.aging || [];

  const filteredCustomers = customerTotals.filter((c: any) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.tax_id?.includes(search)
  );

  const customerInvoices = selectedCustomer
    ? aging.filter((a: any) => a.id === selectedCustomer)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cobranza</h1>
        <p className="text-sm text-muted-foreground mt-1">Control de cuentas por cobrar y aging de clientes</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse"><div className="h-12 bg-muted rounded" /></div>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Corriente</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">${(summary.current || 0).toLocaleString('es-CL')}</p>
                </div>
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">1-30 días</p>
                  <p className="text-lg font-bold text-amber-600 mt-1">${(summary['1-30'] || 0).toLocaleString('es-CL')}</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">31-60 días</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">${(summary['31-60'] || 0).toLocaleString('es-CL')}</p>
                </div>
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">61-90 días</p>
                  <p className="text-lg font-bold text-rose-600 mt-1">${(summary['61-90'] || 0).toLocaleString('es-CL')}</p>
                </div>
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">90+ días</p>
                  <p className="text-lg font-bold text-rose-800 mt-1">${(summary['90+'] || 0).toLocaleString('es-CL')}</p>
                </div>
                <DollarSign className="w-5 h-5 text-rose-700" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-foreground">Clientes con Deuda</h3>
                </div>
                <div className="p-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                  </div>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>
                    ) : filteredCustomers.map((c: any) => (
                      <button key={c.id} onClick={() => setSelectedCustomer(c.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${selectedCustomer === c.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-muted border border-transparent'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.tax_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-foreground">${parseFloat(c.total_balance).toLocaleString('es-CL')}</p>
                            {c.overdue_count > 0 && (
                              <p className="text-[10px] text-rose-600">{c.overdue_count} vencida{c.overdue_count > 1 ? 's' : ''}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedCustomer ? 'Facturas del Cliente' : 'Detalle de Aging'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Factura</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Saldo</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Vencimiento</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Días</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Aging</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCustomer ? customerInvoices : aging.slice(0, 20)).length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">Sin facturas pendientes</td></tr>
                      ) : (selectedCustomer ? customerInvoices : aging.slice(0, 20)).map((row: any, i: number) => {
                        const agingInfo = agingLabels[row.aging_bucket] || { label: row.aging_bucket, color: 'text-slate-600' };
                        return (
                          <tr key={i} className="border-b border-slate-100 hover:bg-muted transition-colors">
                            <td className="px-4 py-3 text-xs font-medium text-foreground">{row.name}</td>
                            <td className="px-4 py-3 text-xs font-mono text-foreground">{row.invoice_number}</td>
                            <td className="px-4 py-3 text-xs text-foreground text-right font-medium">${parseFloat(row.balance).toLocaleString('es-CL')}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{row.due_date?.split('T')[0]}</td>
                            <td className="px-4 py-3 text-xs text-center">
                              <span className={`font-medium ${row.days_overdue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {row.days_overdue > 0 ? row.days_overdue : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-semibold ${agingInfo.color}`}>{agingInfo.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
