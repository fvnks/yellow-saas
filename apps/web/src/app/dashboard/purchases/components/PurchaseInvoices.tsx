'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Zap, MoreVertical, CheckCircle2, Eye, Download, Printer, X, Save, SlidersHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getApiClient } from '@/lib/api-client';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { usePrintDocument } from '@/components/print/use-print';
import { type DocumentSettings, mergeSettings, DEFAULT_DOCUMENT_SETTINGS } from '@/lib/document-settings';

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
  supplier_name: string;
  supplier_tax_id: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  integration_status: string;
  doc_type?: string;
  items?: InvoiceItem[];
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

const DOC_TYPE_LABELS: Record<string, string> = { '30': 'Factura de Compra', '34': 'Factura Exenta' };
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  accepted: { label: 'Aceptado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

function generateInvoiceXml(inv: Invoice): string {
  const items = (inv.items || []).map((item, i) => `
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
        <FechaEmision>${inv.invoice_date}</FechaEmision>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${inv.supplier_tax_id}</RUTEmisor>
        <RazonSocial>${inv.supplier_name}</RazonSocial>
      </Emisor>
    </Encabezado>
    <Detalle>${items}
    </Detalle>
    <Totales>
      <MontoNeto>${inv.subtotal}</MontoNeto>
      <IVA>${inv.tax_amount}</IVA>
      <MontoTotal>${inv.total_amount}</MontoTotal>
    </Totales>
  </Documento>
</DTE>`;
}

function downloadXml(filename: string, xml: string) {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const [integrateForm, setIntegrateForm] = useState<{ payment_method_id: string; cost_center_id: string; items: { description: string; purchase_category_id: string }[] }>({ payment_method_id: '', cost_center_id: '', items: [] });
  const { print } = usePrintDocument();

  useEffect(() => {
    const companyId = getCompanyIdFromToken();
    if (!companyId) return;
    Promise.all([
      fetch(`/api/companies/${companyId}/purchase-invoices`).then(r => r.json()).then(d => setInvoices(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${companyId}/purchase-categories`).then(r => r.json()).then(d => setCategories(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${companyId}/payment-methods`).then(r => r.json()).then(d => setPaymentMethods(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${companyId}/cost-centers`).then(r => r.json()).then(d => setCostCenters(d.data || [])).catch(() => {}),
    ]);
  }, []);

  const handlePrintInvoice = (inv: Invoice) => {
    const items = inv.items || [];
    const subtotal = inv.subtotal || 0;
    const tax = inv.tax_amount || 0;
    const total = inv.total_amount || subtotal + tax;
    print('invoice', {
      id: inv.id,
      number: inv.invoice_number,
      type: 'factura',
      date: inv.invoice_date,
      due_date: inv.due_date,
      status: inv.status,
      settings,
      company: { name: 'Empresa' },
      supplier: { name: inv.supplier_name, tax_id: inv.supplier_tax_id },
      items: items.map(item => ({
        name: item.description || '',
        sku: '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount_pct,
        tax_rate: item.tax_pct,
        total: item.line_total,
      })),
      subtotal,
      tax_amount: tax,
      total,
      notes: '',
      payment_method: inv.payment_method_id || '',
    } as any);
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.invoice_number.includes(search) ||
      inv.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.supplier_tax_id.includes(search);
    const matchTab = inv.integration_status === subTab;
    const matchDocType = filters.docType === 'all' || inv.doc_type === filters.docType;
    const matchDateFrom = !filters.dateFrom || inv.invoice_date >= filters.dateFrom;
    const matchDateTo = !filters.dateTo || inv.invoice_date <= filters.dateTo;
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
      items: (inv.items || []).map(it => ({
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
        items: (inv.items || []).map((it, i) => ({
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
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{inv.doc_type || '30'} - {DOC_TYPE_LABELS[inv.doc_type || ''] || 'Factura'}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-700">{inv.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{inv.supplier_tax_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{inv.invoice_date}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600 font-mono">{fmt(inv.subtotal)}</td>
                  <td className="px-4 py-3 text-xs text-right text-indigo-600 font-mono">{fmt(inv.tax_amount)}</td>
                  <td className="px-4 py-3 text-xs text-right font-semibold text-slate-900 font-mono">{fmt(inv.total_amount)}</td>
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
                        <DropdownMenuItem onClick={() => handlePrintInvoice(inv)}>
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

      {/* ===================== MODAL INTEGRAR ===================== */}
      {showIntegrateModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowIntegrateModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Integrar Factura #{selectedInvoice.invoice_number}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedInvoice.supplier_name} — {selectedInvoice.supplier_tax_id}</p>
              </div>
              <button onClick={() => setShowIntegrateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Neto</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(selectedInvoice.subtotal)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">IVA</p>
                  <p className="text-lg font-bold text-indigo-600">{fmt(selectedInvoice.tax_amount)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Total</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(selectedInvoice.total_amount)}</p>
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
                      {(selectedInvoice.items || []).map((item, i) => (
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
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Integrar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
