'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Select, Input } from '@yellow-erp/ui';
import { Plus, Search, Download, Eye, Edit, Trash2, ShoppingCart, DollarSign, Truck, CreditCard, Package, FileText, ClipboardList, Monitor, Banknote, Receipt, X, Check, Users } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

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

interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface CartItem extends POSProduct {
  quantity: number;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryGuides, setDeliveryGuides] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'delivery' | 'invoices' | 'pos' | 'customers'>('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // POS state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posSearch, setPosSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrders(),
      api.getDeliveryGuides(),
      api.getInvoices(),
      api.getProducts(),
      api.getCustomers().catch(() => ({ data: [] })),
    ]).then(([ordersRes, guidesRes, invoicesRes, productsRes, customersRes]) => {
      const ordersData = (ordersRes.data || []).map((o) => ({
        id: o.id,
        number: o.order_number,
        customer: o.customer_id,
        date: o.created_at?.split('T')[0] || '',
        total: o.total,
        status: o.status,
        payment: 'pending',
      }));
      const guidesData = (guidesRes.data || []).map((g) => ({
        id: g.id,
        number: g.guide_number,
        orderId: g.order_id,
        date: g.created_at?.split('T')[0] || '',
        transport: g.transport,
        status: g.status,
      }));
      const invoicesData = (invoicesRes.data || []).map((inv) => ({
        id: inv.id,
        number: inv.invoice_number,
        orderId: inv.order_id,
        date: inv.created_at?.split('T')[0] || '',
        total: inv.total,
        status: inv.status,
        paid: 0,
      }));
      const productsData = (productsRes.data || []).map((p) => ({
        id: p.id,
        name: p.name || '',
        sku: p.sku || '',
        price: p.price || 0,
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
      setProducts(productsData);
      setCustomers(customersData);
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

  const filteredPOSProducts = products.filter(p =>
    p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(posSearch.toLowerCase())
  );

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

  // POS functions
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = Math.round(cartSubtotal * 0.19);
  const cartTotal = cartSubtotal + cartTax;

  const addToCart = (product: POSProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const handlePayment = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCart([]);
    setShowPaymentModal(false);
    setAmountPaid(0);
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
          <Button variant="secondary" size="sm">
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { id: 'orders' as const, label: 'Órdenes de Venta', icon: ShoppingCart, count: orders.length },
              { id: 'delivery' as const, label: 'Guías de Despacho', icon: Truck, count: deliveryGuides.length },
              { id: 'invoices' as const, label: 'Facturación', icon: FileText, count: invoices.length },
              { id: 'customers' as const, label: 'Clientes', icon: Users, count: customers.length },
              { id: 'pos' as const, label: 'POS', icon: Monitor, count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('all'); }}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && <Badge variant="neutral">{tab.count}</Badge>}
              </button>
            ))}
          </div>
        </div>

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
                        <Link href={`/dashboard/sales/invoices/${invoice.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Download className="w-4 h-4" /></button>
                        </Link>
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

        {/* POS Tab */}
        {activeTab === 'pos' && (
          <div className="p-0">
            <div className="flex h-[calc(100vh-22rem)]">
              {/* Products Grid */}
              <div className="flex-1 flex flex-col min-w-0 p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Buscar producto por nombre o SKU..."
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-pulse">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg mb-3" />
                          <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
                          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                          <div className="h-5 bg-slate-200 rounded w-20" />
                        </div>
                      ))
                    ) : filteredPOSProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
                          <Package className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                        <p className="text-sm font-medium text-slate-900 mt-1 line-clamp-2">{product.name}</p>
                        <p className="text-lg font-bold text-slate-900 mt-2">${product.price.toLocaleString('es-CL')}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cart Sidebar */}
              <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-900">Carrito</h2>
                  </div>
                  <span className="text-xs text-slate-500">{cart.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Carrito vacío</p>
                      <p className="text-xs text-slate-400 mt-1">Selecciona productos</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500">${item.price.toLocaleString('es-CL')} c/u</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-50">-</button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-50">+</button>
                          </div>
                          <p className="text-sm font-bold text-slate-900">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">${cartSubtotal.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IVA (19%)</span>
                      <span className="font-medium">${cartTax.toLocaleString('es-CL')}</span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-xl font-bold text-slate-900">${cartTotal.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => { setAmountPaid(cartTotal); setShowPaymentModal(true); }} disabled={cart.length === 0}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cobrar
                  </Button>
                </div>
              </div>
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

      {/* POS Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Cobrar Venta</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total a cobrar</p>
                <p className="text-3xl font-bold text-slate-900">${cartTotal.toLocaleString('es-CL')}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Efectivo', icon: Banknote },
                    { id: 'card', label: 'Tarjeta', icon: CreditCard },
                    { id: 'transfer', label: 'Transferencia', icon: Receipt },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {paymentMethod === 'cash' && (
                <Input label="Monto Recibido" type="number" value={amountPaid} onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)} />
              )}
              {paymentMethod === 'cash' && amountPaid > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Vuelto</span>
                    <span className="font-bold text-emerald-700">${Math.max(0, amountPaid - cartTotal).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
              <Button onClick={handlePayment} disabled={paymentMethod === 'cash' && amountPaid < cartTotal}>
                <Check className="w-4 h-4 mr-2" />
                Confirmar Pago
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
