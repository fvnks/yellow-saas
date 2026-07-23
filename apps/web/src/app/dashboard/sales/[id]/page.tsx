'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Printer, Send, Edit, X, Calendar, User, CreditCard, Truck, MapPin, Download } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { generateOrdenVentaPDF } from '@/lib/pdf-design';
import { usePrintDocument } from '@/components/print/use-print';

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  line_total: number;
  product?: { name: string; sku: string };
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_date: string;
  payment_terms: number;
  notes: string;
  created_at: string;
  customer?: { name: string; tax_id: string };
  warehouse?: { name: string };
  items?: OrderItem[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  delivered: { label: 'Entregado', variant: 'success' },
  shipped: { label: 'Enviado', variant: 'info' },
  processing: { label: 'Procesando', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'neutral' },
  draft: { label: 'Borrador', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

export default function SaleDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const { print } = usePrintDocument();

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrder(id),
      api.getCompany().catch(() => null),
    ]).then(([data, companyRes]) => {
      setOrder(data as unknown as OrderDetail);
      if (companyRes) setCompany(companyRes);
      setLoading(false);
    }).catch(() => {
      setError('No se pudo cargar la orden');
      setLoading(false);
    });
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!order) return;
    const api = getApiClient();
    const company = await api.getCompany().catch(() => null);
    const items = order.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.unit_price), 0);
    const tax = Math.round(subtotal * 0.19);
    const doc = await generateOrdenVentaPDF({
      id: order.id,
      number: order.order_number,
      type: 'orden_venta',
      date: order.created_at?.split('T')[0] || '',
      delivery_date: order.delivery_date,
      payment_terms: order.payment_terms,
      company: company ? {
        name: company.name, tax_id: company.tax_id || undefined, razon_social: company.razon_social || undefined,
        giro: company.giro || undefined, address: company.address || undefined, city: company.city || undefined,
        region: company.region || undefined, phone: company.phone || undefined, email: company.email || undefined,
        logo_url: company.logo_url || undefined,
      } : { name: 'Empresa' },
      customer: order.customer ? { name: order.customer.name, tax_id: order.customer.tax_id } : undefined,
      items: items.map(item => ({
        name: item.product?.name || 'Producto',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount_percent,
        tax_rate: 19,
        total: item.line_total || item.quantity * item.unit_price,
      })),
      subtotal,
      tax_amount: tax,
      total: order.total || subtotal + tax,
      notes: order.notes,
    });
    doc.save(`${order.order_number}.pdf`);
  };

  const handlePrint = () => {
    if (!order) return;
    const c = company || {};
    print('sales-order', {
      id: order.id,
      number: order.order_number,
      type: 'orden de venta',
      date: order.created_at,
      status: order.status,
      company: {
        name: c.name || 'Empresa', tax_id: c.tax_id, razon_social: c.razon_social,
        giro: c.giro, address: c.address, city: c.city, region: c.region,
        phone: c.phone, email: c.email, logo_url: c.logo_url,
      },
      customer: order.customer ? { name: order.customer.name, tax_id: order.customer.tax_id } : undefined,
      items: (order.items || []).map(item => ({
        name: item.product?.name || '', sku: item.product?.sku,
        quantity: item.quantity, unit_price: item.unit_price,
        discount: item.discount_percent, total: item.line_total,
      })),
      subtotal, tax_amount: tax, total, notes: order.notes,
      warehouse: order.warehouse?.name,
      delivery_date: order.delivery_date,
      payment_terms: order.payment_terms,
    });
  };

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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent><div className="h-48 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
            <Card><CardContent><div className="h-32 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
          </div>
          <Card><CardContent><div className="h-32 bg-slate-100 rounded animate-pulse" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Orden no encontrada</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-sm text-slate-500">{error || 'La orden solicitada no existe.'}</p>
            <Link href="/dashboard/sales">
              <Button className="mt-4">Volver a Ventas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      const api = getApiClient();
      await (api as any).request(`/sales-orders/${id}/send-email`, { method: 'POST' });
      toast.success('Email enviado correctamente');
    } catch {
      toast.error('Error al enviar email. Intenta nuevamente.');
    }
    setEmailSending(false);
  };

  const status = statusConfig[order.status] || { label: order.status, variant: 'neutral' as const };
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.unit_price), 0);
  const tax = Math.round(subtotal * 0.19);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Detalle de Venta</h1>
            <span className="text-sm font-mono text-slate-500">{order.order_number}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSendEmail} disabled={emailSending}>
            <Send className="w-4 h-4 mr-2" />
            {emailSending ? 'Enviando...' : 'Enviar'}
          </Button>
          <Link href={`/dashboard/sales/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</p>
                    <p className="text-sm font-medium text-slate-900">{order.customer?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{order.customer?.tax_id || ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha de Orden</p>
                    <p className="text-sm font-medium text-slate-900">{order.created_at?.split('T')[0] || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha de Entrega</p>
                    <p className="text-sm font-medium text-slate-900">{order.delivery_date || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Plazo de Pago</p>
                    <p className="text-sm font-medium text-slate-900">{order.payment_terms ? `${order.payment_terms} días` : 'Contado'}</p>
                  </div>
                </div>
              </div>
              {order.warehouse && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</p>
                      <p className="text-sm font-medium text-slate-900">{order.warehouse.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-center">Dto %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{item.product?.name || 'Producto'}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{item.product?.sku || item.product_id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unit_price.toLocaleString('es-CL')}</TableCell>
                      <TableCell className="text-center">
                        {item.discount_percent > 0 ? (
                          <Badge variant="warning">{item.discount_percent}%</Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">${(item.line_total || item.quantity * item.unit_price).toLocaleString('es-CL')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">IVA (19%)</span>
                  <span className="font-medium text-slate-900">${tax.toLocaleString('es-CL')}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">${order.total?.toLocaleString('es-CL') || (subtotal + tax).toLocaleString('es-CL')}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Moneda:</span>
                  <span className="font-medium">CLP</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="secondary" className="w-full" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button className="w-full" onClick={handleSendEmail} disabled={emailSending}>
                  <Send className="w-4 h-4 mr-2" />
                  {emailSending ? 'Enviando...' : 'Enviar por Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
