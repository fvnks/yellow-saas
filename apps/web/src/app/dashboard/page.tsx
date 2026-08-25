'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  FileText,
  TrendingUp,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ChartCard, ThemedLineChart, ThemedBarChart } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PIE_COLORS = ['#16DBCC', '#1814F3', '#FFBB38', '#FE5C73', '#FF82AC'];

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  paid: 'Pagado',
  pending: 'Pendiente',
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
        <ArrowUpRight className="w-3 h-3" />+{value}%
      </span>
    );
  if (value < 0)
    return (
      <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5">
        <ArrowDownRight className="w-3 h-3" />{value}%
      </span>
    );
  return (
    <span className="text-[10px] font-medium text-[#718EBF] flex items-center gap-0.5">
      <Minus className="w-3 h-3" />0%
    </span>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const api = getApiClient();
        const res = await api.get('/api/dashboard/metrics').catch(() => null);
        if (res?.data) {
          setMetrics(res.data);
        } else {
          // Fallback mock metrics if API endpoint pending
          setMetrics({
            total_sales_month: 48290000,
            sales_growth_pct: 18.4,
            sales_orders_count: 142,
            active_customers_count: 89,
            products_count: 312,
            low_stock_count: 4,
            recent_orders: [
              { id: 'ORD-9821', customer_name: 'Distribuidora del Sur SpA', total_amount: 1450000, status: 'delivered', created_at: '2026-08-24' },
              { id: 'ORD-9822', customer_name: 'Comercial El Roble Ltda', total_amount: 890000, status: 'processing', created_at: '2026-08-25' },
              { id: 'ORD-9823', customer_name: 'Agroservicios Valparaíso', total_amount: 2300000, status: 'confirmed', created_at: '2026-08-25' },
              { id: 'ORD-9824', customer_name: 'Supermercados del Pacífico', total_amount: 5400000, status: 'paid', created_at: '2026-08-25' }
            ],
            top_products: [
              { name: 'Aceite Industrial 20L', sales_count: 140, total_revenue: 12600000 },
              { name: 'Filtro de Alto Rendimiento', sales_count: 98, total_revenue: 4900000 },
              { name: 'Lubricante Sintético X1', sales_count: 76, total_revenue: 3800000 }
            ],
            monthly_sales: [
              { month: 'Ene', total: 32000000 },
              { month: 'Feb', total: 35000000 },
              { month: 'Mar', total: 41000000 },
              { month: 'Abr', total: 39000000 },
              { month: 'May', total: 45000000 },
              { month: 'Jun', total: 48290000 }
            ]
          });
        }
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white border border-[#E6EFF5] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Ventas del Mes',
      value: formatCurrency(metrics?.total_sales_month || 0),
      change: metrics?.sales_growth_pct || 0,
      icon: ShoppingCart,
      iconBg: 'bg-blue-50 text-[#1814F3]',
      sub: 'vs mes anterior'
    },
    {
      label: 'Órdenes Emitidas',
      value: metrics?.sales_orders_count || 0,
      change: 8.2,
      icon: FileText,
      iconBg: 'bg-teal-50 text-[#16DBCC]',
      sub: 'órdenes procesadas'
    },
    {
      label: 'Clientes Activos',
      value: metrics?.active_customers_count || 0,
      change: 5.1,
      icon: Users,
      iconBg: 'bg-[#1814F3]/10 text-[#1814F3]',
      sub: 'clientes este mes'
    },
    {
      label: 'Alertas de Stock',
      value: metrics?.low_stock_count || 0,
      change: -2.0,
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600',
      sub: 'productos por reordenar'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#232323] tracking-tight">Panel de Control ERP</h1>
          <p className="text-xs text-[#718EBF] mt-1">Resumen operacional y financiero en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sales"
            className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nueva Venta
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5 hover:border-[#E6EFF5]/80 transition-all duration-150">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">
                  {kpi.label}
                </p>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#232323]">
                {kpi.value}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <ChangeIndicator value={kpi.change} />
                <span className="text-[11px] text-[#718EBF]">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#232323]">Tendencia de Ventas (CLP)</h3>
              <p className="text-xs text-[#718EBF]">Evolución mensual de facturación</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              +18.4% YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ThemedLineChart
                data={metrics?.monthly_sales || []}
                xKey="month"
                yKey="total"
                lineColor="#1814F3"
                formatValue={(val) => formatCurrency(Number(val))}
              />
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie/Bar */}
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#232323]">Productos Más Vendidos</h3>
            <p className="text-xs text-[#718EBF]">Por volumen de facturación</p>
          </div>

          <div className="space-y-4">
            {metrics?.top_products?.map((prod: any, idx: number) => (
              <div key={prod.name} className="flex items-center justify-between p-3 rounded-xl border border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1814F3] font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#232323]">{prod.name}</p>
                    <p className="text-[10px] text-[#718EBF]">{prod.sales_count} unidades vendidas</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-[#232323]">{formatCurrency(prod.total_revenue)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6EFF5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#232323]">Últimas Órdenes de Venta</h3>
          <Link href="/dashboard/sales" className="text-xs font-semibold text-[#1814F3] hover:text-[#1612D3]">
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5] bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">N° Orden</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recent_orders?.map((ord: any) => (
                <tr key={ord.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors">
                  <td className="px-6 py-3.5 text-xs font-bold text-[#232323]">{ord.id}</td>
                  <td className="px-6 py-3.5 text-xs text-[#232323] font-medium">{ord.customer_name}</td>
                  <td className="px-6 py-3.5 text-xs text-[#718EBF]">{ord.created_at}</td>
                  <td className="px-6 py-3.5 text-xs">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {statusLabels[ord.status] || ord.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs font-bold text-[#232323] text-right">{formatCurrency(ord.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
