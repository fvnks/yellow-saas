'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@yellow-erp/ui';
import { ArrowLeft, Printer, Edit, Calendar, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../../lib/api-client';

interface QuotationItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  notes: string;
  product?: { name: string; sku: string; unit: string };
}

interface QuotationDetail {
  id: string;
  number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  quote_date: string;
  expiry_date: string;
  valid_until: string;
  payment_terms: string;
  delivery_terms: string;
  notes: string;
  internal_notes: string;
  supplier?: { name: string; tax_id: string; email: string; phone: string };
  items?: QuotationItem[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  accepted: { label: 'Aceptada', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rechazada', variant: 'danger', icon: AlertTriangle },
  expired: { label: 'Vencida', variant: 'danger', icon: Clock },
  cancelled: { label: 'Cancelada', variant: 'neutral', icon: AlertTriangle },
};

export default function QuotationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = getApiClient();
    api.getQuotation(id)
      .then((data) => {
        setQuotation(data as unknown as QuotationDetail);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la cotización');
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

  if (error || !quotation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases?tab=quotations" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Cotización no encontrada</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-sm text-slate-500">{error || 'La cotización solicitada no existe.'}</p>
            <Link href="/dashboard/purchases?tab=quotations">
              <Button className="mt-4">Volver a Cotizaciones</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[quotation.status] || { label: quotation.status, variant: 'neutral' as const, icon: Clock };
  const StatusIcon = status.icon;
  const items = quotation.items || [];
  const subtotal = quotation.subtotal || items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.unit_price), 0);
  const taxAmount = quotation.tax_amount || items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const total = quotation.total_amount || subtotal + taxAmount;
  const isExpired = quotation.expiry_date && new Date(quotation.expiry_date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchases?tab=quotations" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Detalle de Cotización</h1>
            <span className="text-sm font-mono text-slate-500">{quotation.number}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            {isExpired && (
              <Badge variant="danger">Vencida</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Link href={`/dashboard/purchases/quotations/${id}/edit`}>
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
              <CardTitle>Información de la Cotización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</p>
                    <p className="text-sm font-medium text-slate-900">{quotation.supplier?.name || '—'}</p>
                    {quotation.supplier?.email && (
                      <p className="text-xs text-slate-400">{quotation.supplier.email}</p>
                    )}
                    {quotation.supplier?.phone && (
                      <p className="text-xs text-slate-400">{quotation.supplier.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha de Cotización</p>
                    <p className="text-sm font-medium text-slate-900">{quotation.quote_date?.split('T')[0] || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha de Vencimiento</p>
                    <p className={`text-sm font-medium ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                      {quotation.expiry_date || '—'}
                    </p>
                  </div>
                </div>
                {quotation.valid_until && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Válido Hasta</p>
                      <p className="text-sm font-medium text-slate-900">{quotation.valid_until}</p>
                    </div>
                  </div>
                )}
                {quotation.supplier?.tax_id && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">RUT</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT Proveedor</p>
                      <p className="text-sm font-medium text-slate-900">{quotation.supplier.tax_id}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items de la Cotización</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-center">Dto %</TableHead>
                    <TableHead className="text-right">Impuestos</TableHead>
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
                      <TableCell className="text-right">
                        {item.tax_amount > 0 ? (
                          <span className="text-xs text-slate-600">${item.tax_amount.toLocaleString('es-CL')}</span>
                        ) : (
                          <span className="text-xs text-slate-400">Exento</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">${(item.line_total || item.quantity * item.unit_price).toLocaleString('es-CL')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {(quotation.notes || quotation.delivery_terms || quotation.payment_terms) && (
            <Card>
              <CardHeader>
                <CardTitle>Notas y Condiciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotation.payment_terms && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Condiciones de Pago</p>
                    <p className="text-sm text-slate-700">{quotation.payment_terms}</p>
                  </div>
                )}
                {quotation.delivery_terms && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Condiciones de Entrega</p>
                    <p className="text-sm text-slate-700">{quotation.delivery_terms}</p>
                  </div>
                )}
                {quotation.notes && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas</p>
                    <p className="text-sm text-slate-700">{quotation.notes}</p>
                  </div>
                )}
                {quotation.internal_notes && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas Internas</p>
                    <p className="text-sm text-slate-500 italic">{quotation.internal_notes}</p>
                  </div>
                )}
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
                {quotation.discount_amount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Descuento</span>
                    <span className="font-medium text-rose-600">-${quotation.discount_amount.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">IVA (19%)</span>
                  <span className="font-medium text-slate-900">${taxAmount.toLocaleString('es-CL')}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">${total.toLocaleString('es-CL')}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estado:</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                {quotation.expiry_date && (
                  <div className="flex items-center justify-between">
                    <span>Vence:</span>
                    <span className={`font-medium ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                      {quotation.expiry_date}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button variant="secondary" className="w-full">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Cotización
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
