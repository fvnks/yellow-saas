'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart, Users, Package, CreditCard, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import {
  ChartCard, ThemedLineChart, ThemedBarChart, ChartTooltip
} from '@/components/ui/chart';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from 'recharts';

const PIE_COLORS = ['#16DBCC', '#1814F3', '#FFBB38', '#FE5C73', '#FF82AC'];

const statusLabels: Record<string, string> = {
  draft: 'Borrador', confirmed: 'Confirmado', processing: 'Procesando',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  paid: 'Pagado', pending: 'Pendiente',
};

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return clpFormatter.format(amount);
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{value}%</span>;
  return <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
}

const salesMarkers = [
  { date: new Date(2026, 0, 1), icon: '🎯', title: 'Inicio de año', color: '#1814F3' },
  { date: new Date(2026, 5, 1), icon: '📊', title: 'Medio año', color: '#16DBCC' },
];

const kpiColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' },
  { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-purple-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const api = getApiClient();
    api.getDashboard()
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-2xl shadow-sm p-5 bg-card">
              <div className="h-4 w-20 bg-muted rounded animate-pulse mb-3" />
              <div className="h-8 w-28 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recent = data?.recent || {};

  const kpiCards = [
    { label: 'Ventas del Mes', value: formatCurrency(kpis.sales?.total || 0), sub: `${kpis.sales?.count || 0} órdenes`, change: kpis.sales?.change || 0, icon: ShoppingCart },
    { label: 'Compras del Mes', value: formatCurrency(kpis.purchases?.total || 0), sub: `${kpis.purchases?.count || 0} órdenes`, change: kpis.purchases?.change || 0, icon: CreditCard },
    { label: 'Clientes Nuevos', value: String(kpis.customers?.total || 0), sub: 'este mes', change: kpis.customers?.change || 0, icon: Users },
    { label: 'Productos', value: String(kpis.products?.total || 0), sub: `${kpis.products?.lowStock || 0} stock bajo`, change: 0, icon: Package },
    { label: 'Facturas', value: String(kpis.invoices?.pending || 0), sub: `pendientes de ${kpis.invoices?.total || 0}`, change: 0, icon: BarChart3 },
    { label: 'Mermas', value: formatCurrency(kpis.mermas?.totalCost || 0), sub: `${kpis.mermas?.count || 0} registros`, change: 0, icon: AlertTriangle },
  ];

  const salesByDay = (charts.salesByDay || []).map((d: any) => ({ name: d.day, Ventas: parseInt(d.count), Monto: parseFloat(d.total) }));
  const purchasesByDay = (charts.purchasesByDay || []).map((d: any) => ({ name: d.day, Compras: parseInt(d.count), Monto: parseFloat(d.total) }));
  const salesByStatus = (charts.salesByStatus || []).map((d: any) => ({ name: statusLabels[d.status] || d.status, value: parseInt(d.count) }));
  const purchasesByStatus = (charts.purchasesByStatus || []).map((d: any) => ({ name: statusLabels[d.status] || d.status, value: parseInt(d.count) }));
  const customersByMonth = (charts.customersByMonth || []).reverse().map((d: any) => ({ name: d.month.split('-')[1], Clientes: parseInt(d.count) }));
  const topProducts = charts.topProducts || [];

  return (
    <div className="space-y-6 pt-4">
      {/* Header with Sun Yellow Accent & Quick DTE Actions */}
      <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Dashboard Operativo ERP</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FACC15] text-slate-950">
              PYME Chile
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">Resumen financiero, facturación SII, inventario y ventas en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/sales/new" className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Nueva Factura SII
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const colors = kpiColors[i % kpiColors.length];
          const staggerClass = i === 0 ? 'stagger-1' : i === 1 ? 'stagger-2' : i === 2 ? 'stagger-3' : 'stagger-4';
          return (
            <div key={kpi.label} className={`animate-fade-in-up ${staggerClass} group border border-border rounded-2xl shadow-sm p-5 bg-card hover:border-slate-300 hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${colors.text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>
                <ChangeIndicator value={kpi.change} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 - Sales & Purchases */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ventas del Mes"
          subtitle={`${kpis.sales?.count || 0} órdenes · ${formatCurrency(kpis.sales?.total || 0)}`}
          action={
            <Link href="/dashboard/sales" className="text-[10px] text-muted-foreground hover:text-foreground">
              Ver todas →
            </Link>
          }
        >
          <ThemedLineChart
            data={salesByDay}
            lines={[{ dataKey: 'Monto', color: '#1814F3' }]}
            markers={salesMarkers}
            formatter={(v) => [formatCurrency(v), 'Monto']}
          />
        </ChartCard>

        <ChartCard
          title="Compras del Mes"
          subtitle={`${kpis.purchases?.count || 0} órdenes · ${formatCurrency(kpis.purchases?.total || 0)}`}
          action={
            <Link href="/dashboard/purchases" className="text-[10px] text-muted-foreground hover:text-foreground">
              Ver todas →
            </Link>
          }
        >
          <ThemedBarChart
            data={purchasesByDay}
            bars={[{ dataKey: 'Monto', color: '#16DBCC' }]}
            formatter={(v) => [formatCurrency(v), 'Monto']}
          />
        </ChartCard>
      </div>

      {/* Charts Row 2 - Status & Customers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Estado Ventas">
          <ResponsiveContainer width="100%" height={224}>
            <PieChart>
              <Pie data={salesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {salesByStatus.map((item: any, i: number) => (
                  <Cell key={item.name || `sale-status-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estado Compras">
          <ResponsiveContainer width="100%" height={224}>
            <PieChart>
              <Pie data={purchasesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {purchasesByStatus.map((item: any, i: number) => (
                  <Cell key={item.name || `purchase-status-${i}`} fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Clientes Nuevos" subtitle="Últimos 6 meses">
          <ThemedLineChart
            data={customersByMonth}
            lines={[{ dataKey: 'Clientes', color: '#FFBB38' }]}
            formatter={(v) => [String(v), 'Clientes']}
          />
        </ChartCard>
      </div>

      {/* Charts Row 3 - Top Products & Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Top Productos" subtitle="Más vendidos este mes">
          {topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin datos de ventas este mes</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={p.id || p.sku || `top-prod-${i}`} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-foreground w-5 group-hover/item:text-amber-500 transition-colors">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-foreground font-mono">{p.total_sold} u.</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Ventas Recientes"
          action={
            <Link href="/dashboard/sales" className="text-[10px] text-muted-foreground hover:text-foreground">
              Ver todas →
            </Link>
          }
        >
          <div className="space-y-2">
            {(recent.sales || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin ventas recientes</p>
            ) : recent.sales.map((s: any) => (
              <Link key={s.id} href={`/dashboard/sales/${s.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-all duration-200">
                <div>
                  <p className="text-xs font-medium text-foreground">{s.order_number || s.number}</p>
                  <p className="text-[10px] text-muted-foreground">{s.customer?.name || '—'}</p>
                </div>
                <span className="text-xs font-semibold text-foreground">{formatCurrency(s.total || 0)}</span>
              </Link>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Compras Recientes"
          action={
            <Link href="/dashboard/purchases" className="text-[10px] text-muted-foreground hover:text-foreground">
              Ver todas →
            </Link>
          }
        >
          <div className="space-y-2">
            {(recent.purchases || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin compras recientes</p>
            ) : recent.purchases.map((p: any) => (
              <Link key={p.id} href={`/dashboard/purchases/${p.id || p.number}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-all duration-200">
                <div>
                  <p className="text-xs font-medium text-foreground">{p.number}</p>
                  <p className="text-[10px] text-muted-foreground">{p.supplier?.name || '—'}</p>
                </div>
                <span className="text-xs font-semibold text-foreground">{formatCurrency(p.total_amount || 0)}</span>
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
