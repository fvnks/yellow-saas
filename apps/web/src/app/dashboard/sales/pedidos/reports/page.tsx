'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Package, Users, Warehouse, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  picking: number;
  completed: number;
  cancelled: number;
  urgent: number;
  high_priority: number;
}

interface WarehouseStat {
  warehouse_name: string;
  order_count: number;
  item_count: number;
}

interface TopProduct {
  product_name: string;
  sku: string;
  total_qty: number;
  order_count: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

interface RequesterStat {
  requester_name: string;
  order_count: number;
}

export default function PedidosReportsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [byWarehouse, setByWarehouse] = useState<WarehouseStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [byRequester, setByRequester] = useState<RequesterStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/internal-orders/reports`)
      .then(r => r.json())
      .then(d => {
        const data = d.data;
        setStats(data.stats);
        setByWarehouse(data.byWarehouse || []);
        setTopProducts(data.topProducts || []);
        setMonthly(data.monthly || []);
        setByRequester(data.byRequester || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-sm text-muted-foreground">Cargando informes...</div>;
  if (!stats) return <div className="text-center py-12 text-sm text-muted-foreground">Sin datos</div>;

  const totalOrders = stats.total || 1;
  const completionRate = ((stats.completed / totalOrders) * 100).toFixed(1);
  const cancelRate = ((stats.cancelled / totalOrders) * 100).toFixed(1);
  const maxMonthly = Math.max(...monthly.map(m => m.count), 1);

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/dashboard/sales/pedidos')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
      </button>

      <div>
        <h1 className="text-xl font-bold text-foreground">Informes de Pedidos Internos</h1>
        <p className="text-sm text-muted-foreground mt-1">Análisis de solicitudes internas de bodega</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Pedidos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center"><Package className="w-6 h-6 text-slate-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tasa de Completado</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.completed} completados</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending + stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Urgentes</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{stats.urgent}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Distribución por Estado</h3>
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Borrador', count: stats.draft, color: 'bg-muted text-slate-600' },
            { label: 'Pendiente', count: stats.pending, color: 'bg-amber-50 text-amber-600' },
            { label: 'Aprobado', count: stats.approved, color: 'bg-blue-50 text-blue-600' },
            { label: 'Despacho', count: stats.picking, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Completado', count: stats.completed, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Cancelado', count: stats.cancelled, color: 'bg-rose-50 text-rose-600' },
          ].map(item => (
            <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-xs mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tendencia Mensual</h3>
          <div className="space-y-2">
            {monthly.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            ) : monthly.map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{m.month}</span>
                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(m.count / maxMonthly) * 100}%` }} />
                </div>
                <span className="text-xs text-foreground w-8 text-right">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Warehouse */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Por Bodega</h3>
          <div className="space-y-3">
            {byWarehouse.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            ) : byWarehouse.map((w, i) => (
              <div key={w.warehouse_name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><Warehouse className="w-4 h-4 text-indigo-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{w.warehouse_name}</p>
                  <p className="text-xs text-muted-foreground">{w.item_count} items</p>
                </div>
                <span className="text-sm font-medium text-foreground">{w.order_count} pedidos</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Productos Más Solicitados</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            ) : topProducts.map((p, i) => (
              <div key={p.sku} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.product_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{p.total_qty} uds</p>
                  <p className="text-xs text-muted-foreground">{p.order_count} pedidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Requesters */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Solicitantes</h3>
          <div className="space-y-3">
            {byRequester.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            ) : byRequester.map((r, i) => (
              <div key={r.requester_name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.requester_name || 'Sin asignar'}</p>
                </div>
                <span className="text-sm font-medium text-foreground">{r.order_count} pedidos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
