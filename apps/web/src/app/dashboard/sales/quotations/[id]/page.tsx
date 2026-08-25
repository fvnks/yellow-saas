'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Download, ShoppingCart, Trash2, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { generateCotizacionPDF } from '@/lib/pdf-design';
import { usePrintDocument } from '@/components/print/use-print';
import { type DocumentSettings, mergeSettings, DEFAULT_DOCUMENT_SETTINGS } from '@/lib/document-settings';

interface QuotationItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  line_total: number;
  product?: { name: string; sku: string };
}

interface QuotationDetail {
  id: string;
  quotation_number: string;
  status: string;
  customer_id: string;
  valid_until: string;
  notes: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
  customer?: { id: string; name: string; tax_id: string };
  items?: QuotationItem[];
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  draft: { label: 'Borrador', class: 'bg-muted text-foreground border border-border' },
  pending: { label: 'Pendiente', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  sent: { label: 'Enviada', class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  accepted: { label: 'Aceptada', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected: { label: 'Rechazada', class: 'bg-rose-50 text-rose-700 border border-rose-200' },
  expired: { label: 'Vencida', class: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

export default function SalesQuotationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { print } = usePrintDocument();

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesQuotation(id),
      api.getCompany().catch(() => null),
      fetchDocumentSettings(),
    ]).then(([data, companyRes, settingsRes]) => {
      setQuotation(data as unknown as QuotationDetail);
      if (companyRes) setCompany(companyRes);
      if (settingsRes) setSettings(settingsRes);
      setLoading(false);
    }).catch(() => {
      setError('No se pudo cargar la cotización');
      setLoading(false);
    });
  }, [id]);

