'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@yellow-erp/ui';
import { Plus, Package, Users, ShoppingCart, CreditCard, TrendingUp, TrendingDown, FolderKanban, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  delivered: { label: 'Entregado', variant: 'success' },
  shipped: { label: 'Enviado', variant: 'info' },
  processing: { label: 'Procesando', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'neutral' },
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  paid: { label: 'Pagado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
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
  const [projects, setProjects] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrders({ limit: '5', sort: 'created_at' }).catch(() => ({ data: [] })),
      api.getProducts({ limit: '500' }).catch(() => ({ data: [] })),
      api.getCustomers({ limit: '500' }).catch(() => ({ data: [] })),
      api.getInvoices({ limit: '500' }).catch(() => ({ data: [] })),
      api.getPurchaseOrders({ limit: '500' }).catch(() => ({ data: [] })),
      api.getProjects({ limit: 100 }).catch(() => ({ data: [] })),
    ]).then(([ordersRes, productsRes, customersRes, invoicesRes, purchasesRes, projectsRes]) => {
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
      const allProjects = projectsRes.data || [];
      setProjects(allProjects);
      const now = new Date();
      const overdue = allProjects
        .filter((p: any) => p.status === 'active' && p.end_date && new Date(p.end_date) < now)
        .slice(0, 5);
      setOverdueTasks(overdue);
      setLoading(false);
    });
  }, []);

  const kpiCards = [
    { label: 'Ventas del Mes', value: formatCurrency(kpis.totalSalesMonth), icon: ShoppingCart, iconColor: 'indigo', changeType: 'neutral' as const, change: `${recentSales.length} órdenes recientes` },
    { label: 'Productos', value: String(kpis.totalProducts), icon: Package, iconColor: 'emerald', changeType: kpis.lowStockCount > 0 ? 'negative' as const : 'positive' as const, change: kpis.lowStockCount > 0 ? `${kpis.lowStockCount} con stock bajo` : 'Stock OK' },
    { label: 'Clientes', value: String(kpis.totalCustomers), icon: Users, iconColor: 'amber', changeType: 'neutral' as const, change: 'Activos' },
    { label: 'Compras del Mes', value: formatCurrency(kpis.totalPurchasesMonth), icon: CreditCard, iconColor: 'rose', changeType: 'neutral' as const, change: `${kpis.pendingInvoices} facturas pendientes` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen general de tu empresa</p>
        </div>
        <Link href="/dashboard/sales">
          <Button className="w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '—' : kpi.value}</p>
                <p className={`text-xs mt-1 ${kpi.changeType === 'negative' ? 'text-rose-600' : kpi.changeType === 'positive' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {loading ? '' : kpi.change}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${kpi.iconColor}-50 rounded-xl flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.iconColor}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      {!loading && projects.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><FolderKanban className="w-5 h-5 text-indigo-600" /></div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyectos Activos</p>
                  <p className="text-xl font-bold text-slate-900">{projects.filter((p: any) => p.status === 'active').length}</p>
                </div>
              </div>
              <Link href="/dashboard/projects" className="text-xs text-slate-500 hover:text-slate-700">Ver todos</Link>
            </div>
            <div className="space-y-2">
              {projects.filter((p: any) => p.status === 'active').slice(0, 3).map((p: any) => (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="block p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900 truncate">{p.name}</span>
                    <span className="text-xs text-slate-500">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Presupuesto Total</p>
                <p className="text-xl font-bold text-slate-900">${(projects.reduce((s: number, p: any) => s + (parseFloat(p.budget) || 0), 0) / 1000000).toFixed(1)}M</p>
              </div>
            </div>
            <div className="space-y-2">
              {projects.filter((p: any) => p.status === 'active').slice(0, 3).map((p: any) => (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-xs text-slate-600 truncate">{p.code}</span>
                  <span className="text-xs font-medium text-slate-900">${((parseFloat(p.budget) || 0) / 1000000).toFixed(1)}M</span>
                </Link>
              ))}
            </div>
          </div>

          {overdueTasks.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyectos Atrasados</p>
                  <p className="text-xl font-bold text-amber-600">{overdueTasks.length}</p>
                </div>
              </div>
              <div className="space-y-2">
                {overdueTasks.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="block p-2 rounded-lg hover:bg-amber-50 transition-colors">
                    <span className="text-sm font-medium text-slate-900">{p.name}</span>
                    <p className="text-[10px] text-amber-600 mt-0.5">Venció: {p.end_date}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ventas Recientes</CardTitle>
            <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Ver todas</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Orden</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Cargando...</TableCell></TableRow>
                ) : recentSales.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Sin órdenes recientes</TableCell></TableRow>
                ) : recentSales.map((sale: any) => {
                  const config = statusConfig[sale.status] || statusConfig.draft;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-slate-900">{sale.order_number || sale.number}</TableCell>
                      <TableCell>{sale.created_at?.split('T')[0] || '—'}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(sale.total || 0)}</TableCell>
                      <TableCell><Badge variant={config.variant}>{config.label}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stock Bajo</CardTitle>
            <Link href="/dashboard/inventory" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Ver todo</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Mínimo</TableHead>
                  <TableHead>Bodega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Cargando...</TableCell></TableRow>
                ) : lowStockProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Sin productos con stock bajo</TableCell></TableRow>
                ) : lowStockProducts.map((product: any, index: number) => (
                  <TableRow key={index} className={product.stock === 0 ? 'bg-rose-50' : ''}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-slate-500">{product.sku}</TableCell>
                    <TableCell className={`text-center font-bold ${product.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>{product.stock}</TableCell>
                    <TableCell className="text-center text-slate-500">{product.minStock}</TableCell>
                    <TableCell>{product.warehouse}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Link href="/dashboard/sales">
              <Button variant="secondary" className="h-24 flex flex-col gap-2 w-full">
                <ShoppingCart className="w-8 h-8 mx-auto" />
                <span>Nueva Venta</span>
              </Button>
            </Link>
            <Link href="/dashboard/purchases/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2 w-full">
                <Package className="w-8 h-8 mx-auto" />
                <span>Nueva Compra</span>
              </Button>
            </Link>
            <Link href="/dashboard/customers/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2 w-full">
                <Users className="w-8 h-8 mx-auto" />
                <span>Nuevo Cliente</span>
              </Button>
            </Link>
            <Link href="/dashboard/inventory/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2 w-full">
                <Plus className="w-8 h-8 mx-auto" />
                <span>Nuevo Producto</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
