'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Printer, ArrowLeft } from 'lucide-react';
import { generateBoletaPDF, generateCotizacionPDF, generateOrdenVentaPDF, generateOrdenCompraPDF, DocumentData } from '@/lib/pdf-design';
import { usePrintDocument, type PrintDocumentType } from '@/components/print/use-print';

const DOC_TYPE_LABELS: Record<string, string> = {
  boleta: 'Boleta de Venta',
  factura: 'Factura de Venta',
  cotizacion: 'Cotización',
  'orden-venta': 'Orden de Venta',
  'orden-compra': 'Orden de Compra',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PublicDocumentPage({ params }: { params: { type: string; id: string } }) {
  const { type, id } = params;
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { print } = usePrintDocument();

  useEffect(() => {
    fetch(`/api/public/${type}/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setDoc(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Documento no encontrado');
        setLoading(false);
      });
  }, [type, id]);

  const handleDownloadPDF = async () => {
    if (!doc) return;
    let pdfDoc;
    switch (doc.type) {
      case 'boleta':
      case 'factura': pdfDoc = await generateBoletaPDF(doc); break;
      case 'cotizacion': pdfDoc = await generateCotizacionPDF(doc); break;
      case 'orden_venta': pdfDoc = await generateOrdenVentaPDF(doc); break;
      case 'orden_compra': pdfDoc = await generateOrdenCompraPDF(doc); break;
      default: return;
    }
    pdfDoc.save(`${doc.number || 'documento'}.pdf`);
  };

  const handlePrint = () => {
    if (!doc) return;
    const printType: PrintDocumentType = doc.type === 'boleta' ? 'boleta' : doc.type === 'factura' ? 'factura' : doc.type === 'cotizacion' ? 'quotation' : doc.type === 'orden_venta' ? 'sales-order' : 'purchase-order';
    print(printType, {
      id: doc.id,
      number: doc.number,
      type: doc.type,
      date: doc.date,
      due_date: doc.due_date,
      company: doc.company,
      customer: doc.customer,
      supplier: doc.supplier,
      items: doc.items.map(item => ({
        name: item.name, sku: item.sku, quantity: item.quantity,
        unit_price: item.unit_price, discount: item.discount,
        tax_rate: item.tax_rate, total: item.total,
      })),
      subtotal: doc.subtotal,
      tax_amount: doc.tax_amount,
      total: doc.total,
      notes: doc.notes,
      valid_until: doc.valid_until,
      delivery_date: doc.delivery_date,
      warehouse: doc.warehouse,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Documento no encontrado</h1>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const party = doc.customer || doc.supplier;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar - hidden on print */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">Y</div>
          <span className="text-sm font-semibold text-slate-900">Yellow ERP</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-900 hover:bg-black text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto py-8 px-4 print:py-0 print:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          {/* Header */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {doc.company.logo_url && (
                  <img src={doc.company.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{doc.company.name}</h1>
                  {doc.company.tax_id && <p className="text-xs text-slate-500">RUT: {doc.company.tax_id}</p>}
                  {doc.company.razon_social && <p className="text-xs text-slate-500">{doc.company.razon_social}</p>}
                  {doc.company.giro && <p className="text-xs text-slate-500">Giro: {doc.company.giro}</p>}
                  {doc.company.address && <p className="text-xs text-slate-500">{doc.company.address}</p>}
                  {doc.company.phone && <p className="text-xs text-slate-500">Tel: {doc.company.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg mb-2">
                  {DOC_TYPE_LABELS[type] || type}
                </span>
                <p className="text-sm font-mono font-semibold text-slate-900">{doc.number}</p>
                <p className="text-xs text-slate-500">Fecha: {formatDate(doc.date)}</p>
                {doc.due_date && <p className="text-xs text-slate-500">Vence: {formatDate(doc.due_date)}</p>}
                {doc.valid_until && <p className="text-xs text-slate-500">Válido hasta: {formatDate(doc.valid_until)}</p>}
              </div>
            </div>
          </div>

          {/* Party info */}
          {party && (
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {doc.customer ? 'Cliente' : 'Proveedor'}
              </p>
              <p className="text-sm font-medium text-slate-900">{party.name}</p>
              {party.tax_id && <p className="text-xs text-slate-500">RUT: {party.tax_id}</p>}
              {party.address && <p className="text-xs text-slate-500">{party.address}</p>}
            </div>
          )}

          {/* Items table */}
          <div className="p-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="text-center py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">P. Unit.</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 text-slate-500">{i + 1}</td>
                    <td className="py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{item.sku || '—'}</td>
                    <td className="py-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-8">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(doc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>IVA (19%)</span>
                  <span>{formatCurrency(doc.tax_amount)}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(doc.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {doc.notes && (
            <div className="px-8 pb-8">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas</p>
              <p className="text-sm text-slate-600">{doc.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[9px] text-slate-400">Documento generado por Yellow ERP · {doc.number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
