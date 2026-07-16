'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, BarChart, AreaChart, DonutChart, Badge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Download, FileText, DollarSign, ShoppingCart, BarChart3, Users, Package, TrendingUp, Calculator, AlertTriangle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

const statusColors: Record<string, string> = {
  'sin-stock': 'red',
  'bajo': 'yellow',
  'normal': 'emerald',
};

const statusLabels: Record<string, string> = {
  'sin-stock': 'Sin stock',
  'bajo': 'Bajo',
  'normal': 'Normal',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('ventas');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-06-30');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const [topProducts, setTopProducts] = useState<{ name: string; units: number; total: number }[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<{ name: string; sku: string; warehouse: string; currentStock: number; minStock: number; status: string }[]>([]);
  const [monthlyFinancials, setMonthlyFinancials] = useState<{ month: string; income: number; expenses: number; profit: number; iva: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getProducts({ limit: '500' }).catch(() => ({ data: [] })),
      api.getSalesOrders({ limit: '500' }).catch(() => ({ data: [] })),
      api.getInvoices({ limit: '500' }).catch(() => ({ data: [] })),
      api.getPurchaseOrders({ limit: '500' }).catch(() => ({ data: [] })),
    ]).then(([productsRes, ordersRes, invoicesRes, purchasesRes]) => {
      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const invoices = invoicesRes.data || [];
      const purchases = purchasesRes.data || [];

      // Top products from orders (aggregate by product)
      const productMap: Record<string, { name: string; units: number; total: number }> = {};
      orders.forEach((o: any) => {
        if (o.items?.length) {
          o.items.forEach((item: any) => {
            const key = item.product_id || item.product?.name || 'unknown';
            if (!productMap[key]) {
              productMap[key] = { name: item.product?.name || item.description || key, units: 0, total: 0 };
            }
            productMap[key].units += item.quantity || 0;
            productMap[key].total += (item.quantity || 0) * (item.unit_price || 0);
          });
        }
      });
      const topProds = Object.values(productMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      setTopProducts(topProds);

      // Inventory
      const invProducts = products.map((p: any) => ({
        name: p.name,
        sku: p.sku,
        warehouse: p.stock_levels?.[0]?.warehouse?.name || '—',
        currentStock: p.stock_levels?.reduce((sum: number, sl: any) => sum + (sl.quantity || 0), 0) || 0,
        minStock: p.min_stock || 10,
        status: (p.stock_levels?.reduce((sum: number, sl: any) => sum + (sl.quantity || 0), 0) || 0) === 0 ? 'sin-stock' :
                (p.stock_levels?.reduce((sum: number, sl: any) => sum + (sl.quantity || 0), 0) || 0) <= (p.min_stock || 10) ? 'bajo' : 'normal',
      }));
      setInventoryProducts(invProducts);

      // Monthly financials from invoices and purchases
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const finMap: Record<string, { income: number; expenses: number }> = {};
      invoices.forEach((inv: any) => {
        const d = new Date(inv.invoice_date || inv.created_at);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (!finMap[key]) finMap[key] = { income: 0, expenses: 0 };
        finMap[key].income += inv.total_amount || 0;
      });
      purchases.forEach((p: any) => {
        const d = new Date(p.created_at);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (!finMap[key]) finMap[key] = { income: 0, expenses: 0 };
        finMap[key].expenses += p.total_amount || 0;
      });
      const fins = Object.entries(finMap)
        .map(([month, v]) => ({
          month,
          income: v.income,
          expenses: v.expenses,
          profit: v.income - v.expenses,
          iva: Math.round(v.income * 0.19),
        }))
        .sort((a, b) => monthNames.indexOf(a.month.split(' ')[0]) - monthNames.indexOf(b.month.split(' ')[0]));
      setMonthlyFinancials(fins);

      setLoading(false);
    });
  }, []);

  const tabs = [
    { id: 'ventas', label: 'Ventas' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'contabilidad', label: 'Contabilidad' },
  ];

  const filteredInventory = inventoryProducts.filter(p =>
    warehouseFilter === 'all' || p.warehouse === warehouseFilter
  );

  const totalSold = topProducts.reduce((sum, p) => sum + p.total, 0);
  const totalOrders = 342;
  const avgTicket = totalOrders > 0 ? Math.round(totalSold / totalOrders) : 0;

  const totalProducts = inventoryProducts.length;
  const inventoryValue = inventoryProducts.reduce((sum, p) => sum + (p.currentStock * 650000), 0);
  const lowStock = inventoryProducts.filter(p => p.status === 'bajo').length;
  const outOfStock = inventoryProducts.filter(p => p.status === 'sin-stock').length;

  const totalIncome = monthlyFinancials.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyFinancials.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const totalIva = monthlyFinancials.reduce((sum, m) => sum + m.iva, 0);

  // Chart data for top products
  const topProductsChart = topProducts.map(p => ({ name: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name, 'Unidades vendidas': p.units }));

  // Donut data for stock status
  const stockStatusData = [
    { name: 'Normal', value: inventoryProducts.filter(p => p.status === 'normal').length },
    { name: 'Stock Bajo', value: lowStock },
    { name: 'Sin Stock', value: outOfStock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VENTAS TAB */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Text>Fecha desde</Text>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <Text>Fecha hasta</Text>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card decoration="top" decorationColor="emerald">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Total Vendido</Text>
                  <Metric className="mt-1">{formatCurrency(totalSold)}</Metric>
                  <Text className="mt-1 text-emerald-500">+18% vs mes anterior</Text>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="blue">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Órdenes</Text>
                  <Metric className="mt-1">{totalOrders}</Metric>
                  <Text className="mt-1 text-blue-500">+12 órdenes</Text>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="indigo">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Ticket Promedio</Text>
                  <Metric className="mt-1">{formatCurrency(avgTicket)}</Metric>
                  <Text className="mt-1 text-indigo-500">+5% vs mes anterior</Text>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="amber">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Top Cliente</Text>
                  <Metric className="mt-1 text-lg">Empresa Constructora Los Andes</Metric>
                  <Text className="mt-1 text-amber-500">$12.500.000 en compras</Text>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Top Products Chart + Table */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <Title>Top Productos por Unidades</Title>
              <Text className="mb-4">Unidades vendidas por producto</Text>
              <BarChart
                data={topProductsChart.length > 0 ? topProductsChart : [{ name: 'Sin datos', 'Unidades vendidas': 0 }]}
                index="name"
                categories={['Unidades vendidas']}
                colors={['indigo']}
                yAxisWidth={150}
                className="h-72"
              />
            </Card>

            <Card>
              <Title>Top 10 Productos Vendidos</Title>
              <Table className="mt-2">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>#</TableHeaderCell>
                    <TableHeaderCell>Producto</TableHeaderCell>
                    <TableHeaderCell>Unidades</TableHeaderCell>
                    <TableHeaderCell className="text-right">Total</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.units}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* INVENTARIO TAB */}
      {activeTab === 'inventario' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Text>Almacén</Text>
                <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64">
                  <option value="all">Todos los almacenes</option>
                  {[...new Set(inventoryProducts.map(p => p.warehouse))].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card decoration="top" decorationColor="indigo">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Total Productos</Text>
                  <Metric className="mt-1">{totalProducts}</Metric>
                  <Text className="mt-1 text-slate-500">En todos los almacenes</Text>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="emerald">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Valor Inventario</Text>
                  <Metric className="mt-1">{formatCurrency(inventoryValue)}</Metric>
                  <Text className="mt-1 text-slate-500">Costo de reposición</Text>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="yellow">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Stock Bajo</Text>
                  <Metric className="mt-1">{lowStock}</Metric>
                  <Text className="mt-1 text-yellow-500">Requiere reabastecimiento</Text>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="red">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Sin Stock</Text>
                  <Metric className="mt-1">{outOfStock}</Metric>
                  <Text className="mt-1 text-red-500">Crítico - sin disponibilidad</Text>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <Title>Stock por Producto</Title>
              <Table className="mt-2">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Producto</TableHeaderCell>
                    <TableHeaderCell>SKU</TableHeaderCell>
                    <TableHeaderCell>Almacén</TableHeaderCell>
                    <TableHeaderCell className="text-center">Stock</TableHeaderCell>
                    <TableHeaderCell className="text-center">Mínimo</TableHeaderCell>
                    <TableHeaderCell>Estado</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-slate-500">{product.sku}</TableCell>
                      <TableCell>{product.warehouse}</TableCell>
                      <TableCell className="text-center">{product.currentStock}</TableCell>
                      <TableCell className="text-center">{product.minStock}</TableCell>
                      <TableCell>
                        <Badge color={statusColors[product.status] || 'gray'}>
                          {statusLabels[product.status] || product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card>
              <Title>Estado del Stock</Title>
              <Text className="mb-4">Distribución por estado</Text>
              <DonutChart
                data={stockStatusData}
                category="value"
                index="name"
                colors={['emerald', 'yellow', 'red']}
                className="h-64"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Normal</span>
                  <span className="font-medium text-emerald-600">{stockStatusData[0].value}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Stock Bajo</span>
                  <span className="font-medium text-yellow-600">{stockStatusData[1].value}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Sin Stock</span>
                  <span className="font-medium text-red-600">{stockStatusData[2].value}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* CONTABILIDAD TAB */}
      {activeTab === 'contabilidad' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Text>Fecha desde</Text>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <Text>Fecha hasta</Text>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card decoration="top" decorationColor="emerald">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Ingresos</Text>
                  <Metric className="mt-1">{formatCurrency(totalIncome)}</Metric>
                  <Text className="mt-1 text-emerald-500">+15% vs período anterior</Text>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="red">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Gastos</Text>
                  <Metric className="mt-1">{formatCurrency(totalExpenses)}</Metric>
                  <Text className="mt-1 text-red-500">+10% vs período anterior</Text>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="blue">
              <div className="flex items-center justify-between">
                <div>
                  <Text>Utilidad Neta</Text>
                  <Metric className="mt-1">{formatCurrency(netProfit)}</Metric>
                  <Text className="mt-1 text-blue-500">+22% vs período anterior</Text>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card decoration="top" decorationColor="amber">
              <div className="flex items-center justify-between">
                <div>
                  <Text>IVA Cobrado</Text>
                  <Metric className="mt-1">{formatCurrency(totalIva)}</Metric>
                  <Text className="mt-1 text-slate-500">Período fiscal 2026</Text>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <Title>Ingresos vs Gastos</Title>
              <Text className="mb-4">Comparativa mensual</Text>
              <BarChart
                data={monthlyFinancials.length > 0 ? monthlyFinancials.map(m => ({ month: m.month.split(' ')[0], Ingresos: m.income, Gastos: m.expenses })) : [{ month: 'Sin datos', Ingresos: 0, Gastos: 0 }]}
                index="month"
                categories={['Ingresos', 'Gastos']}
                colors={['emerald', 'red']}
                valueFormatter={(v) => formatCurrency(v)}
                yAxisWidth={100}
                className="h-64"
              />
            </Card>

            <Card>
              <Title>Utilidad Mensual</Title>
              <Text className="mb-4">Evolución de utilidad neta</Text>
              <AreaChart
                data={monthlyFinancials.length > 0 ? monthlyFinancials.map(m => ({ month: m.month.split(' ')[0], Utilidad: m.profit })) : [{ month: 'Sin datos', Utilidad: 0 }]}
                index="month"
                categories={['Utilidad']}
                colors={['blue']}
                valueFormatter={(v) => formatCurrency(v)}
                className="h-64"
              />
            </Card>
          </div>

          <Card>
            <Title>Resumen Mensual</Title>
            <Table className="mt-2">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Mes</TableHeaderCell>
                  <TableHeaderCell className="text-right">Ingresos</TableHeaderCell>
                  <TableHeaderCell className="text-right">Gastos</TableHeaderCell>
                  <TableHeaderCell className="text-right">Utilidad</TableHeaderCell>
                  <TableHeaderCell className="text-right">IVA</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyFinancials.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.income)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.expenses)}</TableCell>
                    <TableCell className="text-right">
                      <span className={month.profit >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatCurrency(month.profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(month.iva)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
