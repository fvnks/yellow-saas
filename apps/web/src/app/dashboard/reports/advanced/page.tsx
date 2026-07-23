'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';

interface ReportData {
  sales_by_month: { month: string; total: number }[];
  top_products: { name: string; sku: string; quantity: number; revenue: number }[];
  inventory_value: { warehouse: string; total_cost: number; items: number }[];
  customer_balances: { name: string; balance: number; aging: string }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      // Parallel fetch
      const [salesRes, productsRes, stockRes, customersRes] = await Promise.all([
        api.getSalesOrders({ limit: '100' }),
        api.getProducts({ limit: '20' }),
        api.getStockLevels({ limit: '100' }),
        api.getCustomers({ limit: '50' }),
      ]);

      // Process sales by month
      const salesByMonth: Record<string, number> = {};
      (salesRes.data || []).forEach((order: any) => {
        const date = new Date(order.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        salesByMonth[key] = (salesByMonth[key] || 0) + (order.total || 0);
      });

      const sales_by_month = Object.entries(salesByMonth)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      // Top products
      const top_products = (productsRes.data || [])
        .map((p: any) => ({
          name: p.name,
          sku: p.sku,
          quantity: p.stock || 0,
          revenue: (p.sale_price || 0) * (p.stock || 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Inventory value by warehouse
      const warehouseValue: Record<string, { total_cost: number; items: number }> = {};
      (stockRes.data || []).forEach((sl: any) => {
        const wh = sl.warehouse?.name || 'Sin bodega';
        if (!warehouseValue[wh]) warehouseValue[wh] = { total_cost: 0, items: 0 };
        warehouseValue[wh].total_cost += (sl.quantity || 0) * (sl.product?.cost_price || 0);
        warehouseValue[wh].items += 1;
      });

      const inventory_value = Object.entries(warehouseValue).map(([warehouse, data]) => ({
        warehouse,
        ...data,
      }));

      // Customer balances
      const customer_balances = (customersRes.data || [])
        .map((c: any) => ({
          name: c.name,
          balance: c.credit_limit || 0,
          aging: 'Current',
        }))
        .filter((c: any) => c.balance > 0)
        .sort((a: any, b: any) => b.balance - a.balance)
        .slice(0, 10);

      setData({ sales_by_month, top_products, inventory_value, customer_balances });
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const tabs = [
    { id: 'sales', label: 'Ventas', icon: TrendingUp },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'inventory', label: 'Inventario', icon: BarChart3 },
    { id: 'customers', label: 'Clientes', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Analisis y metricas del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="week">Ultima semana</option>
            <option value="month">Ultimo mes</option>
            <option value="quarter">Ultimo trimestre</option>
            <option value="year">Ultimo año</option>
          </select>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <ContinuousTabs
          tabs={tabs.map(t => ({ id: t.id, label: t.label }))}
          defaultActiveId={activeTab}
          onChange={(id) => setActiveTab(id)}
        />

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !data ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500">No hay datos disponibles</p>
            </div>
          ) : (
            <>
              {/* Sales Tab */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">Ventas del Mes</p>
                      <p className="text-2xl font-bold text-emerald-800 mt-1">
                        {formatCurrency(data.sales_by_month[data.sales_by_month.length - 1]?.total || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider">Promedio Mensual</p>
                      <p className="text-2xl font-bold text-blue-800 mt-1">
                        {formatCurrency(
                          data.sales_by_month.reduce((sum, m) => sum + m.total, 0) / (data.sales_by_month.length || 1)
                        )}
                      </p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                      <p className="text-[9px] font-semibold text-indigo-600 uppercase tracking-wider">Total Periodo</p>
                      <p className="text-2xl font-bold text-indigo-800 mt-1">
                        {formatCurrency(data.sales_by_month.reduce((sum, m) => sum + m.total, 0))}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-700 mb-3">Ventas por mes</p>
                    <div className="flex items-end gap-2 h-40">
                      {data.sales_by_month.map((item) => {
                        const maxVal = Math.max(...data.sales_by_month.map(m => m.total));
                        const height = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                        return (
                          <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[8px] text-slate-500">{formatCurrency(item.total)}</span>
                            <div
                              className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                            <span className="text-[8px] text-slate-500">{item.month.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-700">Top productos por valor en inventario</p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                          <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                          <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                          <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                          <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.top_products.map((product, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-900">{product.name}</td>
                            <td className="px-4 py-3 text-[9px] font-mono text-slate-500">{product.sku}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 text-right">{product.quantity}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 text-right">{formatCurrency(product.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inventory Tab */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-700">Valor de inventario por bodega</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.inventory_value.map((wh, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-slate-900">{wh.warehouse}</p>
                        <p className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(wh.total_cost)}</p>
                        <p className="text-xs text-slate-500 mt-1">{wh.items} productos</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Tab */}
              {activeTab === 'customers' && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-700">Clientes con saldo pendiente</p>
                  {data.customer_balances.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No hay saldos pendientes</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                            <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saldo</th>
                            <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.customer_balances.map((customer, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-xs font-medium text-slate-900">{customer.name}</td>
                              <td className="px-4 py-3 text-xs text-slate-700 text-right">{formatCurrency(customer.balance)}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {customer.aging}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
