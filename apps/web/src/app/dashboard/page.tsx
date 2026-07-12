'use client';

import { Card, CardHeader, CardTitle, CardContent, KPICard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@yellow-erp/ui';
import { Plus, TrendingUp, Package, Users, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const kpis = [
    { label: 'Ventas del Mes', value: '$12.450.000', change: '+12.5% vs mes anterior', changeType: 'positive' as const, icon: ShoppingCart, iconColor: 'indigo' },
    { label: 'Productos en Stock', value: '1.234', change: '23 productos bajos', changeType: 'negative' as const, icon: Package, iconColor: 'emerald' },
    { label: 'Clientes Activos', value: '456', change: '+8 nuevos esta semana', changeType: 'positive' as const, icon: Users, iconColor: 'amber' },
    { label: 'Pendientes de Cobro', value: '$3.210.000', change: '12 facturas vencidas', changeType: 'negative' as const, icon: CreditCard, iconColor: 'rose' },
  ];

  const recentSales = [
    { number: 'SO-2024-001', customer: 'Empresa ABC SpA', date: '11 Jul 2024', amount: '$2.450.000', status: 'delivered' },
    { number: 'SO-2024-002', customer: 'Comercial XYZ Ltda', date: '10 Jul 2024', amount: '$1.200.000', status: 'shipped' },
    { number: 'SO-2024-003', customer: 'Distribuidora Norte', date: '10 Jul 2024', amount: '$890.000', status: 'processing' },
    { number: 'SO-2024-004', customer: 'Retail Sur SA', date: '09 Jul 2024', amount: '$3.100.000', status: 'confirmed' },
    { number: 'SO-2024-005', customer: 'Importadora Chile', date: '09 Jul 2024', amount: '$560.000', status: 'draft' },
  ];

  const lowStockProducts = [
    { name: 'Laptop HP ProBook 450', sku: 'LP-HP-450', stock: 2, minStock: 5, warehouse: 'Bodega Central' },
    { name: 'Mouse Logitech MX Master 3', sku: 'MS-LG-MX3', stock: 0, minStock: 10, warehouse: 'Bodega Norte' },
    { name: 'Monitor Dell 27" 4K', sku: 'MN-DELL-27', stock: 3, minStock: 5, warehouse: 'Bodega Central' },
    { name: 'Teclado Mecánico Keychron K2', sku: 'KB-KC-K2', stock: 1, minStock: 5, warehouse: 'Bodega Sur' },
  ];

  const statusConfig = {
    delivered: { label: 'Entregado', variant: 'success' as const },
    shipped: { label: 'Enviado', variant: 'info' as const },
    processing: { label: 'Procesando', variant: 'warning' as const },
    confirmed: { label: 'Confirmado', variant: 'neutral' as const },
    draft: { label: 'Borrador', variant: 'neutral' as const },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen general de tu empresa</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ventas Recientes</CardTitle>
            <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Ver todas</Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale, index) => {
                  const config = statusConfig[sale.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-slate-900">{sale.number}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell className="text-right font-medium">{sale.amount}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stock Bajo</CardTitle>
            <Link href="/dashboard/inventory?filter=low-stock" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Ver todas</Link>
          </CardHeader>
          <CardContent className="p-0">
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
                {lowStockProducts.map((product, index) => (
                  <TableRow key={index} className={index === 1 ? 'bg-rose-50' : ''}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-slate-500">{product.sku}</TableCell>
                    <TableCell className="text-center font-bold text-rose-600">{product.stock}</TableCell>
                    <TableCell className="text-center text-slate-500">{product.minStock}</TableCell>
                    <TableCell>{product.warehouse}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Link href="/dashboard/sales/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2">
                <ShoppingCart className="w-8 h-8 mx-auto" />
                <span>Nueva Venta</span>
              </Button>
            </Link>
            <Link href="/dashboard/purchases/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2">
                <Package className="w-8 h-8 mx-auto" />
                <span>Nueva Compra</span>
              </Button>
            </Link>
            <Link href="/dashboard/customers/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2">
                <Users className="w-8 h-8 mx-auto" />
                <span>Nuevo Cliente</span>
              </Button>
            </Link>
            <Link href="/dashboard/inventory/new">
              <Button variant="secondary" className="h-24 flex flex-col gap-2">
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