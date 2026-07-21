'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingCart, Users, Package, CreditCard, TrendingUp, TrendingDown, 
  FolderKanban, AlertTriangle, BarChart3, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight, Minus, Warehouse
} from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
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
  if (value > 0) return <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="text-xs text-rose-600 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{value}%</span>;
  return <span className="text-xs text-slate-400 flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
}

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-3" />
              <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-72">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-4" />
              <div className="h-56 bg-slate-50 rounded animate-pulse" />
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
    { label: 'Ventas del Mes', value: formatCurrency(kpis.sales?.total || 0), sub: `${kpis.sales?.count || 0} órdenes`, change: kpis.sales?.change || 0, icon: ShoppingCart, color: 'indigo' },
    { label: 'Compras del Mes', value: formatCurrency(kpis.purchases?.total || 0), sub: `${kpis.purchases?.count || 0} órdenes`, change: kpis.purchases?.change || 0, icon: CreditCard, color: 'emerald' },
    { label: 'Clientes Nuevos', value: String(kpis.customers?.total || 0), sub: 'este mes', change: kpis.customers?.change || 0, icon: Users, color: 'amber' },
    { label: 'Productos', value: String(kpis.products?.total || 0), sub: `${kpis.products?.lowStock || 0} stock bajo`, change: 0, icon: Package, color: 'rose' },
    { label: 'Facturas', value: String(kpis.invoices?.pending || 0), sub: `pendientes de ${kpis.invoices?.total || 0}`, change: 0, icon: BarChart3, color: 'violet' },
    { label: 'Mermas', value: formatCurrency(kpis.mermas?.totalCost || 0), sub: `${kpis.mermas?.count || 0} registros`, change: 0, icon: AlertTriangle, color: 'amber' },
  ];

  const salesByDay = (charts.salesByDay || []).map((d: any) => ({ name: d.day, Ventas: parseInt(d.count), Monto: parseFloat(d.total) }));
  const purchasesByDay = (charts.purchasesByDay || []).map((d: any) => ({ name: d.day, Compras: parseInt(d.count), Monto: parseFloat(d.total) }));
  const salesByStatus = (charts.salesByStatus || []).map((d: any) => ({ name: statusLabels[d.status] || d.status, value: parseInt(d.count) }));
  const purchasesByStatus = (charts.purchasesByStatus || []).map((d: any) => ({ name: statusLabels[d.status] || d.status, value: parseInt(d.count) }));
  const customersByMonth = (charts.customersByMonth || []).reverse().map((d: any) => ({ name: d.month.split('-')[1], Clientes: parseInt(d.count) }));
  const topProducts = charts.topProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen general de tu empresa</p>
        </div>
        <Link href="/dashboard/sales" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Nueva Venta
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <div className={`w-8 h-8 bg-${kpi.color}-50 rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">{kpi.sub}</p>
              <ChangeIndicator value={kpi.change} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 - Sales & Purchases by Day */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Ventas del Mes</h3>
            <span className="text-xs text-slate-500">{kpis.sales?.count || 0} órdenes</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="Monto" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Compras del Mes</h3>
            <span className="text-xs text-slate-500">{kpis.purchases?.count || 0} órdenes</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchasesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="Monto" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Status & Customers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Estado Ventas</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Estado Compras</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={purchasesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {purchasesByStatus.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Clientes Nuevos</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="Clientes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Productos</h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Sin datos de ventas este mes</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{p.total_sold} u.</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Ventas Recientes</h3>
            <Link href="/dashboard/sales" className="text-[10px] text-slate-500 hover:text-slate-700">Ver todas</Link>
          </div>
          <div className="space-y-2">
            {(recent.sales || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin ventas recientes</p>
            ) : recent.sales.map((s: any) => (
              <Link key={s.id} href={`/dashboard/sales/${s.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-xs font-medium text-slate-900">{s.order_number || s.number}</p>
                  <p className="text-[10px] text-slate-400">{s.customer?.name || '—'}</p>
                </div>
                <span className="text-xs font-semibold text-slate-700">{formatCurrency(s.total || 0)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Compras Recientes</h3>
            <Link href="/dashboard/purchases" className="text-[10px] text-slate-500 hover:text-slate-700">Ver todas</Link>
          </div>
          <div className="space-y-2">
            {(recent.purchases || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin compras recientes</p>
            ) : recent.purchases.map((p: any) => (
              <Link key={p.id} href={`/dashboard/purchases/${p.id || p.number}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-xs font-medium text-slate-900">{p.number}</p>
                  <p className="text-[10px] text-slate-400">{p.supplier?.name || '—'}</p>
                </div>
                <span className="text-xs font-semibold text-slate-700">{formatCurrency(p.total_amount || 0)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
