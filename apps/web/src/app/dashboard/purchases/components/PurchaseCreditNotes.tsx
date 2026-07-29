'use client';

import { useState, useEffect } from 'react';
import { Search, ReceiptText, MoreVertical, Download, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CreditNote {
  id: string;
  note_number: string;
  supplier_name: string;
  supplier_tax_id: string;
  issue_date: string;
  reason: string;
  total_amount: number;
  status: string;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  accepted: { label: 'Aceptado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

function generateNcXml(n: CreditNote): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE xmlns="http://www.sii.cl/SiiDte" version="1.0">
  <Documento>
    <Encabezado>
      <IdDoc>
        <TipoDTE>45</TipoDTE>
        <Folio>${n.note_number}</Folio>
        <FechaEmision>${n.issue_date}</FechaEmision>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${n.supplier_tax_id}</RUTEmisor>
        <RazonSocial>${n.supplier_name}</RazonSocial>
      </Emisor>
    </Encabezado>
    <Detalle>
      <Glosa>${n.reason}</Glosa>
      <MontoItem>${n.total_amount}</MontoItem>
    </Detalle>
    <Totales>
      <MontoTotal>${n.total_amount}</MontoTotal>
    </Totales>
  </Documento>
</DTE>`;
}

function openPdfPreview(n: CreditNote) {
  const html = `<!DOCTYPE html><html><head><title>NC ${n.note_number}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
  h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
  .row{display:flex;justify-content:space-between;margin:4px 0}
  .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
  @media print{body{padding:20px}}</style></head><body>
  <h1>NOTA DE CRÉDITO N° ${n.note_number}</h1>
  <div class="row"><span><b>Proveedor:</b> ${n.supplier_name}</span><span><b>RUT:</b> ${n.supplier_tax_id}</span></div>
  <div class="row"><span><b>Fecha:</b> ${n.issue_date}</span></div>
  <div class="row"><span><b>Motivo:</b> ${n.reason}</span></div>
  <div class="total" style="margin-top:24px;font-size:18px;border-top:2px solid #333;padding-top:8px">MONTO NC: $${n.total_amount.toLocaleString('es-CL')}</div>
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

export default function PurchaseCreditNotes() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const cid = localStorage.getItem('company_id');
    if (!cid) return;
    fetch(`/api/companies/${cid}/purchase-credit-notes`)
      .then(r => r.json())
      .then(d => setNotes(d.data || []))
      .catch(() => {});
  }, []);

  const filtered = notes.filter(n =>
    n.note_number.toLowerCase().includes(search.toLowerCase()) ||
    (n.supplier_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (n.supplier_tax_id || '').includes(search)
  );

  const total = filtered.reduce((acc, n) => acc + Number(n.total_amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-emerald-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Notas de Crédito Recibidas</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Total NC</p>
          <p className="text-sm font-bold text-emerald-600">${total.toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="search" placeholder="Buscar por N° NC, proveedor o RUT..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° NC</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(n => {
              const st = STATUS_CFG[n.status] || STATUS_CFG.pending;
              return (
                <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 font-mono">{n.note_number}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{n.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{n.supplier_tax_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{n.issue_date}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{n.reason}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-emerald-600 font-mono">${Number(n.total_amount || 0).toLocaleString('es-CL')}</td>
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
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openPdfPreview(n)}>
                          <Printer className="w-4 h-4 mr-2 text-slate-500" />
                          Vista previa PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadXml(`${n.note_number}.xml`, generateNcXml(n))}>
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
              <tr><td colSpan={8} className="text-center py-8 text-xs text-slate-400">No se encontraron notas de crédito</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
