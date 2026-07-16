'use client';

import { useEffect, useState } from 'react';
import { Card, Title, Text, Metric, BarChart, AreaChart, Badge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { Plus, Package, Users, ShoppingCart, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

const statusColors: Record<string, string> = {
  delivered: 'emerald',
  shipped: 'blue',
  processing: 'yellow',
  confirmed: 'gray',
  draft: 'gray',
  pending: 'yellow',
  paid: 'emerald',
  cancelled: 'red',
};

const statusLabels: Record<string, string> = {
  delivered: 'Entregado',
  shipped: 'Enviado',
  processing: 'Procesando',
  confirmed: 'Confirmado',
  draft: 'Borrador',
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalSalesMonth: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    pendingInvoices: 0,
    totalPurchasesMonth: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [salesByMonth, setSalesByMonth] = useState<{ month: string; Ventas: number; Compras: number }[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrders({ limit: '50', sort: 'created_at' }).catch(() => ({ data: [] })),
      api.getProducts({ limit: '500' }).catch(() => ({ data: [] })),
      api.getCustomers({ limit: '500' }).catch(() => ({ data: [] })),
      api.getInvoices({ limit: '500' }).catch(() => ({ data: [] })),
      api.getPurchaseOrders({ limit: '500' }).catch(() => ({ data: [] })),
    ]).then(([ordersRes, productsRes, customersRes, invoicesRes, purchasesRes]) => {
      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const customers = customersRes.data || [];
      const invoices = invoicesRes.data || [];
      const purchases = purchasesRes.data || [];

      const totalSalesMonth = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const totalPurchasesMonth = purchases.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const pendingInvoices = invoices.filter((i: any) => i.status === 'pending' || i.status === 'overdue').length;

      const lowStock = products
        .filter((p: any) => {
          const stock = p.stock_levels?.reduce((sum: number, sl: any) => sum + (sl.quantity || 0), 0) || 0;
          return stock <= (p.min_stock || 10);
        })
        .slice(0, 5)
        .map((p: any) => ({
          name: p.name,
          sku: p.sku,
          stock: p.stock_levels?.reduce((sum: number, sl: any) => sum + (sl.quantity || 0), 0) || 0,
          minStock: p.min_stock || 10,
          warehouse: p.stock_levels?.[0]?.warehouse?.name || '—',
        }));

      // Aggregate sales by month from orders
      const monthMap: Record<string, { ventas: number; compras: number }> = {};
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      orders.forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (!monthMap[key]) monthMap[key] = { ventas: 0, compras: 0 };
        monthMap[key].ventas += o.total || 0;
      });
      purchases.forEach((p: any) => {
        const d = new Date(p.created_at);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (!monthMap[key]) monthMap[key] = { ventas: 0, compras: 0 };
        monthMap[key].compras += p.total_amount || 0;
      });
      const chartData = Object.entries(monthMap)
        .map(([month, v]) => ({ month, Ventas: v.ventas, Compras: v.compras }))
        .sort((a, b) => {
          const ai = monthNames.indexOf(a.month.split(' ')[0]);
          const bi = monthNames.indexOf(b.month.split(' ')[0]);
          return ai - bi;
        });

      setKpis({
        totalSalesMonth,
        totalProducts: products.length,
        lowStockCount: lowStock.length,
        totalCustomers: customers.length,
        pendingInvoices,
        totalPurchasesMonth,
      });
      setRecentSales(orders.slice(0, 5));
      setLowStockProducts(lowStock);
      setSalesByMonth(chartData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen general de tu empresa</p>
        </div>
        <Link href="/dashboard/sales">
          <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Venta
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card decoration="top" decorationColor="indigo">
          <div className="flex items-center justify-between">
            <div>
              <Text>Ventas del Mes</Text>
              <Metric className="mt-1">{loading ? '—' : formatCurrency(kpis.totalSalesMonth)}</Metric>
              <Text className="mt-1 text-slate-500">{recentSales.length} órdenes recientes</Text>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <div>
              <Text>Productos</Text>
              <Metric className="mt-1">{loading ? '—' : kpis.totalProducts}</Metric>
              <Text className={`mt-1 ${kpis.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {loading ? '' : kpis.lowStockCount > 0 ? `${kpis.lowStockCount} con stock bajo` : 'Stock OK'}
              </Text>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <div>
              <Text>Clientes</Text>
              <Metric className="mt-1">{loading ? '—' : kpis.totalCustomers}</Metric>
              <Text className="mt-1 text-slate-500">Activos</Text>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="rose">
          <div className="flex items-center justify-between">
            <div>
              <Text>Compras del Mes</Text>
              <Metric className="mt-1">{loading ? '—' : formatCurrency(kpis.totalPurchasesMonth)}</Metric>
              <Text className="mt-1 text-slate-500">{kpis.pendingInvoices} facturas pendientes</Text>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Title>Ventas vs Compras</Title>
          <Text className="mb-4">Comparativa mensual</Text>
          <BarChart
            data={salesByMonth.length > 0 ? salesByMonth : [{ month: 'Sin datos', Ventas: 0, Compras: 0 }]}
            index="month"
            categories={['Ventas', 'Compras']}
            colors={['indigo', 'rose']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={100}
            className="h-64"
          />
        </Card>

        <Card>
          <Title>Tendencia de Ventas</Title>
          <Text className="mb-4">Evolución mensual</Text>
          <AreaChart
            data={salesByMonth.length > 0 ? salesByMonth : [{ month: 'Sin datos', Ventas: 0, Compras: 0 }]}
            index="month"
            categories={['Ventas']}
            colors={['indigo']}
            valueFormatter={(v) => formatCurrency(v)}
            className="h-64"
          />
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title>Ventas Recientes</Title>
            <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Ver todas</Link>
          </div>
          <Table className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nº Orden</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell className="text-right">Monto</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Cargando...</TableCell></TableRow>
              ) : recentSales.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Sin órdenes recientes</TableCell></TableRow>
              ) : recentSales.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-slate-900">{sale.order_number || sale.number}</TableCell>
                  <TableCell>{sale.created_at?.split('T')[0] || '—'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(sale.total || 0)}</TableCell>
                  <TableCell>
                    <Badge color={statusColors[sale.status] || 'gray'}>
                      {statusLabels[sale.status] || sale.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title>Stock Bajo</Title>
            <Link href="/dashboard/inventory" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Ver todo</Link>
          </div>
          <Table className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Producto</TableHeaderCell>
                <TableHeaderCell>SKU</TableHeaderCell>
                <TableHeaderCell className="text-center">Stock</TableHeaderCell>
                <TableHeaderCell className="text-center">Mínimo</TableHeaderCell>
                <TableHeaderCell>Bodega</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Cargando...</TableCell></TableRow>
              ) : lowStockProducts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Sin productos con stock bajo</TableCell></TableRow>
              ) : lowStockProducts.map((product: any, index: number) => (
                <TableRow key={index} className={product.stock === 0 ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-slate-500">{product.sku}</TableCell>
                  <TableCell className={`text-center font-bold ${product.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>{product.stock}</TableCell>
                  <TableCell className="text-center text-slate-500">{product.minStock}</TableCell>
                  <TableCell>{product.warehouse}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Title>Acciones Rápidas</Title>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-4">
          <Link href="/dashboard/sales">
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-24 flex flex-col gap-2 w-full rounded-lg text-sm font-medium transition-colors">
              <ShoppingCart className="w-8 h-8 mx-auto text-indigo-600" />
              <span>Nueva Venta</span>
            </button>
          </Link>
          <Link href="/dashboard/purchases/new">
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-24 flex flex-col gap-2 w-full rounded-lg text-sm font-medium transition-colors">
              <Package className="w-8 h-8 mx-auto text-emerald-600" />
              <span>Nueva Compra</span>
            </button>
          </Link>
          <Link href="/dashboard/customers/new">
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-24 flex flex-col gap-2 w-full rounded-lg text-sm font-medium transition-colors">
              <Users className="w-8 h-8 mx-auto text-amber-600" />
              <span>Nuevo Cliente</span>
            </button>
          </Link>
          <Link href="/dashboard/inventory/new">
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-24 flex flex-col gap-2 w-full rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-8 h-8 mx-auto text-rose-600" />
              <span>Nuevo Producto</span>
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
