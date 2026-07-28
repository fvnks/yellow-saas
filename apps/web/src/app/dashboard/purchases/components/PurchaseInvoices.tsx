'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Zap, MoreVertical, CheckCircle2, Eye, Download, Printer, X, Save, SlidersHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  tax_pct: number;
  line_total: number;
  purchase_category_id?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  supplier: string;
  supplier_rut: string;
  emission_date: string;
  due_date: string;
  neto: number;
  iva: number;
  total: number;
  status: string;
  integration_status: string;
  doc_type: string;
  items: InvoiceItem[];
  payment_method_id?: string;
  cost_center_id?: string;
}

interface PurchaseCategory {
  id: string;
  name: string;
  cost_center_id?: string;
  cost_center_name?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1', invoice_number: '1234', supplier: 'Distribuidora Central SpA', supplier_rut: '76.123.456-7',
    emission_date: '2025-06-15', due_date: '2025-07-15', neto: 2500000, iva: 475000, total: 2975000,
    status: 'accepted', integration_status: 'integrated', doc_type: '30',
    items: [
      { description: 'Producto A x100', quantity: 100, unit_price: 15000, discount_pct: 0, tax_pct: 19, line_total: 1500000, purchase_category_id: '', cost_center_id: '' },
      { description: 'Flete Santiago-Providencia', quantity: 1, unit_price: 500000, discount_pct: 0, tax_pct: 19, line_total: 500000, purchase_category_id: '', cost_center_id: '' },
      { description: 'Seguro de carga', quantity: 1, unit_price: 500000, discount_pct: 0, tax_pct: 19, line_total: 500000, purchase_category_id: '', cost_center_id: '' },
    ],
  },
  {
    id: '2', invoice_number: '5678', supplier: 'Insumos Industriales Ltda', supplier_rut: '76.987.654-3',
    emission_date: '2025-06-18', due_date: '2025-07-18', neto: 890000, iva: 169100, total: 1059100,
    status: 'accepted', integration_status: 'integrated', doc_type: '30',
    items: [
      { description: 'Repuestos motor', quantity: 5, unit_price: 120000, discount_pct: 0, tax_pct: 19, line_total: 600000, purchase_category_id: '', cost_center_id: '' },
      { description: 'Aceite industrial', quantity: 10, unit_price: 29000, discount_pct: 0, tax_pct: 19, line_total: 290000, purchase_category_id: '', cost_center_id: '' },
    ],
  },
  {
    id: '3', invoice_number: '9012', supplier: 'Comercial Andes SpA', supplier_rut: '76.555.123-8',
    emission_date: '2025-06-20', due_date: '2025-07-20', neto: 1450000, iva: 275500, total: 1725500,
    status: 'accepted', integration_status: 'pending', doc_type: '30',
    items: [
      { description: 'Material de oficina Q2', quantity: 1, unit_price: 450000, discount_pct: 0, tax_pct: 19, line_total: 450000 },
      { description: 'Servicio de limpieza Junio', quantity: 1, unit_price: 500000, discount_pct: 0, tax_pct: 19, line_total: 500000 },
      { description: 'Papelería varios', quantity: 1, unit_price: 500000, discount_pct: 0, tax_pct: 19, line_total: 500000 },
    ],
  },
  {
    id: '4', invoice_number: '3456', supplier: 'Tecnología Total SpA', supplier_rut: '76.321.654-9',
    emission_date: '2025-06-22', due_date: '2025-07-22', neto: 675000, iva: 128250, total: 803250,
    status: 'accepted', integration_status: 'pending', doc_type: '34',
    items: [
      { description: 'Licencia software anual', quantity: 1, unit_price: 675000, discount_pct: 0, tax_pct: 0, line_total: 675000 },
    ],
  },
  {
    id: '5', invoice_number: '7890', supplier: 'Proveedores del Sur Ltda', supplier_rut: '76.789.012-4',
    emission_date: '2025-06-25', due_date: '2025-07-25', neto: 3200000, iva: 608000, total: 3808000,
    status: 'accepted', integration_status: 'pending', doc_type: '30',
    items: [
      { description: 'Materia prima lote #45', quantity: 1, unit_price: 2200000, discount_pct: 0, tax_pct: 19, line_total: 2200000 },
      { description: 'Envases plásticos', quantity: 500, unit_price: 2000, discount_pct: 0, tax_pct: 19, line_total: 1000000 },
    ],
  },
  {
    id: '6', invoice_number: '2345', supplier: 'Logística Express SpA', supplier_rut: '76.456.789-0',
    emission_date: '2025-06-28', due_date: '2025-07-28', neto: 425000, iva: 80750, total: 505750,
    status: 'accepted', integration_status: 'pending', doc_type: '30',
    items: [
      { description: 'Transporte urbano 20 viajes', quantity: 20, unit_price: 21250, discount_pct: 0, tax_pct: 19, line_total: 425000 },
    ],
  },
];

