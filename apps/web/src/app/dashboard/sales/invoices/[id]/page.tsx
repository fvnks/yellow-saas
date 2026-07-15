'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, CreditCard, User, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';
import { generateBoletaPDF } from '@/lib/pdf-design';

interface InvoiceItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  product?: { id: string; name: string; sku: string };
}

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  status: string;
  invoice_date: string;
  due_date: string;
  payment_terms: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  created_at: string;
  customer?: { id: string; name: string; tax_id: string };
  warehouse?: { id: string; name: string; code: string };
  items?: InvoiceItem[];
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid: { label: 'Pagada', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  issued: { label: 'Emitida', class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  cancelled: { label: 'Anulada', class: 'bg-rose-50 text-rose-700 border border-rose-200' },
  draft: { label: 'Borrador', class: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = getApiClient();
    api.getInvoice(id)
      .then((data) => {
        setInvoice(data as unknown as InvoiceDetail);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    const api = getApiClient();
    const company = await api.getCompany().catch(() => null);
    const doc = await generateBoletaPDF({
      id: invoice.id,
      number: invoice.invoice_number,
      type: 'boleta',
      date: invoice.invoice_date,
      due_date: invoice.due_date,
      company: company ? {
        name: company.name, tax_id: company.tax_id || undefined, razon_social: company.razon_social || undefined,
        giro: company.giro || undefined, address: company.address || undefined, city: company.city || undefined,
        region: company.region || undefined, phone: company.phone || undefined, email: company.email || undefined,
        logo_url: company.logo_url || undefined,
      } : { name: 'Empresa' },
      customer: invoice.customer ? { name: invoice.customer.name, tax_id: invoice.customer.tax_id } : undefined,
      items: (invoice.items || []).map(item => ({
        name: item.product?.name || '',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount_percent,
        tax_rate: item.tax_rate,
        total: item.line_total,
      })),
      subtotal,
      tax_amount: tax,
      total,
      notes: invoice.notes,
    });
    doc.save(`${invoice.invoice_number}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4"><div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" /><div className="h-6 w-48 bg-slate-200 rounded animate-pulse" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">{[1, 2].map(i => <div key={i} className="animate-pulse bg-slate-200 h-48 rounded-xl" />)}</div>
          <div className="animate-pulse bg-slate-200 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/sales" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-slate-500">Factura no encontrada</p>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[invoice.status] || STATUS_MAP.draft;
  const subtotal = invoice.subtotal || (invoice.items || []).reduce((sum, item) => sum + item.line_total, 0);
  const tax = invoice.tax_amount || Math.round(subtotal * 0.19);
  const total = invoice.total_amount || subtotal + tax;

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Header - hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Factura {invoice.invoice_number}</h1>
            <p className="text-sm text-slate-500 mt-1">{invoice.invoice_date}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${status.class}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-0 print:rounded-none" id="print-area">
        <div className="p-8 print:p-4">
          {/* Company header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-3">Y</div>
              <p className="text-lg font-bold text-slate-900">Yellow ERP</p>
              <p className="text-xs text-slate-500">Configura tu empresa en Configuración</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">FACTURA</h2>
              <p className="text-sm font-mono text-slate-600">{invoice.invoice_number}</p>
              <p className="text-xs text-slate-500 mt-2">Fecha: {invoice.invoice_date}</p>
              {invoice.due_date && <p className="text-xs text-slate-500">Vence: {invoice.due_date}</p>}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente</p>
              <p className="text-sm font-medium text-slate-900">{invoice.customer?.name || '—'}</p>
              <p className="text-xs text-slate-500">RUT: {invoice.customer?.tax_id || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Bodega</p>
              <p className="text-sm font-medium text-slate-900">{invoice.warehouse?.name || '—'}</p>
              <p className="text-xs text-slate-500">{invoice.warehouse?.code || ''}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Desc.</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="text-xs font-medium text-slate-900">{item.product?.name || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.product?.sku}</p>
                    </td>
                    <td className="py-3 text-xs text-right text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-xs text-right text-slate-600">${item.unit_price.toLocaleString('es-CL')}</td>
                    <td className="py-3 text-xs text-right text-slate-600">{item.discount_percent}%</td>
                    <td className="py-3 text-xs text-right text-slate-600">{item.tax_rate}%</td>
                    <td className="py-3 text-xs text-right font-medium text-slate-900">${item.line_total.toLocaleString('es-CL')}</td>
                  </tr>
                ))}
                {(!invoice.items || invoice.items.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-slate-400">Sin items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>IVA (19%)</span>
                <span>${tax.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Observaciones</p>
              <p className="text-xs text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400">Documento generado por Yellow ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
