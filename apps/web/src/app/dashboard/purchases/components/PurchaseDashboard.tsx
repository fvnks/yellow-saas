'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, DollarSign, TrendingUp, Truck } from 'lucide-react';

export default function PurchaseDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/purchase-dashboard`)
      .then(r => r.json()).then(d => { setData(d.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  if (loading) return null;

  const kpis = data?.kpis || {};
  const maxTrend = Math.max(...(data?.monthlyTrend || []).map((t: any) => parseFloat(t.total)), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Dashboard de Compras</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Gasto Mensual</p>
              <p className="text-xl font-bold text-foreground mt-1">{fmt(kpis.monthlySpend || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpis.monthlyOrders || 0} órdenes</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Órdenes Abiertas</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{kpis.pendingOrders || 0}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Recepciones Pendientes</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">{kpis.pendingReceipts || 0}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-indigo-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Por Pagar</p>
              <p className="text-xl font-bold text-red-600 mt-1">{fmt(kpis.pendingPayments || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpis.pendingPaymentCount || 0} facturas</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-red-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Gasto Anual</p>
              <p className="text-xl font-bold text-foreground mt-1">{fmt(kpis.yearlySpend || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <h3 className="text-xs font-semibold text-foreground mb-3">Tendencia Mensual</h3>
          <div className="flex items-end gap-1 h-32">
            {(data?.monthlyTrend || []).slice(-12).map((t: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-500 rounded-t opacity-80" style={{ height: `${(parseFloat(t.total) / maxTrend) * 100}px` }}></div>
                <p className="text-[7px] text-muted-foreground mt-1">{monthNames[parseInt(t.month) - 1]?.substring(0, 3)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
          <h3 className="text-xs font-semibold text-foreground mb-3">Top Proveedores</h3>
          <div className="space-y-2">
            {(data?.topSuppliers || []).slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-foreground">{s.name}</span>
                <span className="text-xs font-bold text-foreground">{fmt(parseFloat(s.total_value))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
