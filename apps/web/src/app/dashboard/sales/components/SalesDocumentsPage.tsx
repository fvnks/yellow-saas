'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Eye, Download, FileText, Filter, X, ChevronDown } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Badge } from '@yellow-erp/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UnifiedDocument {
  id: string;
  type: 'invoice' | 'credit_note' | 'debit_note' | 'delivery_guide';
  typeLabel: string;
  number: string;
  customerName: string;
  customerRut?: string;
  date: string;
  dueDate?: string;
  amount: number;
  status: string;
  siiStatus: string;
  siiTrackId?: string;
  siiXml?: string;
  siiError?: string;
  items?: any[];
  documentType?: 'factura' | 'boleta';
  guideNumber?: string;
  warehouseName?: string;
  transport?: string;
  referenceInvoice?: string;
  reason?: string;
}

const DOC_TYPE_CONFIG = {
  invoice: { label: 'Factura', color: 'bg-violet-50 text-violet-700 border border-violet-200' },
  credit_note: { label: 'Nota Crédito', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  debit_note: { label: 'Nota Débito', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  delivery_guide: { label: 'Guía Despacho', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

const SII_STATUS_CONFIG: Record<string, { label: string; color: 'green' | 'red' | 'gray'; badge: string }> = {
  accepted: { label: 'Aceptado', color: 'green', badge: 'bg-emerald-500' },
  rejected: { label: 'Rechazado', color: 'red', badge: 'bg-rose-500' },
  sent: { label: 'Enviado', color: 'gray', badge: 'bg-blue-500' },
  pending: { label: 'Pendiente', color: 'gray', badge: 'bg-slate-400' },
  cancelled: { label: 'Anulado', color: 'gray', badge: 'bg-slate-500' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  paid: { label: 'Pagada', variant: 'success' },
  partial: { label: 'Pago Parcial', variant: 'info' },
  overdue: { label: 'Vencida', variant: 'danger' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
  issued: { label: 'Emitida', variant: 'info' },
  applied: { label: 'Aplicada', variant: 'success' },
  in_transit: { label: 'En Tránsito', variant: 'info' },
  delivered: { label: 'Entregado', variant: 'success' },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL');
}

function getSiiSemaphore(siiStatus: string) {
  const config = SII_STATUS_CONFIG[siiStatus] || SII_STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold ${config.badge} text-white`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color === 'green' ? 'bg-emerald-300' : config.color === 'red' ? 'bg-rose-300' : 'bg-slate-300'}`} />
      {config.label}
    </span>
  );
}

function generateInvoiceXml(doc: UnifiedDocument) {
  const itemsXml = (doc.items || []).map((item, i) => `
    <DscRcgGlobal>
      <NroLinDet>${i + 1}</NroLinDet>
      <NmbItem>${item.description || ''}</NmbItem>
      <QtyItem>${item.quantity}</QtyItem>
      <PrcItem>${item.unit_price}</PrcItem>
      <MontoItem>${item.line_total || item.quantity * item.unit_price}</MontoItem>
    </DscRcgGlobal>`).join('');

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="${doc.number}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>${doc.documentType === 'boleta' ? '39' : '33'}</TipoDTE>
        <Folio>${doc.number.split('-').pop()}</Folio>
        <FchEmis>${doc.date}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>76000000-0</RUTEmisor>
        <RznSoc>Mi Empresa SpA</RznSoc>
      </Emisor>
      <Receptor>
        <RUTRecep>${doc.customerRut || '66666666-6'}</RUTRecep>
        <RznSocRecep>${doc.customerName}</RznSocRecep>
      </Receptor>
      <Totales>
        <MntNeto>${Math.round(doc.amount / 1.19)}</MntNeto>
        <IVA>${Math.round(doc.amount * 0.19 / 1.19)}</IVA>
        <MntTotal>${doc.amount}</MntTotal>
      </Totales>
    </Encabezado>
    <Detalle>${itemsXml}</Detalle>
  </Documento>
</DTE>`;
}

function generateCreditNoteXml(doc: UnifiedDocument) {
  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="${doc.number}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>61</TipoDTE>
        <Folio>${doc.number.split('-').pop()}</Folio>
        <FchEmis>${doc.date}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>76000000-0</RUTEmisor>
        <RznSoc>Mi Empresa SpA</RznSoc>
      </Emisor>
      <Receptor>
        <RUTRecep>${doc.customerRut || '66666666-6'}</RUTRecep>
        <RznSocRecep>${doc.customerName}</RznSocRecep>
      </Receptor>
      <Referencia>
        <NroLinRef>1</NroLinRef>
        <TpoDocRef>${doc.documentType === 'boleta' ? '39' : '33'}</TpoDocRef>
        <FolioRef>${doc.referenceInvoice || doc.number}</FolioRef>
        <RazonRef>${doc.reason || 'Devolución'}</RazonRef>
      </Referencia>
      <Totales>
        <MntTotal>${doc.amount}</MntTotal>
      </Totales>
    </Encabezado>
  </Documento>
</DTE>`;
}

function generateDebitNoteXml(doc: UnifiedDocument) {
  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="${doc.number}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>56</TipoDTE>
        <Folio>${doc.number.split('-').pop()}</Folio>
        <FchEmis>${doc.date}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>76000000-0</RUTEmisor>
        <RznSoc>Mi Empresa SpA</RznSoc>
      </Emisor>
      <Receptor>
        <RUTRecep>${doc.customerRut || '66666666-6'}</RUTRecep>
        <RznSocRecep>${doc.customerName}</RznSocRecep>
      </Receptor>
      <Referencia>
        <NroLinRef>1</NroLinRef>
        <TpoDocRef>${doc.documentType === 'boleta' ? '39' : '33'}</TpoDocRef>
        <FolioRef>${doc.referenceInvoice || doc.number}</FolioRef>
        <RazonRef>${doc.reason || 'Ajuste de precio'}</RazonRef>
      </Referencia>
      <Totales>
        <MntTotal>${doc.amount}</MntTotal>
      </Totales>
    </Encabezado>
  </Documento>
</DTE>`;
}

function generateDeliveryGuideXml(doc: UnifiedDocument) {
  const itemsXml = (doc.items || []).map((item, i) => `
    <Item>
      <NroLinDet>${i + 1}</NroLinDet>
      <NmbItem>${item.description || item.product?.name || ''}</NmbItem>
      <QtyItem>${item.quantity}</QtyItem>
    </Item>`).join('');

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="${doc.guideNumber || doc.number}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>52</TipoDTE>
        <Folio>${doc.guideNumber?.split('-').pop() || doc.number}</Folio>
        <FchEmis>${doc.date}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>76000000-0</RUTEmisor>
        <RznSoc>Mi Empresa SpA</RznSoc>
      </Emisor>
      <Despacho>
        <TpoDespacho>1</TpoDespacho>
        <DirOrigen>Bodega ${doc.warehouseName || 'Principal'}</DirOrigen>
        <DirDestino>${doc.customerName}</DirDestino>
      </Despacho>
    </Encabezado>
    <Detalle>${itemsXml}</Detalle>
  </Documento>
</DTE>`;
}

function openPdfPreview(doc: UnifiedDocument) {
  let html = '';

  if (doc.type === 'invoice') {
    html = `<!DOCTYPE html><html><head><title>${doc.typeLabel} ${doc.number}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
    h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
    .row{display:flex;justify-content:space-between;margin:4px 0}
    .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
    @media print{body{padding:20px}}</style></head><body>
    <h1>${doc.typeLabel} N° ${doc.number}</h1>
    <div class="row"><span><b>Cliente:</b> ${doc.customerName}</span><span><b>RUT:</b> ${doc.customerRut || '—'}</span></div>
    <div class="row"><span><b>Fecha:</b> ${formatDate(doc.date)}</span><span><b>Vencimiento:</b> ${doc.dueDate ? formatDate(doc.dueDate) : '—'}</span></div>
    <div class="row"><span><b>Tipo:</b> ${doc.documentType || 'factura'}</span></div>
    <h3 style="margin-top:16px">Items</h3>
    <table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid #333"><th style="text-align:left;padding:4px">Descripción</th><th style="text-align:right;padding:4px">Cant.</th><th style="text-align:right;padding:4px">Precio</th><th style="text-align:right;padding:4px">Total</th></tr></thead>
    <tbody>${(doc.items || []).map(item => `<tr><td style="padding:4px">${item.description}</td><td style="text-align:right;padding:4px">${item.quantity}</td><td style="text-align:right;padding:4px">$${item.unit_price.toLocaleString('es-CL')}</td><td style="text-align:right;padding:4px">$${(item.line_total || item.quantity * item.unit_price).toLocaleString('es-CL')}</td></tr>`).join('')}</tbody></table>
    <div class="total">TOTAL: ${formatCurrency(doc.amount)}</div>
    <script>window.onload=function(){window.print()}</script></body></html>`;
  } else if (doc.type === 'credit_note') {
    html = `<!DOCTYPE html><html><head><title>NC ${doc.number}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
    h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
    .row{display:flex;justify-content:space-between;margin:4px 0}
    .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
    @media print{body{padding:20px}}</style></head><body>
    <h1>NOTA DE CRÉDITO N° ${doc.number}</h1>
    <div class="row"><span><b>Cliente:</b> ${doc.customerName}</span><span><b>RUT:</b> ${doc.customerRut || '—'}</span></div>
    <div class="row"><span><b>Fecha:</b> ${formatDate(doc.date)}</span></div>
    <div class="row"><span><b>Motivo:</b> ${doc.reason || '—'}</span></div>
    <div class="row"><span><b>Factura Ref:</b> ${doc.referenceInvoice || '—'}</span></div>
    <div class="total" style="margin-top:24px;font-size:18px;border-top:2px solid #333;padding-top:8px">MONTO NC: ${formatCurrency(doc.amount)}</div>
    <script>window.onload=function(){window.print()}</script></body></html>`;
  } else if (doc.type === 'debit_note') {
    html = `<!DOCTYPE html><html><head><title>ND ${doc.number}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
    h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
    .row{display:flex;justify-content:space-between;margin:4px 0}
    .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
    @media print{body{padding:20px}}</style></head><body>
    <h1>NOTA DE DÉBITO N° ${doc.number}</h1>
    <div class="row"><span><b>Cliente:</b> ${doc.customerName}</span><span><b>RUT:</b> ${doc.customerRut || '—'}</span></div>
    <div class="row"><span><b>Fecha:</b> ${formatDate(doc.date)}</span></div>
    <div class="row"><span><b>Motivo:</b> ${doc.reason || '—'}</span></div>
    <div class="row"><span><b>Factura Ref:</b> ${doc.referenceInvoice || '—'}</span></div>
    <div class="total" style="margin-top:24px;font-size:18px;border-top:2px solid #333;padding-top:8px">MONTO ND: ${formatCurrency(doc.amount)}</div>
    <script>window.onload=function(){window.print()}</script></body></html>`;
  } else if (doc.type === 'delivery_guide') {
    html = `<!DOCTYPE html><html><head><title>GD ${doc.guideNumber || doc.number}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
    h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
    .row{display:flex;justify-content:space-between;margin:4px 0}
    @media print{body{padding:20px}}</style></head><body>
    <h1>GUÍA DE DESPACHO N° ${doc.guideNumber || doc.number}</h1>
    <div class="row"><span><b>Bodega:</b> ${doc.warehouseName || '—'}</span><span><b>Fecha:</b> ${formatDate(doc.date)}</span></div>
    <div class="row"><span><b>Transportista:</b> ${doc.transport || '—'}</span></div>
    <div class="row"><span><b>Cliente/Destino:</b> ${doc.customerName}</span></div>
    <h3 style="margin-top:16px">Items</h3>
    <table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid #333"><th style="text-align:left;padding:4px">Descripción</th><th style="text-align:right;padding:4px">Cantidad</th></tr></thead>
    <tbody>${(doc.items || []).map(item => `<tr><td style="padding:4px">${item.description || item.product?.name || ''}</td><td style="text-align:right;padding:4px">${item.quantity}</td></tr>`).join('')}</tbody></table>
    <script>window.onload=function(){window.print()}</script></body></html>`;
  }

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

function downloadXml(filename: string, xml: string) {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function SalesDocumentsPage() {
  const [documents, setDocuments] = useState<UnifiedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'credit_note' | 'debit_note' | 'delivery_guide'>('all');
  const [siiFilter, setSiiFilter] = useState<'all' | 'accepted' | 'rejected' | 'sent' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: String(ITEMS_PER_PAGE), offset: String((page - 1) * ITEMS_PER_PAGE) };
      if (search) params.search = search;

      const [invoicesRes, creditNotesRes, debitNotesRes, guidesRes] = await Promise.all([
        api.getInvoices(params),
        api.getCreditNotes(params),
        api.getDebitNotes(params),
        api.getDeliveryGuides(params),
      ]);

      const allDocs: UnifiedDocument[] = [];

      (invoicesRes.data || []).forEach((inv: any) => {
        allDocs.push({
          id: inv.id,
          type: 'invoice',
          typeLabel: DOC_TYPE_CONFIG.invoice.label,
          number: inv.invoice_number,
          customerName: inv.customer?.name || '—',
          customerRut: inv.customer?.tax_id,
          date: inv.invoice_date || inv.created_at,
          dueDate: inv.due_date,
          amount: Number(inv.total_amount || 0),
          status: inv.status,
          siiStatus: inv.sii_status || 'pending',
          siiTrackId: inv.sii_track_id,
          siiXml: inv.sii_xml,
          siiError: inv.sii_error,
          items: inv.items,
          documentType: inv.document_type,
        });
      });

      (creditNotesRes.data || []).forEach((cn: any) => {
        allDocs.push({
          id: cn.id,
          type: 'credit_note',
          typeLabel: DOC_TYPE_CONFIG.credit_note.label,
          number: cn.number,
          customerName: cn.customer_name || '—',
          customerRut: cn.customer_rut,
          date: cn.credit_date || cn.created_at,
          amount: Number(cn.total_amount || 0),
          status: cn.status,
          siiStatus: cn.sii_status || 'pending',
          siiTrackId: cn.sii_track_id,
          siiXml: cn.sii_xml,
          siiError: cn.sii_error,
          referenceInvoice: cn.invoice_number,
          reason: cn.reason,
        });
      });

      (debitNotesRes.data || []).forEach((dn: any) => {
        allDocs.push({
          id: dn.id,
          type: 'debit_note',
          typeLabel: DOC_TYPE_CONFIG.debit_note.label,
          number: dn.number,
          customerName: dn.customer_name || '—',
          customerRut: dn.customer_rut,
          date: dn.debit_date || dn.created_at,
          amount: Number(dn.total_amount || 0),
          status: dn.status,
          siiStatus: dn.sii_status || 'pending',
          siiTrackId: dn.sii_track_id,
          siiXml: dn.sii_xml,
          siiError: dn.sii_error,
          referenceInvoice: dn.invoice_number,
          reason: dn.reason,
        });
      });

      (guidesRes.data || []).forEach((dg: any) => {
        allDocs.push({
          id: dg.id,
          type: 'delivery_guide',
          typeLabel: DOC_TYPE_CONFIG.delivery_guide.label,
          number: dg.guide_number,
          guideNumber: dg.guide_number,
          customerName: dg.customer?.name || dg.sales_order?.customer?.name || '—',
          date: dg.shipping_date || dg.created_at,
          amount: 0,
          status: dg.status,
          siiStatus: dg.sii_status || 'pending',
          siiTrackId: dg.sii_track_id,
          siiXml: dg.sii_xml,
          siiError: dg.sii_error,
          items: dg.items,
          warehouseName: dg.warehouse?.name,
          transport: dg.transport,
        });
      });

      allDocs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDocuments(allDocs);
    } catch (e) {
      console.error(e);
      setDocuments([]);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = !search ||
        doc.number.toLowerCase().includes(search.toLowerCase()) ||
        doc.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (doc.customerRut || '').includes(search) ||
        (doc.referenceInvoice || '').includes(search) ||
        (doc.reason || '').toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || doc.type === typeFilter;
      const matchSii = siiFilter === 'all' || doc.siiStatus === siiFilter;

      return matchSearch && matchType && matchSii;
    });
  }, [documents, search, typeFilter, siiFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Documentos de Venta</h1>
          <p className="text-sm text-slate-500 mt-1">Facturas, Notas de Crédito/Débito y Guías de Despacho</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente, RUT, factura ref, motivo..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="invoice">Facturas</option>
              <option value="credit_note">Notas de Crédito</option>
              <option value="debit_note">Notas de Débito</option>
              <option value="delivery_guide">Guías de Despacho</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={siiFilter}
              onChange={e => { setSiiFilter(e.target.value as any); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos SII</option>
              <option value="accepted">Aceptados</option>
              <option value="rejected">Rechazados</option>
              <option value="sent">Enviados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>

          {(search || typeFilter !== 'all' || siiFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); setSiiFilter('all'); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Documentos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{filteredDocs.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">Aceptados SII</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{filteredDocs.filter(d => d.siiStatus === 'accepted').length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-rose-500 uppercase tracking-wider">Rechazados SII</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{filteredDocs.filter(d => d.siiStatus === 'rejected').length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-blue-500 uppercase tracking-wider">Monto Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(filteredDocs.reduce((sum, d) => sum + d.amount, 0))}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Documento</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SII</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No se encontraron documentos</td></tr>
              ) : filteredDocs.map(doc => {
                const typeConfig = DOC_TYPE_CONFIG[doc.type];
                const statusConfig = STATUS_CONFIG[doc.status] || { label: doc.status, variant: 'neutral' as const };
                return (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${typeConfig.color}`}>{typeConfig.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{doc.number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {doc.customerName}
                      {doc.customerRut && <span className="text-slate-400 ml-1 font-mono">({doc.customerRut})</span>}
                      {doc.referenceInvoice && <div className="text-[10px] text-slate-500 mt-0.5">Ref: {doc.referenceInvoice}</div>}
                      {doc.reason && <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{doc.reason}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(doc.date)}</td>
                    <td className="px-4 py-3 text-xs text-slate-900 text-right font-medium">{formatCurrency(doc.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{getSiiSemaphore(doc.siiStatus)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem className="flex items-center gap-2" onClick={() => openPdfPreview(doc)}>
                            <Eye className="w-4 h-4 text-slate-500" />
                            Vista previa PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => {
                              let xml = '';
                              if (doc.type === 'invoice') xml = generateInvoiceXml(doc);
                              else if (doc.type === 'credit_note') xml = generateCreditNoteXml(doc);
                              else if (doc.type === 'debit_note') xml = generateDebitNoteXml(doc);
                              else if (doc.type === 'delivery_guide') xml = generateDeliveryGuideXml(doc);
                              downloadXml(`${doc.number}.xml`, xml);
                            }}
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            Descargar XML (local)
                          </DropdownMenuItem>
                          {doc.siiXml && (
                            <DropdownMenuItem className="flex items-center gap-2" onClick={() => { const xml = doc.siiXml; if (xml) downloadXml(`${doc.number}_sii.xml`, xml); }}>
                              <Download className="w-4 h-4 text-emerald-500" />
                              Descargar XML SII
                            </DropdownMenuItem>
                          )}
                          {doc.siiTrackId && (
                            <DropdownMenuItem className="flex items-center gap-2 text-slate-500">
                              <span className="w-4 h-4" />
                              Track ID: {doc.siiTrackId}
                            </DropdownMenuItem>
                          )}
                          {doc.siiError && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex items-center gap-2 text-rose-600 text-xs">
                                Error SII: {doc.siiError}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDocs.length > ITEMS_PER_PAGE && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filteredDocs.length)} de {filteredDocs.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * ITEMS_PER_PAGE >= filteredDocs.length}
                className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
