'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart, Users, Package, CreditCard,
  ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, FileText,
  Receipt, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { formatCLP } from '@/lib/format';
import {
  ThemedLineChart, ThemedBarChart
} from '@/components/ui/chart';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from 'recharts';

const PIE_COLORS = ['#6161FF', '#ccccff', '#10B981', '#F43F5E', '#d0ecf5'];

const statusLabels: Record<string, string> = {
  draft: 'Borrador', confirmed: 'Confirmado SII', processing: 'En Proceso',
  shipped: 'Despachado', delivered: 'Entregado', cancelled: 'Anulado',
  paid: 'Pagado', pending: 'Pendiente SII',
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M CLP`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K CLP`;
  return formatCLP(amount);
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="text-[10px] font-bold text-forest bg-mint/30 px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-mint/50"><ArrowUpRight className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="text-[10px] font-bold text-[#c64d00] bg-peach/30 px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-peach/50"><ArrowDownRight className="w-3 h-3" />{value}%</span>;
  return <span className="text-[10px] font-medium text-iron bg-cloud px-2 py-0.5 rounded-md flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
}

const salesMarkers = [
  { date: new Date(2026, 0, 1), icon: '🎯', title: 'Inicio de año', color: '#6161FF' },
  { date: new Date(2026, 5, 1), icon: '📊', title: 'Medio año', color: '#ccccff' },
];

