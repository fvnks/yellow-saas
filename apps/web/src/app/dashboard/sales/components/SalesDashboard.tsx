'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Truck, AlertTriangle, Package, Users, BarChart3, Minus } from 'lucide-react';

interface KPI {
  monthlySales: number;
  monthlyOrders: number;
  monthlyInvoiced: number;
  pendingDeliveries: number;
  overdueInvoices: number;
  overdueAmount: number;
  pendingCollections: number;
  yearlySales: number;
  salesGrowth: number;
}

interface DashboardData {
  kpis: KPI;
  topProducts: any[];
  topCustomers: any[];
  monthlyTrend: any[];
  statusBreakdown: any[];
}

export default function SalesDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/sales-dashboard`);
      if (res.ok) { const json = await res.json(); setData(json.data); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatMoney = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  if (loading) return null;
  if (!data) return null;

  const { kpis, topProducts, topCustomers, monthlyTrend, statusBreakdown } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Dashboard de Ventas</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ventas del Mes</span>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatMoney(kpis.monthlySales)}</p>
          <div className="flex items-center gap-1 mt-2">
            {kpis.salesGrowth > 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : kpis.salesGrowth < 0 ? <TrendingDown className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className={`text-xs font-medium ${kpis.salesGrowth > 0 ? 'text-emerald-600' : kpis.salesGrowth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {Math.abs(kpis.salesGrowth).toFixed(1)}% vs mes anterior
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-5 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Órdenes del Mes</span>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{kpis.monthlyOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">{formatMoney(kpis.monthlyInvoiced)} facturados</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-5 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Despachos Pendientes</span>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{kpis.pendingDeliveries}</p>
          <p className="text-xs text-muted-foreground mt-2">en tránsito o pendientes</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-5 dark:bg-primary dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Facturas Vencidas</span>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{kpis.overdueInvoices}</p>
          <p className="text-xs text-red-600 mt-2">{formatMoney(kpis.overdueAmount)} por cobrar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-foreground">Top Productos (Año)</h3>
          </div>
          <div className="p-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{p.name}</p>
                        <p className="text-[9px] text-muted-foreground">{p.sku} | {p.total_qty} uds</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground">{formatMoney(p.total_value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-foreground">Top Clientes (Año)</h3>
          </div>
          <div className="p-4">
            {topCustomers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{c.name}</p>
                        <p className="text-[9px] text-muted-foreground">{c.order_count} órdenes</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground">{formatMoney(c.total_value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-foreground">Tendencia Mensual (12 meses)</h3>
          </div>
          <div className="p-4">
            {monthlyTrend.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {monthlyTrend.map((m, i) => {
                  const maxVal = Math.max(...monthlyTrend.map((x: any) => parseFloat(x.total)));
                  const height = maxVal > 0 ? (parseFloat(m.total) / maxVal) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-indigo-400 rounded-t" style={{ height: `${Math.max(4, height)}%` }} />
                      <span className="text-[7px] text-muted-foreground">{new Date(m.month).toLocaleDateString('es-CL', { month: 'short' })}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-foreground">Órdenes por Estado (Año)</h3>
          </div>
          <div className="p-4">
            {statusBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {statusBreakdown.map((s, i) => {
                  const total = statusBreakdown.reduce((sum: number, x: any) => sum + parseInt(x.count), 0);
                  const pct = total > 0 ? (parseInt(s.count) / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    draft: 'bg-slate-400', confirmed: 'bg-blue-500', processing: 'bg-amber-500',
                    shipped: 'bg-indigo-500', delivered: 'bg-emerald-500', cancelled: 'bg-red-400', invoiced: 'bg-purple-500'
                  };
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground capitalize">{s.status}</span>
                        <span className="text-xs font-medium text-slate-600">{s.count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[s.status] || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
