'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Edit, Users, Mail, Phone, MapPin, CreditCard, FileText, ShoppingCart, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface CustomerDetail {
  id: string;
  name: string;
  code: string;
  trade_name: string;
  tax_id: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  created_at: string;
}

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

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomer(id),
      api.getSalesOrders({ customer_id: id }),
      api.getInvoices({ customer_id: id }),
    ]).then(([customerData, ordersRes, invoicesRes]) => {
      setCustomer(customerData as unknown as CustomerDetail);
      setOrders((ordersRes.data || []) as unknown as Order[]);
      setInvoices((invoicesRes.data || []) as unknown as Invoice[]);
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
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent><div className="h-24 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent><div className="h-64 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Cliente no encontrado</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-sm text-slate-500">{error || 'El cliente solicitado no existe.'}</p>
            <Link href="/dashboard/customers">
              <Button className="mt-4">Volver a Clientes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pendingBalance = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
          {customer.trade_name && (
            <p className="text-sm text-slate-500 mt-1">{customer.trade_name}</p>
          )}
        </div>
        <Link href={`/dashboard/customers/${id}/edit`}>
          <Button variant="secondary" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Ordenes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Facturado</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${totalInvoiced.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${pendingBalance.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Información del Cliente</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</p>
                <p className="text-sm font-medium text-slate-900">{customer.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</p>
                <p className="text-sm font-medium text-slate-900 font-mono">{customer.tax_id || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-slate-900">{customer.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Teléfono</p>
                <p className="text-sm font-medium text-slate-900">{customer.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Dirección</p>
                <p className="text-sm font-medium text-slate-900">{customer.address || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</p>
                <Badge variant={customer.is_active ? 'success' : 'danger'}>
                  {customer.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Ordenes Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Número</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    No hay ordenes registradas
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => {
                  const status = statusConfig[order.status] || { label: order.status, variant: 'neutral' as const };
                  return (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{order.order_number}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{order.created_at?.split('T')[0] || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} className="text-[9px]">{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-900 text-right">${(order.total || 0).toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Facturas Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Número</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    No hay facturas registradas
                  </td>
                </tr>
              ) : (
                invoices.slice(0, 5).map((invoice) => {
                  const status = statusConfig[invoice.status] || { label: invoice.status, variant: 'neutral' as const };
                  return (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{invoice.created_at?.split('T')[0] || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} className="text-[9px]">{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-900 text-right">${(invoice.total || 0).toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
