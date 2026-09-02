'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Edit, Users, Mail, Phone, MapPin, CreditCard, FileText, ShoppingCart, DollarSign, Building2, Globe, Hash, Tag, BarChart3, Activity, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import CustomerContacts from '../components/CustomerContacts';
import CustomerAddresses from '../components/CustomerAddresses';
import CustomerActivities from '../components/CustomerActivities';
import CustomerAnalytics from '../components/CustomerAnalytics';
import CustomerDocuments from '../components/CustomerDocuments';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  delivered: { label: 'Entregado', variant: 'success' },
  shipped: { label: 'Enviado', variant: 'info' },
  processing: { label: 'Procesando', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'neutral' },
  draft: { label: 'Borrador', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
  paid: { label: 'Pagada', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  overdue: { label: 'Vencida', variant: 'danger' },
};

type Tab = 'info' | 'contacts' | 'addresses' | 'orders' | 'invoices' | 'activities' | 'analytics' | 'documents';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [segment, setSegment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomer(id),
      api.getSalesOrders({ customer_id: id }),
      api.getInvoices({ customer_id: id }),
    ]).then(([customerData, ordersRes, invoicesRes]) => {
      setCustomer(customerData);
      setOrders((ordersRes.data || []) as any[]);
      setInvoices((invoicesRes.data || []) as any[]);
      if ((customerData as any).category_id) {
        api.getCustomerCategories().then(res => {
          const cat = (res.data || []).find((c: any) => c.id === (customerData as any).category_id);
          if (cat) setCategory(cat);
        }).catch(() => {});
      }
      if ((customerData as any).segment_id) {
        api.getCustomerSegments().then(res => {
          const seg = (res.data || []).find((s: any) => s.id === (customerData as any).segment_id);
          if (seg) setSegment(seg);
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => {
      setError('No se pudo cargar el cliente');
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent><div className="h-24 bg-muted rounded animate-pulse" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent><div className="h-64 bg-muted rounded animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Cliente no encontrado</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-sm text-muted-foreground">{error || 'El cliente solicitado no existe.'}</p>
            <Link href="/dashboard/customers">
              <Button className="mt-4">Volver a Clientes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
  const pendingBalance = invoices
    .filter((inv: any) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Información' },
    { id: 'contacts', label: 'Contactos' },
    { id: 'addresses', label: 'Direcciones' },
    { id: 'orders', label: 'Órdenes', count: totalOrders },
    { id: 'invoices', label: 'Facturas', count: invoices.length },
    { id: 'activities', label: 'Actividades' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'documents', label: 'Documentos' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {customer.trade_name && <p className="text-sm text-muted-foreground">{customer.trade_name}</p>}
            {customer.tax_id && <span className="font-mono text-xs text-muted-foreground">{customer.tax_id}</span>}
            <Badge variant={customer.is_active ? 'success' : 'danger'}>{customer.is_active ? 'Activo' : 'Inactivo'}</Badge>
          </div>
        </div>
        <Link href={`/dashboard/customers/${id}/edit`}>
          <Button variant="secondary" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Órdenes</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Facturado</p>
              <p className="text-2xl font-bold text-foreground mt-1">${totalInvoiced.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-foreground mt-1">${pendingBalance.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Límite Crédito</p>
              <p className="text-2xl font-bold text-foreground mt-1">${(customer.credit_limit || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-border text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-[9px] bg-muted text-foreground px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Información General</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoRow icon={<Users className="w-4 h-4 text-primary" />} label="Nombre" value={customer.name} />
                <InfoRow icon={<Hash className="w-4 h-4 text-primary" />} label="Código" value={customer.code} />
                <InfoRow icon={<Building2 className="w-4 h-4 text-primary" />} label="Razón Social" value={customer.trade_name} />
                <InfoRow icon={<CreditCard className="w-4 h-4 text-primary" />} label="RUT" value={customer.tax_id} mono />
                <InfoRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={customer.email} />
                <InfoRow icon={<Phone className="w-4 h-4 text-primary" />} label="Teléfono" value={customer.phone} />
                <InfoRow icon={<Globe className="w-4 h-4 text-primary" />} label="Sitio Web" value={customer.website} />
                <InfoRow icon={<MapPin className="w-4 h-4 text-primary" />} label="Dirección" value={customer.address} />
                <InfoRow icon={<MapPin className="w-4 h-4 text-primary" />} label="Ciudad" value={customer.city} />
                <InfoRow icon={<MapPin className="w-4 h-4 text-primary" />} label="Región" value={customer.region} />
                <InfoRow icon={<MapPin className="w-4 h-4 text-primary" />} label="País" value={customer.country} />
                <InfoRow icon={<FileText className="w-4 h-4 text-primary" />} label="Estado" value={customer.is_active ? 'Activo' : 'Inactivo'} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Crédito y Pagos</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<CreditCard className="w-4 h-4 text-primary" />} label="Límite de Crédito" value={`$${(customer.credit_limit || 0).toLocaleString('es-CL')}`} />
                  <InfoRow icon={<CreditCard className="w-4 h-4 text-primary" />} label="Saldo Actual" value={`$${(customer.current_balance || 0).toLocaleString('es-CL')}`} />
                  <InfoRow icon={<FileText className="w-4 h-4 text-primary" />} label="Plazo de Pago" value={`${customer.payment_terms || 0} días`} />
                  <InfoRow icon={<FileText className="w-4 h-4 text-primary" />} label="Exento IVA" value={customer.tax_exempt ? 'Sí' : 'No'} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Clasificación</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Tag className="w-4 h-4 text-primary" />} label="Categoría" value={category?.name || '—'} />
                  <InfoRow icon={<Tag className="w-4 h-4 text-primary" />} label="Segmento" value={segment?.name || '—'} />
                </div>
                {customer.notes && (
                  <div className="mt-4">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notas</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && <CustomerContacts customerId={id} />}
      {activeTab === 'addresses' && <CustomerAddresses customerId={id} />}

      {activeTab === 'orders' && (
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Órdenes de Venta</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Número</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No hay órdenes registradas</td></tr>
                ) : orders.map((order: any) => {
                  const status = statusConfig[order.status] || { label: order.status, variant: 'neutral' as const };
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{order.order_number}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{order.created_at?.split('T')[0] || '—'}</td>
                      <td className="px-4 py-3"><Badge variant={status.variant} className="text-[9px]">{status.label}</Badge></td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground text-right">${(order.total || 0).toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Facturas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Número</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No hay facturas registradas</td></tr>
                ) : invoices.map((invoice: any) => {
                  const status = statusConfig[invoice.status] || { label: invoice.status, variant: 'neutral' as const };
                  return (
                    <tr key={invoice.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{invoice.created_at?.split('T')[0] || '—'}</td>
                      <td className="px-4 py-3"><Badge variant={status.variant} className="text-[9px]">{status.label}</Badge></td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground text-right">${(invoice.total || 0).toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activities' && <CustomerActivities customerId={id} />}

      {activeTab === 'analytics' && <CustomerAnalytics customerId={id} />}

      {activeTab === 'documents' && <CustomerDocuments customerId={id} />}
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  );
}
