'use client';

import { useState } from 'react';
import { Search, FileText, Zap, Eye, Download } from 'lucide-react';

const MOCK_INVOICES = [
  { id: '1', invoice_number: '1234', supplier: 'Distribuidora Central SpA', rut: '76.123.456-7', emission_date: '2025-06-15', due_date: '2025-07-15', neto: 2500000, iva: 475000, total: 2975000, status: 'accepted', doc_type: '30' },
  { id: '2', invoice_number: '5678', supplier: 'Insumos Industriales Ltda', rut: '76.987.654-3', emission_date: '2025-06-18', due_date: '2025-07-18', neto: 890000, iva: 169100, total: 1059100, status: 'accepted', doc_type: '30' },
  { id: '3', invoice_number: '9012', supplier: 'Comercial Andes SpA', rut: '76.555.123-8', emission_date: '2025-06-20', due_date: '2025-07-20', neto: 1450000, iva: 275500, total: 1725500, status: 'accepted', doc_type: '30' },
  { id: '4', invoice_number: '3456', supplier: 'Tecnología Total SpA', rut: '76.321.654-9', emission_date: '2025-06-22', due_date: '2025-07-22', neto: 675000, iva: 128250, total: 803250, status: 'accepted', doc_type: '34' },
  { id: '5', invoice_number: '7890', supplier: 'Proveedores del Sur Ltda', rut: '76.789.012-4', emission_date: '2025-06-25', due_date: '2025-07-25', neto: 3200000, iva: 608000, total: 3808000, status: 'accepted', doc_type: '30' },
  { id: '6', invoice_number: '2345', supplier: 'Logística Express SpA', rut: '76.456.789-0', emission_date: '2025-06-28', due_date: '2025-07-28', neto: 425000, iva: 80750, total: 505750, status: 'accepted', doc_type: '30' },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  '30': 'Factura de Compra',
  '34': 'Factura Exenta',
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  accepted: { label: 'Aceptado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  rejected: { label: 'Rechazado', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

export default function PurchaseInvoices() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MOCK_INVOICES.filter(inv => {
    const matchSearch = inv.invoice_number.includes(search) ||
      inv.supplier.toLowerCase().includes(search.toLowerCase()) ||
      inv.rut.includes(search);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totals = filtered.reduce((acc, inv) => ({
    neto: acc.neto + inv.neto,
    iva: acc.iva + inv.iva,
    total: acc.total + inv.total,
  }), { neto: 0, iva: 0, total: 0 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Facturas de Compra Recibidas</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-2.5 h-2.5" /> SII
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Neto</p>
          <p className="text-lg font-bold text-slate-900">${totals.neto.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">IVA (19%)</p>
          <p className="text-lg font-bold text-indigo-600">${totals.iva.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Total</p>
          <p className="text-lg font-bold text-slate-900">${totals.total.toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="search" placeholder="Buscar por N° factura, proveedor o RUT..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="all">Todos</option>
          <option value="accepted">Aceptados</option>
          <option value="pending">Pendientes</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Factura</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Emisión</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Vencimiento</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Neto</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado SII</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const st = STATUS_CFG[inv.status] || STATUS_CFG.pending;
              const docType = DOC_TYPE_LABELS[inv.doc_type] || 'Factura';
              return (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 font-mono">{inv.invoice_number}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{inv.doc_type} - {docType}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-700">{inv.supplier}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{inv.rut}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{inv.emission_date}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{inv.due_date}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600 font-mono">${inv.neto.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-right text-indigo-600 font-mono">${inv.iva.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-right font-semibold text-slate-900 font-mono">${inv.total.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.color} border ${st.border}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-8 text-xs text-slate-400">No se encontraron facturas de compra</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Modo Demo SII</span> — Estos documentos son una simulación de datos recibidos del Servicio de Impuestos Internos. La integración real requiere certificado digital y API del SII.
        </p>
      </div>
    </div>
  );
}
