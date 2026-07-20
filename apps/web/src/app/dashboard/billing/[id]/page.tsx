'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, CheckCircle2, Clock, AlertCircle, Send, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700', icon: Clock },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700', icon: Send },
  paid: { label: 'Pagada', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  overdue: { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  partial: { label: 'Pago Parcial', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInvoice(); }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const api = getApiClient();
      const res = await api.getInvoice(invoiceId);
      setInvoice(res);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatus = async (status: string) => {
    try {
      const api = getApiClient();
      await api.updateInvoice(invoiceId, { status });
      loadInvoice();
    } catch (err: any) { alert(err?.message || 'Error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Eliminar esta factura?')) return;
    try {
      const api = getApiClient();
      await api.deleteInvoice(invoiceId);
      router.push('/dashboard/billing');
    } catch (err: any) { alert(err?.message || 'Error'); }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-1/3" /></div>;
  if (!invoice) return <div className="text-center py-12 text-sm text-slate-500">Factura no encontrada</div>;

  const st = statusConfig[invoice.status] || statusConfig.draft;
  const StatusIcon = st.icon;
  const items = invoice.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/billing" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{invoice.invoice_number}</h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.color}`}>
              <StatusIcon className="w-3 h-3" /> {st.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{invoice.customer?.name || 'Sin cliente'}</p>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <button onClick={() => handleStatus('sent')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Enviar
            </button>
          )}
          {['sent', 'overdue', 'partial'].includes(invoice.status) && (
            <button onClick={() => handleStatus('paid')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Marcar Pagada
            </button>
          )}
          {invoice.status === 'draft' && (
            <button onClick={handleDelete}
              className="bg-white border border-slate-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Subtotal</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">${Number(invoice.subtotal || 0).toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">${Number(invoice.tax_amount || 0).toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descuento</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">${Number(invoice.discount_amount || 0).toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${Number(invoice.total_amount || 0).toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Emision</p>
          <p className="text-sm text-slate-900 mt-1">{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('es-CL') : '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Vencimiento</p>
          <p className="text-sm text-slate-900 mt-1">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('es-CL') : '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo Documento</p>
          <p className="text-sm text-slate-900 mt-1 capitalize">{invoice.document_type || 'factura'}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Detalle de Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Dto%</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA%</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.unit_price) || 0;
                const disc = parseFloat(item.discount) || 0;
                const lineTotal = qty * price * (1 - disc / 100);
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{item.product?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{item.description || '—'}</td>
                    <td className="px-4 py-3 text-xs text-center text-slate-700">{qty}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-900">${price.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-center text-slate-700">{disc}%</td>
                    <td className="px-4 py-3 text-xs text-center text-slate-700">{item.tax_rate || 19}%</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">${lineTotal.toLocaleString('es-CL')}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-slate-900">Totales</td>
                <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">${Number(invoice.total_amount || 0).toLocaleString('es-CL')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {invoice.notes && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Notas</h3>
          <p className="text-xs text-slate-600">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