  async function fetchDocumentSettings() {
    try {
      const companyId = getCompanyIdFromToken();
      if (!companyId) return;
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      if (!token) return;
      const res = await fetch(`/api/companies/${companyId}/settings/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) return mergeSettings(data.data);
    } catch {}
    return DEFAULT_DOCUMENT_SETTINGS;
  }

  const handlePrint = () => {
    if (!quotation) return;
    const c = company || {};
    print('quotation', {
      id: quotation.id,
      number: quotation.quotation_number,
      type: 'cotización',
      date: quotation.created_at,
      status: quotation.status,
      company: {
        name: c.name || 'Empresa', tax_id: c.tax_id, razon_social: c.razon_social,
        giro: c.giro, address: c.address, city: c.city, region: c.region,
        phone: c.phone, email: c.email, logo_url: c.logo_url,
      },
      customer: quotation.customer ? { name: quotation.customer.name, tax_id: quotation.customer.tax_id } : undefined,
      items: (quotation.items || []).map(item => ({
        name: item.product?.name || '', sku: item.product?.sku,
        quantity: item.quantity, unit_price: item.unit_price,
        discount: item.discount_percent, tax_rate: item.tax_rate, total: item.line_total,
      })),
      subtotal, tax_amount: tax, total, notes: quotation.notes,
      valid_until: quotation.valid_until,
      settings,
    });
  };

  const handleDownloadPDF = async () => {
    if (!quotation) return;
    const c = company || {};
    const items = quotation.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.unit_price), 0);
    const tax = Math.round(subtotal * 0.19);
    const doc = await generateCotizacionPDF({
      id: quotation.id,
      number: quotation.quotation_number,
      type: 'cotizacion',
      date: quotation.created_at?.split('T')[0] || '',
      valid_until: quotation.valid_until,
      company: {
        name: c.name || 'Empresa', tax_id: c.tax_id || undefined, razon_social: c.razon_social || undefined,
        giro: c.giro || undefined, address: c.address || undefined, city: c.city || undefined,
        region: c.region || undefined, phone: c.phone || undefined, email: c.email || undefined,
        logo_url: c.logo_url || undefined,
      },
      customer: quotation.customer ? { name: quotation.customer.name, tax_id: quotation.customer.tax_id } : undefined,
      items: items.map(item => ({
        name: item.product?.name || '',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount_percent,
        tax_rate: item.tax_rate,
        total: item.line_total || item.quantity * item.unit_price,
      })),
      subtotal,
      tax_amount: tax,
      total: subtotal + tax,
      notes: quotation.notes,
      settings,
    });
    doc.save(`${quotation.quotation_number}.pdf`);
  };

  const handleConvertToOrder = async () => {
    if (!quotation) return;
    setActionLoading(true);
    try {
      const api = getApiClient();
      await api.updateSalesQuotation(id, { status: 'accepted' });
      await api.createSalesOrder({
        customer_id: quotation.customer_id,
        notes: `Convertido desde ${quotation.quotation_number}`,
        items: (quotation.items || []).map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          tax_rate: item.tax_rate || 19,
        })),
      });
      router.push('/dashboard/sales');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al convertir la cotización');
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;
    setActionLoading(true);
    try {
      const api = getApiClient();
      await api.deleteSalesQuotation(id);
      router.push('/dashboard/sales');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cotización');
      setActionLoading(false);
    }
  };

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
        <div className="animate-pulse bg-muted h-96 rounded-xl" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Cotización no encontrada</h1>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 dark:bg-primary dark:border-border text-center">
          <p className="text-sm text-muted-foreground">{error || 'La cotización solicitada no existe.'}</p>
          <Link href="/dashboard/sales">
            <button className="mt-4 bg-primary hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Volver a Ventas</button>
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[quotation.status] || STATUS_MAP.draft;
  const items = quotation.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.unit_price), 0);
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Header - hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Cotización {quotation.quotation_number}</h1>
            <p className="text-sm text-muted-foreground mt-1">{quotation.created_at?.split('T')[0]}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${status.class}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="bg-primary hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
          {(quotation.status === 'draft' || quotation.status === 'pending' || quotation.status === 'sent') && (
            <button onClick={handleConvertToOrder} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
              <ShoppingCart className="w-4 h-4" /> {actionLoading ? 'Convirtiendo...' : 'Convertir a Orden'}
            </button>
          )}
          {quotation.status === 'draft' && (
            <button onClick={handleDelete} disabled={actionLoading} className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm print:hidden">{error}</div>}

      {/* Document */}
      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border print:shadow-none print:border-0 print:rounded-none" id="print-area">
        <div className="p-8 print:p-4">
          {/* Company header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
            <div>
              {company?.logo_url ? (
                <img src={company.logo_url} alt="Logo" className="h-16 w-auto mb-3" />
              ) : (
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {(company?.name || 'E')[0]}
                </div>
              )}
              <p className="text-lg font-bold text-foreground">{company?.name || 'Empresa'}</p>
              {company?.tax_id && <p className="text-xs text-muted-foreground">RUT: {company.tax_id}</p>}
              {company?.address && <p className="text-xs text-muted-foreground">{company.address}</p>}
              {company?.phone && <p className="text-xs text-muted-foreground">Tel: {company.phone}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-foreground mb-1">COTIZACIÓN</h2>
              <p className="text-sm font-mono text-foreground">{quotation.quotation_number}</p>
              <p className="text-xs text-muted-foreground mt-2">Fecha: {quotation.created_at?.split('T')[0]}</p>
              {quotation.valid_until && <p className="text-xs text-muted-foreground">Válida hasta: {quotation.valid_until}</p>}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cliente</p>
              <p className="text-sm font-medium text-foreground">{quotation.customer?.name || '—'}</p>
              <p className="text-xs text-muted-foreground">RUT: {quotation.customer?.tax_id || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Estado</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${status.class}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cant.</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Precio</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Desc.</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">IVA</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-3">
                      <p className="text-xs font-medium text-foreground">{item.product?.name || '—'}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p>
                    </td>
                    <td className="py-3 text-xs text-right text-foreground">{item.quantity}</td>
                    <td className="py-3 text-xs text-right text-foreground">${item.unit_price.toLocaleString('es-CL')}</td>
                    <td className="py-3 text-xs text-right text-foreground">{item.discount_percent > 0 ? `${item.discount_percent}%` : '—'}</td>
                    <td className="py-3 text-xs text-right text-foreground">{item.tax_rate}%</td>
                    <td className="py-3 text-xs text-right font-medium text-foreground">${(item.line_total || item.quantity * item.unit_price).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">Sin items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-xs text-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-xs text-foreground">
                <span>IVA (19%)</span>
                <span>${tax.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observaciones</p>
              <p className="text-xs text-foreground">{quotation.notes}</p>
            </div>
          )}

          {/* Validity notice */}
          {quotation.valid_until && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg print:bg-white print:border-border">
              <p className="text-xs text-amber-700 print:text-foreground">
                <span className="font-semibold">Válida hasta:</span> {quotation.valid_until}. Esta cotización tiene una vigencia de 30 días desde la fecha de emisión.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-[10px] text-muted-foreground">Documento generado por Yellow ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
