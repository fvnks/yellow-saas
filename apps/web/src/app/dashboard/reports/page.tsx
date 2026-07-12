'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select, KPICard } from '@yellow-erp/ui';
import { Download, FileText, ShoppingCart, Package, Calculator, TrendingUp, DollarSign, Users, BarChart3, AlertTriangle } from 'lucide-react';

const topProducts = [
  { id: '1', name: 'Laptop HP ProBook 450 G10', units: 45, total: 29250000, percentage: 28 },
  { id: '2', name: 'Monitor Dell UltraSharp 27"', units: 32, total: 13440000, percentage: 13 },
  { id: '3', name: 'Mouse Logitech MX Master 3S', units: 89, total: 7921000, percentage: 8 },
  { id: '4', name: 'Teclado Mecánico Keychron K2', units: 67, total: 6365000, percentage: 6 },
  { id: '5', name: 'Disco SSD Samsung 980 PRO 1TB', units: 54, total: 5940000, percentage: 6 },
  { id: '6', name: 'Impresora HP LaserJet Pro', units: 21, total: 5880000, percentage: 6 },
  { id: '7', name: 'Webcam Logitech C920', units: 78, total: 5070000, percentage: 5 },
  { id: '8', name: 'Cable HDMI 2.1 2m', units: 210, total: 2520000, percentage: 2 },
  { id: '9', name: 'Audífonos Sony WH-1000XM5', units: 15, total: 4500000, percentage: 4 },
  { id: '10', name: 'Router TP-Link Archer AX73', units: 28, total: 3920000, percentage: 4 },
];

const inventoryProducts = [
  { id: '1', name: 'Laptop HP ProBook 450 G10', sku: 'LP-HP-450', warehouse: 'Bodega Central', currentStock: 15, minStock: 5, status: 'normal' },
  { id: '2', name: 'Mouse Logitech MX Master 3S', sku: 'MS-LG-MX3', warehouse: 'Bodega Norte', currentStock: 0, minStock: 10, status: 'sin-stock' },
  { id: '3', name: 'Monitor Dell UltraSharp 27"', sku: 'MN-DELL-27', warehouse: 'Bodega Central', currentStock: 8, minStock: 3, status: 'normal' },
  { id: '4', name: 'Teclado Mecánico Keychron K2', sku: 'KB-KC-K2', warehouse: 'Bodega Sur', currentStock: 2, minStock: 5, status: 'bajo' },
  { id: '5', name: 'Disco SSD Samsung 980 PRO 1TB', sku: 'SSD-SAM-980', warehouse: 'Bodega Central', currentStock: 25, minStock: 10, status: 'normal' },
  { id: '6', name: 'Impresora HP LaserJet Pro', sku: 'IMP-HP-LJ', warehouse: 'Bodega Norte', currentStock: 0, minStock: 2, status: 'sin-stock' },
  { id: '7', name: 'Cable HDMI 2.1 2m', sku: 'CB-HDMI-2', warehouse: 'Bodega Central', currentStock: 50, minStock: 20, status: 'normal' },
  { id: '8', name: 'Webcam Logitech C920', sku: 'WC-LG-C920', warehouse: 'Bodega Sur', currentStock: 3, minStock: 5, status: 'bajo' },
];

