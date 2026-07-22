'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Select, Input } from '@yellow-erp/ui';
import { Plus, Search, Download, Eye, Edit, Trash2, ShoppingCart, DollarSign, Truck, CreditCard, Package, FileText, Monitor, Users, RotateCcw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { generateBoletaPDF } from '@/lib/pdf-design';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';

import CreditNotes from './components/CreditNotes';
import DebitNotes from './components/DebitNotes';
import SalesDashboard from './components/SalesDashboard';
import CreditControl from './components/CreditControl';

const orderStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  delivered: { label: 'Entregado', variant: 'success' },
  shipped: { label: 'Enviado', variant: 'info' },
  processing: { label: 'Procesando', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'neutral' },
  draft: { label: 'Borrador', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const paymentStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  paid: { label: 'Pagado', variant: 'success' },
  partial: { label: 'Parcial', variant: 'warning' },
  pending: { label: 'Pendiente', variant: 'info' },
  refunded: { label: 'Devuelto', variant: 'danger' },
  overdue: { label: 'Vencida', variant: 'danger' },
};

const deliveryStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  delivered: { label: 'Entregado', variant: 'success' },
  in_transit: { label: 'En Tránsito', variant: 'info' },
  pending: { label: 'Pendiente', variant: 'warning' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const invoiceStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  paid: { label: 'Pagada', variant: 'success' },
  partial: { label: 'Pago Parcial', variant: 'warning' },
  pending: { label: 'Pendiente', variant: 'info' },
  overdue: { label: 'Vencida', variant: 'danger' },
  draft: { label: 'Borrador', variant: 'neutral' },
  sent: { label: 'Enviada', variant: 'info' },
};

function SalesPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTabs = ['orders', 'delivery', 'invoices', 'pos', 'customers', 'quotations', 'returns', 'credit-control'] as const;
  const initialTab = validTabs.includes(tabParam as any) ? (tabParam as any) : 'orders';
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryGuides, setDeliveryGuides] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'delivery' | 'invoices' | 'pos' | 'customers' | 'quotations' | 'returns' | 'credit-notes' | 'debit-notes' | 'credit-control'>(initialTab);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrders(),
      api.getDeliveryGuides(),
      api.getInvoices(),
      api.getCustomers().catch(() => ({ data: [] })),
      api.getSalesQuotations().catch(() => ({ data: [] })),
      api.getCustomerReturns().catch(() => ({ data: [] })),
      api.getCompany().catch(() => null),
    ]).then(([ordersRes, guidesRes, invoicesRes, customersRes, quotationsRes, returnsRes, companyRes]) => {
      if (companyRes) setCompany(companyRes);
      const ordersData = (ordersRes.data || []).map((o: any) => ({
        id: o.id,
        number: o.order_number,
        customer: o.customer?.name || o.customer_id || '---',
        items: Array.isArray(o.items) ? o.items.length : (o.items || 0),
        date: o.created_at?.split('T')[0] || '',
        total: Number(o.total || 0),
        status: o.status,
        project: o.project?.name || '',
        payment: 'pending',
      }));
      const guidesData = (guidesRes.data || []).map((g: any) => ({
        id: g.id,
        number: g.guide_number,
        orderId: g.sales_order?.order_number || g.order_id,
        date: g.created_at?.split('T')[0] || '',
        transport: g.transport,
        status: g.status,
        project: g.project?.name || '',
      }));
      const invoicesData = (invoicesRes.data || []).map((inv: any) => ({
        id: inv.id,
        number: inv.invoice_number,
        orderId: inv.sales_order?.number || inv.order_id,
        date: inv.created_at?.split('T')[0] || '',
        total: Number(inv.total_amount || inv.total || 0),
        status: inv.status,
        project: inv.project?.name || '',
        paid: 0,
      }));
      const customersData = (customersRes.data || []).map((c) => ({
        id: c.id,
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        tax_id: c.tax_id || '',
        address: c.address || '',
        active: true,
      }));
      setOrders(ordersData);
      setDeliveryGuides(guidesData);
      setInvoices(invoicesData);
      setCustomers(customersData);
      const quotationsData = (quotationsRes.data || []).map((q) => ({
        id: q.id,
        number: q.quotation_number,
        customer: q.customer?.name || q.customer_id,
        date: q.created_at?.split('T')[0] || '',
        valid_until: q.valid_until || '',
        total: Number(q.total || 0),
        status: q.status,
      }));
      setQuotations(quotationsData);
      const returnsData = (returnsRes.data || []).map((r) => ({
        id: r.id,
        number: r.return_number,
        customer: r.customer?.name || '—',
        warehouse: r.warehouse?.name || '—',
        date: r.created_at?.split('T')[0] || '',
        items: r.item_count || 0,
        status: r.status,
      }));
      setReturns(returnsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.number?.toLowerCase().includes(search.toLowerCase()) || o.customer?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGuides = deliveryGuides.filter(g => {
    const matchesSearch = g.number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.tax_id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingDelivery = deliveryGuides.filter(g => g.status !== 'delivered').length;
  const pendingPayment = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + ((i.total || 0) - (i.paid || 0)), 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);

  const handleExport = () => {
    let headers: string[];
    let rows: string[][];
    if (activeTab === 'orders') {
      headers = ['Nº Orden', 'Cliente', 'Fecha', 'Total', 'Estado'];
      rows = filteredOrders.map(o => [o.number, o.customer || '', o.date, String(o.total || 0), o.status]);
    } else if (activeTab === 'delivery') {
      headers = ['Nº Guía', 'Orden Ref.', 'Fecha', 'Transporte', 'Estado'];
      rows = filteredGuides.map(g => [g.number, g.orderId || '', g.date, g.transport || '', g.status]);
    } else if (activeTab === 'invoices') {
      headers = ['Nº Factura', 'Orden Ref.', 'Fecha', 'Total', 'Estado'];
      rows = filteredInvoices.map(i => [i.number, i.orderId || '', i.date, String(i.total || 0), i.status]);
    } else {
      return;
    }
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ventas</h1>
          <p className="text-sm text-slate-500 mt-1">Órdenes, guías de despacho, facturación y POS</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          {activeTab === 'orders' && (
            <Link href="/dashboard/sales/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva Venta</Button>
            </Link>
          )}
          {activeTab === 'delivery' && (
            <Link href="/dashboard/sales/delivery/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva Guía</Button>
            </Link>
          )}
          {activeTab === 'invoices' && (
            <Link href="/dashboard/sales/invoices/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva Factura</Button>
            </Link>
          )}
          {activeTab === 'customers' && (
            <Link href="/dashboard/customers/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Nuevo Cliente</Button>
            </Link>
          )}
          {activeTab === 'quotations' && (
            <Link href="/dashboard/sales/quotations/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva Cotización</Button>
            </Link>
          )}
          {activeTab === 'returns' && (
            <Link href="/dashboard/sales/returns">
              <Button><Plus className="w-4 h-4 mr-2" /> Nueva Devolución</Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ventas del Mes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${(totalSales / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Facturado</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${(totalInvoiced / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Despachos Pendientes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{pendingDelivery}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Por Cobrar</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${(pendingPayment / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <ContinuousTabs
          tabs={[
            { id: 'orders', label: `OV (${orders.length})` },
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'delivery', label: `Despacho (${deliveryGuides.length})` },
            { id: 'invoices', label: `Facturas (${invoices.length})` },
            { id: 'customers', label: `Clientes (${customers.length})` },
            { id: 'quotations', label: `Cotizaciones (${quotations.length})` },
            { id: 'returns', label: `Devoluciones (${returns.length})` },
            { id: 'credit-notes', label: 'NC' },
            { id: 'debit-notes', label: 'ND' },
            { id: 'credit-control', label: 'Crédito' },
            { id: 'pos', label: 'POS' },
          ]}
          defaultActiveId={activeTab}
          onChange={(id) => { setActiveTab(id as typeof activeTab); setSearch(''); setStatusFilter('all'); }}
        />

        {/* Filters - hidden for POS tab */}
        {activeTab !== 'pos' && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar por número, cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={
                  activeTab === 'orders' ? [
                    { value: 'all', label: 'Todos los estados' },
                    { value: 'draft', label: 'Borradores' },
                    { value: 'confirmed', label: 'Confirmados' },
                    { value: 'processing', label: 'Procesando' },
                    { value: 'shipped', label: 'Enviados' },
                    { value: 'delivered', label: 'Entregados' },
                    { value: 'cancelled', label: 'Cancelados' },
                  ] : activeTab === 'delivery' ? [
                    { value: 'all', label: 'Todos los estados' },
                    { value: 'pending', label: 'Pendientes' },
                    { value: 'in_transit', label: 'En Tránsito' },
                    { value: 'delivered', label: 'Entregados' },
                    { value: 'cancelled', label: 'Cancelados' },
                  ] : [
                    { value: 'all', label: 'Todos los estados' },
                    { value: 'draft', label: 'Borradores' },
                    { value: 'pending', label: 'Pendientes' },
                    { value: 'partial', label: 'Pago Parcial' },
                    { value: 'paid', label: 'Pagadas' },
                    { value: 'overdue', label: 'Vencidas' },
                  ]
                }
                className="w-full sm:w-52"
              />
            </div>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <SalesDashboard />
          </div>
        )}

        {/* Orders Table */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Orden</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyecto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{order.number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{order.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{order.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 text-center">{order.items}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900 text-right">${(order.total || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{order.project || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <Badge variant={orderStatusConfig[order.status]?.variant || 'neutral'}>
                        {orderStatusConfig[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/sales/${order.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <Link href={`/dashboard/sales/${order.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delivery Guides Table */}
        {activeTab === 'delivery' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Guía</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Orden Ref.</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Transporte</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyecto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map(guide => (
                  <tr key={guide.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{guide.number}</td>
                    <td className="px-4 py-3 text-xs text-indigo-600 font-medium">{guide.orderId}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{guide.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{guide.transport}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{guide.project || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <Badge variant={deliveryStatusConfig[guide.status]?.variant || 'neutral'}>
                        {deliveryStatusConfig[guide.status]?.label || guide.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/sales/delivery/${guide.id}`}>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoices Table */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Factura</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Orden Ref.</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proyecto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{invoice.number}</td>
                    <td className="px-4 py-3 text-xs text-indigo-600 font-medium">{invoice.orderId}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{invoice.date}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900 text-right">${(invoice.total || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{invoice.project || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <Badge variant={invoiceStatusConfig[invoice.status]?.variant || 'neutral'}>
                        {invoiceStatusConfig[invoice.status]?.label || invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/sales/invoices/${invoice.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={async () => {
                          try {
                            const api = getApiClient();
                            const inv = await api.getInvoice(invoice.id);
                            const c = company || {};
                            const doc = await generateBoletaPDF({
                              id: inv.id || invoice.id,
                              number: inv.invoice_number || invoice.number,
                              type: (inv as any).document_type || 'boleta',
                              date: inv.invoice_date || invoice.date,
                              company: {
                                name: c.name || 'Empresa', tax_id: c.tax_id || undefined, razon_social: c.razon_social || undefined,
                                giro: c.giro || undefined, address: c.address || undefined, city: c.city || undefined,
                                region: c.region || undefined, phone: c.phone || undefined, email: c.email || undefined,
                                logo_url: c.logo_url || undefined,
                              },
                              customer: inv.customer ? { name: inv.customer.name, tax_id: inv.customer.tax_id, address: (inv.customer as any).address } : undefined,
                              items: (inv.items || []).map((it: any) => ({
                                name: it.description || it.product?.name || '',
                                sku: it.product?.sku || '',
                                quantity: it.quantity,
                                unit_price: it.unit_price,
                                total: it.line_total || it.quantity * it.unit_price,
                              })),
                              subtotal: Math.round((inv.total_amount || 0) / 1.19),
                              tax_amount: (inv.total_amount || 0) - Math.round((inv.total_amount || 0) / 1.19),
                              total: inv.total_amount || 0,
                            });
                            doc.save(`${inv.invoice_number || invoice.number}.pdf`);
                           } catch { toast.error('Error al descargar factura'); }
                        }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customers Table */}
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Dirección</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{customer.tax_id}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{customer.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{customer.address}</td>
                    <td className="px-4 py-3">
                      <Badge variant={customer.active ? 'success' : 'neutral'}>
                        {customer.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quotations Table */}
        {activeTab === 'quotations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Cotización</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Válido Hasta</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {quotations.filter(q => {
                  const matchesSearch = q.number?.toLowerCase().includes(search.toLowerCase()) || q.customer?.toLowerCase().includes(search.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
                  return matchesSearch && matchesStatus;
                }).map(q => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{q.number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{q.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{q.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{q.valid_until || '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900 text-right">${(q.total || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={q.status === 'accepted' ? 'success' : q.status === 'rejected' ? 'danger' : q.status === 'sent' ? 'info' : 'neutral'}>
                        {q.status === 'draft' ? 'Borrador' : q.status === 'sent' ? 'Enviada' : q.status === 'accepted' ? 'Aceptada' : q.status === 'rejected' ? 'Rechazada' : q.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/sales/quotations/${q.id}`}>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Returns Table */}
        {activeTab === 'returns' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Devolución</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {returns.filter(r => {
                  const matchesSearch = r.number?.toLowerCase().includes(search.toLowerCase()) || r.customer?.toLowerCase().includes(search.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                  return matchesSearch && matchesStatus;
                }).map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{r.number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.warehouse}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 text-center">{r.items}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === 'completed' ? 'success' : r.status === 'cancelled' ? 'danger' : 'warning'}>
                        {r.status === 'pending' ? 'Pendiente' : r.status === 'completed' ? 'Completada' : r.status === 'cancelled' ? 'Cancelada' : r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/sales/returns`}>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* POS Tab - redirects to standalone POS */}
        {activeTab === 'credit-notes' && (
          <div className="p-6">
            <CreditNotes />
          </div>
        )}

        {activeTab === 'debit-notes' && (
          <div className="p-6">
            <DebitNotes />
          </div>
        )}

        {activeTab === 'credit-control' && (
          <div className="p-6">
            <CreditControl />
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
              <Monitor className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Punto de Venta</h3>
              <p className="text-sm text-slate-500 mb-4">Utiliza el POS dedicado para una mejor experiencia</p>
              <Link href="/dashboard/pos">
                <Button>
                  <Monitor className="w-4 h-4 mr-2" /> Abrir POS
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {activeTab !== 'pos' && (
        (activeTab === 'orders' && filteredOrders.length === 0) ||
        (activeTab === 'delivery' && filteredGuides.length === 0) ||
        (activeTab === 'invoices' && filteredInvoices.length === 0) ||
        (activeTab === 'customers' && filteredCustomers.length === 0)
      ) && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron resultados</p>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mt-2" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}
      </div>
    </div>}>
      <SalesPageContent />
    </Suspense>
  );
}