const DOC_TYPE_LABELS: Record<string, string> = { '30': 'Factura de Compra', '34': 'Factura Exenta' };
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  accepted: { label: 'Aceptado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

function generateInvoiceXml(inv: Invoice): string {
  const items = inv.items.map((item, i) => `
    <Detalle>
      <Secuencia>${i + 1}</Secuencia>
      <Glosa>${item.description}</Glosa>
      <Cantidad>${item.quantity}</Cantidad>
      <PrecioUnitario>${item.unit_price}</PrecioUnitario>
      <Descuento>${item.discount_pct}</Descuento>
      <MontoItem>${item.line_total}</MontoItem>
    </Detalle>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE xmlns="http://www.sii.cl/SiiDte" version="1.0">
  <Documento>
    <Encabezado>
      <IdDoc>
        <TipoDTE>${inv.doc_type}</TipoDTE>
        <Folio>${inv.invoice_number}</Folio>
        <FechaEmision>${inv.emission_date}</FechaEmision>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${inv.supplier_rut}</RUTEmisor>
        <RazonSocial>${inv.supplier}</RazonSocial>
      </Emisor>
    </Encabezado>
    <Detalle>${items}
    </Detalle>
    <Totales>
      <MontoNeto>${inv.neto}</MontoNeto>
      <IVA>${inv.iva}</IVA>
      <MontoTotal>${inv.total}</MontoTotal>
    </Totales>
  </Documento>
</DTE>`;
}

function openPdfPreview(inv: Invoice) {
  const html = `<!DOCTYPE html><html><head><title>Factura ${inv.invoice_number}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
  h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
  .row{display:flex;justify-content:space-between;margin:4px 0}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}
  th{background:#f5f5f5;font-weight:600}
  .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
  @media print{body{padding:20px}}</style></head><body>
  <h1>FACTURA DE COMPRA N° ${inv.invoice_number}</h1>
  <div class="row"><span><b>Proveedor:</b> ${inv.supplier}</span><span><b>RUT:</b> ${inv.supplier_rut}</span></div>
  <div class="row"><span><b>Fecha Emisión:</b> ${inv.emission_date}</span><span><b>Vencimiento:</b> ${inv.due_date}</span></div>
  <div class="row"><span><b>Tipo:</b> ${DOC_TYPE_LABELS[inv.doc_type] || inv.doc_type}</span></div>
  <table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Desc.</th><th>Total</th></tr></thead>
  <tbody>${inv.items.map(it => `<tr><td>${it.description}</td><td>${it.quantity}</td><td>$${it.unit_price.toLocaleString('es-CL')}</td><td>${it.discount_pct}%</td><td>$${it.line_total.toLocaleString('es-CL')}</td></tr>`).join('')}
  </tbody></table>
  <div class="total">Neto: $${inv.neto.toLocaleString('es-CL')}</div>
  <div class="total">IVA (19%): $${inv.iva.toLocaleString('es-CL')}</div>
  <div class="total" style="font-size:16px;border-top:2px solid #333;padding-top:8px">TOTAL: $${inv.total.toLocaleString('es-CL')}</div>
  <script>window.onload=function(){window.print()}</script></body></html>`;
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

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    docType: 'all',
    dateFrom: '',
    dateTo: '',
    numberFrom: '',
    numberTo: '',
    status: 'all',
  });
  const [subTab, setSubTab] = useState<'pending' | 'integrated'>('pending');
  const [showIntegrateModal, setShowIntegrateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [categories, setCategories] = useState<PurchaseCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [integrateForm, setIntegrateForm] = useState<{ payment_method_id: string; cost_center_id: string; items: { description: string; purchase_category_id: string }[] }>({ payment_method_id: '', cost_center_id: '', items: [] });

  useEffect(() => {
    const cid = localStorage.getItem('company_id');
    if (!cid) return;
    Promise.all([
      fetch(`/api/companies/${cid}/purchase-categories`).then(r => r.json()).then(d => setCategories(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${cid}/payment-methods`).then(r => r.json()).then(d => setPaymentMethods(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${cid}/cost-centers`).then(r => r.json()).then(d => setCostCenters(d.data || [])).catch(() => {}),
    ]);
  }, []);

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.invoice_number.includes(search) ||
      inv.supplier.toLowerCase().includes(search.toLowerCase()) ||
      inv.supplier_rut.includes(search);
    const matchTab = inv.integration_status === subTab;
    const matchDocType = filters.docType === 'all' || inv.doc_type === filters.docType;
    const matchDateFrom = !filters.dateFrom || inv.emission_date >= filters.dateFrom;
    const matchDateTo = !filters.dateTo || inv.emission_date <= filters.dateTo;
    const matchNumFrom = !filters.numberFrom || inv.invoice_number >= filters.numberFrom;
    const matchNumTo = !filters.numberTo || inv.invoice_number <= filters.numberTo;
    const matchStatus = filters.status === 'all' || inv.status === filters.status;
    return matchSearch && matchTab && matchDocType && matchDateFrom && matchDateTo && matchNumFrom && matchNumTo && matchStatus;
  });

  const pendingCount = invoices.filter(i => i.integration_status === 'pending').length;
  const integratedCount = invoices.filter(i => i.integration_status === 'integrated').length;
  const activeFilterCount = [filters.docType, filters.dateFrom, filters.dateTo, filters.numberFrom, filters.numberTo, filters.status].filter(v => v && v !== 'all').length;

  const openIntegrateModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIntegrateForm({
      payment_method_id: '',
      cost_center_id: '',
      items: inv.items.map(it => ({
        description: it.description,
        purchase_category_id: it.purchase_category_id || '',
      })),
    });
    setShowIntegrateModal(true);
  };

  const handleRecepcionar = (invId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, status: 'accepted' } : inv));
  };

  const handleIntegrate = () => {
    if (!selectedInvoice) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== selectedInvoice.id) return inv;
      return {
        ...inv,
        integration_status: 'integrated',
        integrated_at: new Date().toISOString(),
        payment_method_id: integrateForm.payment_method_id,
        cost_center_id: integrateForm.cost_center_id,
        items: inv.items.map((it, i) => ({
          ...it,
          purchase_category_id: integrateForm.items[i]?.purchase_category_id || '',
        })),
      };
    }));
    setShowIntegrateModal(false);
    setSelectedInvoice(null);
  };

  const fmt = (v: number) => `$${v.toLocaleString('es-CL')}`;

  return (
    <div className="space-y-4">
      {/* Sub-tabs: Ingresadas / Pendientes */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-0">
        <button onClick={() => setSubTab('pending')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${subTab === 'pending' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Pendientes <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{pendingCount}</span>
        </button>
        <button onClick={() => setSubTab('integrated')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${subTab === 'integrated' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Ingresadas <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{integratedCount}</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Facturas de Compra</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-2.5 h-2.5" /> SII
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="search" placeholder="Buscar por N° factura, proveedor o RUT..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-white/20">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Tipo de documento */}
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipo Doc.</label>
                <select value={filters.docType} onChange={e => setFilters(prev => ({ ...prev, docType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="all">Todos</option>
                  <option value="30">30 - Factura de Compra</option>
                  <option value="34">34 - Factura Exenta</option>
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Desde</label>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Hasta</label>
                <input type="date" value={filters.dateTo} onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              {/* N° factura desde */}
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">N° Desde</label>
                <input type="text" placeholder="Ej: 1000" value={filters.numberFrom} onChange={e => setFilters(prev => ({ ...prev, numberFrom: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              {/* N° factura hasta */}
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">N° Hasta</label>
                <input type="text" placeholder="Ej: 9999" value={filters.numberTo} onChange={e => setFilters(prev => ({ ...prev, numberTo: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Estado</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="all">Todos</option>
                  <option value="accepted">Aceptados</option>
                  <option value="pending">Pendientes</option>
                  <option value="rejected">Rechazados</option>
                </select>
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button onClick={() => setFilters({ docType: 'all', dateFrom: '', dateTo: '', numberFrom: '', numberTo: '', status: 'all' })}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Factura</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Neto</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const st = STATUS_CFG[inv.status] || STATUS_CFG.pending;
              return (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 font-mono">{inv.invoice_number}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{inv.doc_type} - {DOC_TYPE_LABELS[inv.doc_type]}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-700">{inv.supplier}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{inv.supplier_rut}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{inv.emission_date}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600 font-mono">{fmt(inv.neto)}</td>
                  <td className="px-4 py-3 text-xs text-right text-indigo-600 font-mono">{fmt(inv.iva)}</td>
                  <td className="px-4 py-3 text-xs text-right font-semibold text-slate-900 font-mono">{fmt(inv.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.color} border ${st.border}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {inv.integration_status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleRecepcionar(inv.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                              Recepcionar ante SII
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openIntegrateModal(inv)}>
                              <Save className="w-4 h-4 mr-2 text-indigo-500" />
                              Integrar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => openPdfPreview(inv)}>
                          <Printer className="w-4 h-4 mr-2 text-slate-500" />
                          Vista previa PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadXml(`factura_${inv.invoice_number}.xml`, generateInvoiceXml(inv))}>
                          <Download className="w-4 h-4 mr-2 text-slate-500" />
                          Descargar XML
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-8 text-xs text-slate-400">
                {subTab === 'pending' ? 'No hay facturas pendientes de integrar' : 'No hay facturas integradas'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Demo notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Modo Demo SII</span> — Estos documentos son una simulación de datos recibidos del Servicio de Impuestos Internos.
        </p>
      </div>

      {/* ===================== MODAL INTEGRAR ===================== */}
      {showIntegrateModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowIntegrateModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Integrar Factura #{selectedInvoice.invoice_number}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedInvoice.supplier} — {selectedInvoice.supplier_rut}</p>
              </div>
              <button onClick={() => setShowIntegrateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Neto</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(selectedInvoice.neto)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">IVA</p>
                  <p className="text-lg font-bold text-indigo-600">{fmt(selectedInvoice.iva)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Total</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(selectedInvoice.total)}</p>
                </div>
              </div>

              {/* Forma de pago y Centro de costo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Forma de Pago</label>
                  <select value={integrateForm.payment_method_id} onChange={e => setIntegrateForm(prev => ({ ...prev, payment_method_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Seleccionar forma de pago...</option>
                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Centro de Costo</label>
                  <select value={integrateForm.cost_center_id} onChange={e => setIntegrateForm(prev => ({ ...prev, cost_center_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Ninguno</option>
                    {costCenters.map(cc => <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Ítems de la Factura</p>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Descripción</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Monto</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Categoría de Compra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-xs text-slate-700">{item.description}</td>
                          <td className="px-4 py-3 text-xs text-right font-medium text-slate-900 font-mono">{fmt(item.line_total)}</td>
                          <td className="px-4 py-3">
                            <select value={integrateForm.items[i]?.purchase_category_id || ''}
                              onChange={e => {
                                const newItems = [...integrateForm.items];
                                newItems[i] = { ...newItems[i], purchase_category_id: e.target.value };
                                setIntegrateForm(prev => ({ ...prev, items: newItems }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                              <option value="">Seleccionar...</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowIntegrateModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleIntegrate} disabled={!integrateForm.payment_method_id}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Integrar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