const monthlyFinancials = [
  { id: '1', month: 'Enero 2026', income: 18500000, expenses: 12300000, profit: 6200000, iva: 3515000 },
  { id: '2', month: 'Febrero 2026', income: 21200000, expenses: 14100000, profit: 7100000, iva: 4028000 },
  { id: '3', month: 'Marzo 2026', income: 19800000, expenses: 13200000, profit: 6600000, iva: 3762000 },
  { id: '4', month: 'Abril 2026', income: 23400000, expenses: 15600000, profit: 7800000, iva: 4446000 },
  { id: '5', month: 'Mayo 2026', income: 20100000, expenses: 13400000, profit: 6700000, iva: 3819000 },
  { id: '6', month: 'Junio 2026', income: 25600000, expenses: 17100000, profit: 8500000, iva: 4864000 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('ventas');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-06-30');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const tabs = [
    { id: 'ventas', label: 'Ventas' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'contabilidad', label: 'Contabilidad' },
  ];

  const warehouses = ['Bodega Central', 'Bodega Norte', 'Bodega Sur'];

  const filteredInventory = inventoryProducts.filter(p =>
    warehouseFilter === 'all' || p.warehouse === warehouseFilter
  );

  const totalSold = topProducts.reduce((sum, p) => sum + p.total, 0);
  const totalOrders = 342;
  const avgTicket = Math.round(totalSold / totalOrders);
  const topClient = 'Empresa Constructora Los Andes';

  const totalProducts = inventoryProducts.length;
  const inventoryValue = inventoryProducts.reduce((sum, p) => sum + (p.currentStock * 650000), 0);
  const lowStock = inventoryProducts.filter(p => p.status === 'bajo').length;
  const outOfStock = inventoryProducts.filter(p => p.status === 'sin-stock').length;

  const totalIncome = monthlyFinancials.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyFinancials.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const totalIva = monthlyFinancials.reduce((sum, m) => sum + m.iva, 0);

  const getStockStatus = (status: string) => {
    switch (status) {
      case 'sin-stock': return { label: 'Sin stock', variant: 'danger' as const };
      case 'bajo': return { label: 'Bajo', variant: 'warning' as const };
      default: return { label: 'Normal', variant: 'success' as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

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

      {activeTab === 'ventas' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Input
                  label="Fecha desde"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
                <Input
                  label="Fecha hasta"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="Total Vendido"
              value={`$${totalSold.toLocaleString('es-CL')}`}
              change="+18% vs mes anterior"
              changeType="positive"
              icon={DollarSign}
              iconColor="emerald"
            />
            <KPICard
              label="Órdenes"
              value={totalOrders.toString()}
              change="+12 órdenes"
              changeType="positive"
              icon={ShoppingCart}
              iconColor="blue"
            />
            <KPICard
              label="Ticket Promedio"
              value={`$${avgTicket.toLocaleString('es-CL')}`}
              change="+5% vs mes anterior"
              changeType="positive"
              icon={BarChart3}
              iconColor="indigo"
            />
            <KPICard
              label="Top Cliente"
              value={topClient}
              change="$12.500.000 en compras"
              changeType="neutral"
              icon={Users}
              iconColor="amber"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Productos Vendidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Unidades</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>% del total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.units}</TableCell>
                      <TableCell>${product.total.toLocaleString('es-CL')}</TableCell>
                      <TableCell>{product.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'inventario' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select
                  label="Almacén"
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos los almacenes' },
                    ...warehouses.map(w => ({ value: w, label: w })),
                  ]}
                  className="w-64"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="Total Productos"
              value={totalProducts.toString()}
              change="En todos los almacenes"
              changeType="neutral"
              icon={Package}
              iconColor="indigo"
            />
            <KPICard
              label="Valor Inventario"
              value={`$${inventoryValue.toLocaleString('es-CL')}`}
              change="Costo de reposición"
              changeType="neutral"
              icon={DollarSign}
              iconColor="emerald"
            />
            <KPICard
              label="Stock Bajo"
              value={lowStock.toString()}
              change="Requiere reabastecimiento"
              changeType="negative"
              icon={AlertTriangle}
              iconColor="amber"
            />
            <KPICard
              label="Sin Stock"
              value={outOfStock.toString()}
              change="Crítico - sin disponibilidad"
              changeType="negative"
              icon={AlertTriangle}
              iconColor="rose"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock por Producto</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Almacén</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map(product => {
                    const status = getStockStatus(product.status);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.warehouse}</TableCell>
                        <TableCell>{product.currentStock}</TableCell>
                        <TableCell>{product.minStock}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contabilidad' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Input
                  label="Fecha desde"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
                <Input
                  label="Fecha hasta"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="Ingresos"
              value={`$${totalIncome.toLocaleString('es-CL')}`}
              change="+15% vs período anterior"
              changeType="positive"
              icon={TrendingUp}
              iconColor="emerald"
            />
            <KPICard
              label="Gastos"
              value={`$${totalExpenses.toLocaleString('es-CL')}`}
              change="+10% vs período anterior"
              changeType="negative"
              icon={DollarSign}
              iconColor="rose"
            />
            <KPICard
              label="Utilidad Neta"
              value={`$${netProfit.toLocaleString('es-CL')}`}
              change="+22% vs período anterior"
              changeType="positive"
              icon={TrendingUp}
              iconColor="blue"
            />
            <KPICard
              label="IVA Cobrado"
              value={`$${totalIva.toLocaleString('es-CL')}`}
              change="Período fiscal 2026"
              changeType="neutral"
              icon={Calculator}
              iconColor="amber"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Mensual</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Gastos</TableHead>
                    <TableHead>Utilidad</TableHead>
                    <TableHead>IVA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyFinancials.map(month => (
                    <TableRow key={month.id}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>${month.income.toLocaleString('es-CL')}</TableCell>
                      <TableCell>${month.expenses.toLocaleString('es-CL')}</TableCell>
                      <TableCell>
                        <span className={month.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          ${month.profit.toLocaleString('es-CL')}
                        </span>
                      </TableCell>
                      <TableCell>${month.iva.toLocaleString('es-CL')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
