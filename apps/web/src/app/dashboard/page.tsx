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

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

const statusLabels: Record<string, string> = {
  draft: 'Borrador', confirmed: 'Confirmado', processing: 'Procesando',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  paid: 'Pagado', pending: 'Pendiente',
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{value}%</span>;
  return <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
}

const salesMarkers = [
  { date: new Date(2026, 0, 1), icon: '🎯', title: 'Inicio de año', color: '#6366f1' },
  { date: new Date(2026, 5, 1), icon: '📊', title: 'Medio año', color: '#10b981' },
];

const kpiColors = [
  { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-100 dark:ring-indigo-500/20' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-500/20' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-500/20' },
  { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-500/20' },
  { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-500/20' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-500/20' },
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
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 bg-white dark:bg-slate-900">
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-3" />
              <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Resumen general de tu empresa</p>
        </div>
        <Link href="/dashboard/sales" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
          Nueva Venta
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const colors = kpiColors[i % kpiColors.length];
          return (
            <div key={i} className="group border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 bg-white dark:bg-slate-900 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center ring-1 ${colors.ring}`}>
                  <kpi.icon className={`w-4 h-4 ${colors.text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{kpi.sub}</p>
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
            <Link href="/dashboard/sales" className="text-[10px] text-slate-500 hover:text-slate-700">
              Ver todas →
            </Link>
          }
        >
          <ThemedLineChart
            data={salesByDay}
            lines={[{ dataKey: 'Monto', color: '#6366f1' }]}
            markers={salesMarkers}
            formatter={(v) => [formatCurrency(v), 'Monto']}
          />
        </ChartCard>

        <ChartCard
          title="Compras del Mes"
          subtitle={`${kpis.purchases?.count || 0} órdenes · ${formatCurrency(kpis.purchases?.total || 0)}`}
          action={
            <Link href="/dashboard/purchases" className="text-[10px] text-slate-500 hover:text-slate-700">
              Ver todas →
            </Link>
          }
        >
          <ThemedBarChart
            data={purchasesByDay}
            bars={[{ dataKey: 'Monto', color: '#10b981' }]}
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
                {salesByStatus.map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
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
                {purchasesByStatus.map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]} />
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
            lines={[{ dataKey: 'Clientes', color: '#f59e0b' }]}
            formatter={(v) => [String(v), 'Clientes']}
          />
        </ChartCard>
      </div>

      {/* Charts Row 3 - Top Products & Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Top Productos" subtitle="Más vendidos este mes">
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Sin datos de ventas este mes</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-5 group-hover/item:text-amber-500 transition-colors">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{p.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p.total_sold} u.</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Ventas Recientes"
          action={
            <Link href="/dashboard/sales" className="text-[10px] text-slate-500 hover:text-slate-700">
              Ver todas →
            </Link>
          }
        >
          <div className="space-y-2">
            {(recent.sales || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin ventas recientes</p>
            ) : recent.sales.map((s: any) => (
              <Link key={s.id} href={`/dashboard/sales/${s.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{s.order_number || s.number}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.customer?.name || '—'}</p>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(s.total || 0)}</span>
              </Link>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Compras Recientes"
          action={
            <Link href="/dashboard/purchases" className="text-[10px] text-slate-500 hover:text-slate-700">
              Ver todas →
            </Link>
          }
        >
          <div className="space-y-2">
            {(recent.purchases || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin compras recientes</p>
            ) : recent.purchases.map((p: any) => (
              <Link key={p.id} href={`/dashboard/purchases/${p.id || p.number}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{p.number}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{p.supplier?.name || '—'}</p>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(p.total_amount || 0)}</span>
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
