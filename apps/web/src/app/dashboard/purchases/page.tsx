'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, CreditCard, Calendar, Truck, User, Package, FileText, DollarSign, Building2, ShoppingCart, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface Quotation {
  id: string;
  number: string;
  supplier: string;
  date: string;
  expiryDate: string;
  total: number;
  items: number;
  status: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
  email: string;
  phone: string;
  active: boolean;
}

export default function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const api = getApiClient();
    
    Promise.all([
      api.getPurchaseOrders().catch(() => ({ data: [] })),
      api.getQuotations().catch(() => ({ data: [] })),
      api.getSuppliers().catch(() => ({ data: [] })),
    ]).then(([ordersRes, quotationsRes, suppliersRes]) => {
      const ordersMapped = (ordersRes.data || []).map((o: any) => ({
        id: o.id,
        number: o.order_number || o.number || '',
        supplier: o.supplier?.name || o.supplier_id || '',
        supplierId: o.supplier_id,
        supplierCode: o.supplier?.tax_id || '',
        date: o.order_date?.split('T')[0] || o.created_at?.split('T')[0] || '',
        expectedDate: o.expected_date?.split('T')[0] || '',
        total: o.total || o.total_amount || 0,
        status: o.status,
        warehouse: o.warehouse?.name || '',
        items: Array.isArray(o.items) ? o.items.length : 0,
        paymentStatus: 'pending',
        createdBy: '',
      }));

      const quotationsMapped = (quotationsRes.data || []).map((q) => ({
        id: q.id,
        number: q.number,
        supplier: q.supplier?.name || q.supplier_id || '',
        date: q.quote_date?.split('T')[0] || '',
        expiryDate: q.expiry_date?.split('T')[0] || '',
        total: q.total_amount,
        items: Array.isArray((q as any).items) ? (q as any).items.length : ((q as any).items_count || 0),
        status: q.status,
      }));

      const suppliersMapped = (suppliersRes.data || []).map((s) => ({
        id: s.id,
        name: s.name,
        code: s.tax_id || '',
        contact: s.contact_person || '',
        email: s.email || '',
        phone: s.phone || '',
        active: s.is_active !== false,
      }));

      setPurchaseOrders(ordersMapped);
      setQuotations(quotationsMapped);
      setSuppliers(suppliersMapped);
      setLoading(false);
    });
  }, []);

  const filteredOrders = purchaseOrders.filter(o => {
    const matchesSearch = o.number.toLowerCase().includes(search.toLowerCase()) || o.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || o.supplierId === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.number.toLowerCase().includes(search.toLowerCase()) || q.supplier.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && s.active) || (statusFilter === 'inactive' && !s.active);
    return matchesSearch && matchesStatus;
  });

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta orden de compra?')) return;
    try {
      const api = getApiClient();
      await api.deletePurchaseOrder(id);
      setPurchaseOrders(prev => prev.filter(o => o.id !== id));
    } catch { alert('Error al eliminar la orden'); }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cotización?')) return;
    try {
      const api = getApiClient();
      await api.deleteQuotation(id);
      setQuotations(prev => prev.filter(q => q.id !== id));
    } catch { alert('Error al eliminar la cotización'); }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      const api = getApiClient();
      await api.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch { alert('Error al eliminar el proveedor'); }
  };

  const getOrderStatusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Borrador', variant: 'neutral' as const };
      case 'pending': return { label: 'Pendiente', variant: 'warning' as const };
      case 'confirmed': return { label: 'Confirmada', variant: 'info' as const };
      case 'partial': return { label: 'Parcial', variant: 'info' as const };
      case 'received': return { label: 'Recibida', variant: 'success' as const };
      case 'cancelled': return { label: 'Cancelada', variant: 'danger' as const };
      default: return { label: status, variant: 'neutral' as const };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { label: 'Pagado', variant: 'success' as const };
      case 'partial': return { label: 'Parcial', variant: 'warning' as const };
      case 'pending': return { label: 'Pendiente', variant: 'info' as const };
      case 'refunded': return { label: 'Devuelto', variant: 'danger' as const };
      default: return { label: status, variant: 'neutral' as const };
    }
  };

  const getQuotationStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pendiente', variant: 'warning' as const };
      case 'accepted': return { label: 'Aceptado', variant: 'success' as const };
      case 'rejected': return { label: 'Rechazado', variant: 'danger' as const };
      case 'expired': return { label: 'Vencida', variant: 'danger' as const };
      case 'cancelled': return { label: 'Cancelada', variant: 'neutral' as const };
      default: return { label: status, variant: 'neutral' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compras</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de compras, cotizaciones y proveedores</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          {activeTab === 'orders' && (
            <Link href="/dashboard/purchases/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Orden de Compra
              </Button>
            </Link>
          )}
          {activeTab === 'quotations' && (
            <Link href="/dashboard/purchases/quotations/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </Link>
          )}
          {activeTab === 'suppliers' && (
            <Link href="/dashboard/purchases/suppliers/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Órdenes Pendientes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{purchaseOrders.filter(o => o.status === 'pending' || o.status === 'draft').length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aprobadas</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{purchaseOrders.filter(o => o.status === 'confirmed').length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cotizaciones</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{quotations.length}</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedores</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{suppliers.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${purchaseOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Link href="/dashboard/purchases/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Nueva Orden</span>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/purchases/quotations/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Nueva Cotización</span>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/purchases/suppliers/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Nuevo Proveedor</span>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/purchases/register">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Registro de Compras</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { id: 'orders' as const, label: 'Órdenes de Compra', icon: ShoppingCart, count: purchaseOrders.length },
              { id: 'quotations' as const, label: 'Cotizaciones', icon: FileText, count: quotations.length },
              { id: 'suppliers' as const, label: 'Proveedores', icon: Building2, count: suppliers.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('all'); setSupplierFilter('all'); }}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <Badge variant="neutral">{tab.count}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder={activeTab === 'orders' ? 'Buscar por N° orden, proveedor...' : activeTab === 'quotations' ? 'Buscar por N° Cotización, proveedor...' : 'Buscar por nombre, proveedor...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            {activeTab === 'orders' && (
              <>
                <Select
                  placeholder="Estado"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'draft', label: 'Borrador' },
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'confirmed', label: 'Confirmada' },
                    { value: 'partial', label: 'Parcial' },
                    { value: 'received', label: 'Recibida' },
                    { value: 'cancelled', label: 'Cancelada' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Select
                  placeholder="Proveedor"
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    ...suppliers.map(s => ({ value: s.id, label: s.name })),
                  ]}
                  className="w-full sm:w-48"
                />
              </>
            )}
            {activeTab === 'suppliers' && (
              <Select
                placeholder="Estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Activos' },
                  { value: 'inactive', label: 'Inactivos' },
                ]}
                className="w-full sm:w-40"
              />
            )}
          </div>
        </div>
      </div>

      {/* Orders Section */}
      {activeTab === 'orders' && (
        <div role="tabpanel" aria-labelledby="orders-tab">
          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° orden</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Almacén</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="w-12">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => {
                    const orderConfig = getOrderStatusConfig(order.status);
                    const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-slate-900">{order.number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{order.supplier}</p>
                            <p className="text-xs text-slate-500">{order.supplierCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {order.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-slate-400" />
                            {order.expectedDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{order.warehouse}</TableCell>
                        <TableCell className="text-center font-medium">{order.items}</TableCell>
                        <TableCell className="text-right font-medium">${order.total.toLocaleString('es-CL')}</TableCell>
                        <TableCell>
                          <Badge variant={orderConfig.variant}>{orderConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{order.createdBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/purchases/${order.id}`}>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
               </Table>
               </div>
             </CardContent>
           </Card>

           {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>Mostrando 1 a {filteredOrders.length} de {purchaseOrders.length} Órdenes</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled>Anterior</Button>
              <Button variant="secondary" size="sm" disabled>Siguiente</Button>
            </div>
          </div>
        </div>
      )}

      {/* Quotations Section */}
      {activeTab === 'quotations' && (
        <div role="tabpanel" aria-labelledby="quotations-tab">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Cotización</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quote, index) => {
                    const statusConfig = getQuotationStatusConfig(quote.status);
                    return (
                      <TableRow key={quote.id}>
                        <TableCell className="font-mono text-slate-900">{quote.number}</TableCell>
                        <TableCell>{quote.supplier}</TableCell>
                        <TableCell>{quote.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {quote.expiryDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{quote.items}</TableCell>
                        <TableCell className="text-right font-medium">${quote.total.toLocaleString('es-CL')}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/purchases/quotations/${quote.id}`}>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button onClick={() => handleDeleteQuotation(quote.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suppliers Section */}
      {activeTab === 'suppliers' && (
        <div role="tabpanel" aria-labelledby="suppliers-tab">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Catálogo de Proveedores</CardTitle>
              <Link href="/dashboard/purchases/suppliers/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => {
                    return (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell className="font-mono text-slate-500">{supplier.code}</TableCell>
                        <TableCell className="text-slate-900">{supplier.contact || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <a href={`mailto:${supplier.email}`} className="text-slate-700 hover:text-slate-900">{supplier.email}</a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <Truck className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${supplier.phone}`} className="text-slate-700 hover:text-slate-900">{supplier.phone}</a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.active ? 'success' : 'neutral'}>
                            {supplier.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/purchases/suppliers/${supplier.id}`}>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button onClick={() => handleDeleteSupplier(supplier.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