const kpiStyles = [
  { bg: 'bg-periwinkle', text: 'text-monday-violet', border: 'hover:border-monday-violet/30' },
  { bg: 'bg-sky-accent/30', text: 'text-[#006680]', border: 'hover:border-sky-accent' },
  { bg: 'bg-lavender', text: 'text-[#7c3aed]', border: 'hover:border-lavender' },
  { bg: 'bg-mint/30', text: 'text-forest', border: 'hover:border-mint' },
  { bg: 'bg-peach/30', text: 'text-[#c64d00]', border: 'hover:border-peach' },
  { bg: 'bg-cotton-candy/20', text: 'text-[#9333ea]', border: 'hover:border-cotton-candy' },
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
      <div className="space-y-6 pt-4 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-mist rounded-xl animate-pulse" />
            <div className="h-4 w-72 bg-mist rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={`skel-${i}`} className="border border-mist rounded-3xl shadow-card p-5 bg-snow">
              <div className="h-4 w-20 bg-cloud rounded animate-pulse mb-3" />
              <div className="h-8 w-28 bg-cloud rounded animate-pulse" />
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
    { label: 'Ventas del Mes', value: formatCurrency(kpis.sales?.total || 0), sub: `${kpis.sales?.count || 0} facturas DTE`, change: kpis.sales?.change || 0, icon: ShoppingCart },
    { label: 'Compras del Mes', value: formatCurrency(kpis.purchases?.total || 0), sub: `${kpis.purchases?.count || 0} órdenes`, change: kpis.purchases?.change || 0, icon: CreditCard },
    { label: 'Clientes Activos', value: String(kpis.customers?.total || 0), sub: 'base de clientes', change: kpis.customers?.change || 0, icon: Users },
    { label: 'Catálogo Productos', value: String(kpis.products?.total || 0), sub: `${kpis.products?.lowStock || 0} alerta stock`, change: 0, icon: Package },
    { label: 'Facturas Pendientes', value: String(kpis.invoices?.pending || 0), sub: `de ${kpis.invoices?.total || 0} emitidas`, change: 0, icon: FileText },
    { label: 'Control Mermas', value: formatCurrency(kpis.mermas?.totalCost || 0), sub: `${kpis.mermas?.count || 0} eventos`, change: 0, icon: AlertTriangle },
  ];

  const salesByDay = (charts.salesByDay || []).map((d: any) => ({ name: d.day, Ventas: parseInt(d.count), Monto: parseFloat(d.total) }));
  const purchasesByDay = (charts.purchasesByDay || []).map((d: any) => ({ name: d.day, Compras: parseInt(d.count), Monto: parseFloat(d.total) }));
  const salesByStatus = (charts.salesByStatus || []).map((d: any) => ({ name: statusLabels[d.status] || d.status, value: parseInt(d.count) }));
  const purchasesByStatus = (charts.purchasesByStatus || []).map((d: any) => ({ name: statusLabels[d.status] || d.status, value: parseInt(d.count) }));
  const customersByMonth = (charts.customersByMonth || []).reverse().map((d: any) => ({ name: d.month.split('-')[1], Clientes: parseInt(d.count) }));
  const topProducts = charts.topProducts || [];

  return (
    <div className="space-y-6 pt-2 animate-fade-in-up">
      {/* Signature Banner: monday.com ERP */}
      <div className="relative overflow-hidden bg-snow text-ink p-6 sm:p-8 rounded-3xl shadow-card border border-mist">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-monday-violet/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-black bg-monday-violet text-white uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-white" /> Yellow ERP
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-mint/30 text-forest border border-mint/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Certificación SII Activa
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-ink tracking-[-0.02em]">
              Centro Operativo Financiero & Facturación SII
            </h1>
            <p className="text-sm text-slate-text max-w-2xl leading-relaxed">
              Control centralizado de caja, inventario en tiempo real, emisión de DTEs y recepción automatizada de proveedores para PYMEs chilenas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/dashboard/sales/new" className="bg-monday-violet hover:bg-monday-violet-hover text-white font-medium px-4 py-2.5 rounded-[160px] text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Emitir Factura DTE
            </Link>
            <Link href="/dashboard/purchases/new" className="bg-snow border border-mist hover:bg-cloud text-ink font-medium px-4 py-2.5 rounded-[160px] text-sm transition-all duration-150 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-monday-violet" />
              Nueva Compra
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const style = kpiStyles[i % kpiStyles.length];
          const staggerClass = `stagger-${(i % 4) + 1}`;
          return (
            <div key={kpi.label} className={`animate-fade-in-up ${staggerClass} group bg-snow border border-mist ${style.border} rounded-3xl shadow-card p-5 hover:shadow-card-hover transition-all duration-200 ease-out hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-extrabold text-iron uppercase tracking-wider">{kpi.label}</p>
                <div className={`w-9 h-9 ${style.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <kpi.icon className={`w-4 h-4 ${style.text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-ink tracking-tight font-mono">{kpi.value}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-mist">
                <p className="text-[11px] font-medium text-iron truncate">{kpi.sub}</p>
                <ChangeIndicator value={kpi.change} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 - Sales & Purchases */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-mist pb-4">
            <div>
              <h3 className="text-base font-semibold text-ink">Flujo de Ventas (CLP)</h3>
              <p className="text-xs text-iron">{kpis.sales?.count || 0} órdenes aprobadas en el periodo</p>
            </div>
            <Link href="/dashboard/sales" className="text-xs font-semibold text-monday-violet hover:text-monday-violet-hover flex items-center gap-1">
              Ver DTEs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ThemedLineChart
            data={salesByDay}
            lines={[{ dataKey: 'Monto', color: '#6161FF' }]}
            markers={salesMarkers}
            formatter={(v) => [formatCurrency(v), 'Monto']}
          />
        </div>

        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-mist pb-4">
            <div>
              <h3 className="text-base font-semibold text-ink">Compras & Recepción de Stock</h3>
              <p className="text-xs text-iron">{kpis.purchases?.count || 0} órdenes registradas</p>
            </div>
            <Link href="/dashboard/purchases" className="text-xs font-semibold text-slate-text hover:text-ink flex items-center gap-1">
              Ver Compras <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ThemedBarChart
            data={purchasesByDay}
            bars={[{ dataKey: 'Monto', color: '#ccccff' }]}
            formatter={(v) => [formatCurrency(v), 'Monto']}
          />
        </div>
      </div>

      {/* Charts Row 2 - Status & Customers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-semibold text-ink mb-1">Estado de DTEs SII (Ventas)</h3>
          <p className="text-xs text-iron mb-4">Desglose de documentos emitidos</p>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={salesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {salesByStatus.map((item: any, i: number) => (
                  <Cell key={item.name || `sale-status-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-semibold text-ink mb-1">Estado Recepción Compras</h3>
          <p className="text-xs text-iron mb-4">Órdenes de compra y recepción</p>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={purchasesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {purchasesByStatus.map((item: any, i: number) => (
                  <Cell key={item.name || `purchase-status-${i}`} fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-semibold text-ink mb-1">Evolución de Clientes</h3>
          <p className="text-xs text-iron mb-4">Incorporación mensual de cuentas</p>
          <ThemedLineChart
            data={customersByMonth}
            lines={[{ dataKey: 'Clientes', color: '#10B981' }]}
            formatter={(v) => [String(v), 'Clientes']}
          />
        </div>
      </div>

      {/* Row 3 - Top Products & Recent SII DTE Movements */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6 space-y-4">
          <div className="border-b border-mist pb-3">
            <h3 className="text-sm font-semibold text-ink">Top Productos Más Vendidos</h3>
            <p className="text-xs text-iron">Ranking por unidades este mes</p>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-iron text-center py-8">Sin datos registrados</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={p.id || p.sku || `top-prod-${i}`} className="flex items-center justify-between p-2 rounded-xl hover:bg-cloud transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-periwinkle text-monday-violet font-bold text-xs flex items-center justify-center">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{p.name}</p>
                      <p className="text-[10px] text-iron font-mono">{p.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink font-mono">{p.total_sold} u.</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-mist pb-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">Ventas DTE Recientes</h3>
              <p className="text-xs text-iron">Últimas emisiones SII</p>
            </div>
            <Link href="/dashboard/sales" className="text-xs font-medium text-monday-violet hover:text-monday-violet-hover">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {(recent.sales || []).length === 0 ? (
              <p className="text-xs text-iron text-center py-6">Sin ventas recientes</p>
            ) : recent.sales.map((s: any) => (
              <Link key={s.id} href={`/dashboard/sales/${s.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-cloud border border-transparent hover:border-mist transition-all">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-ink font-mono">{s.order_number || s.number}</p>
                    <span className="text-[9px] font-semibold bg-mint/30 text-forest border border-mint/50 px-1.5 py-0.2 rounded-md">DTE SII</span>
                  </div>
                  <p className="text-[11px] text-iron truncate max-w-[160px]">{s.customer?.name || 'Cliente Contado'}</p>
                </div>
                <span className="text-xs font-bold text-ink font-mono">{formatCurrency(s.total || 0)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-snow border border-mist rounded-3xl shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-mist pb-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">Compras Recientes</h3>
              <p className="text-xs text-iron">Recepción de proveedores</p>
            </div>
            <Link href="/dashboard/purchases" className="text-xs font-medium text-slate-text hover:text-ink">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {(recent.purchases || []).length === 0 ? (
              <p className="text-xs text-iron text-center py-6">Sin compras recientes</p>
            ) : recent.purchases.map((p: any) => (
              <Link key={p.id} href={`/dashboard/purchases/${p.id || p.number}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-cloud border border-transparent hover:border-mist transition-all">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-ink font-mono">{p.number}</p>
                  <p className="text-[11px] text-iron truncate max-w-[160px]">{p.supplier?.name || 'Proveedor'}</p>
                </div>
                <span className="text-xs font-bold text-ink font-mono">{formatCurrency(p.total_amount || 0)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
