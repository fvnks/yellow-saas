'use client';

import { useState } from 'react';
import { Search, ReceiptText, Zap, MoreVertical, Download, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MOCK_NC = [
  { id: '1', note_number: 'NC-4501', supplier: 'Distribuidora Central SpA', rut: '76.123.456-7', issue_date: '2025-06-16', reason: 'Devolución parcial pedido #1234', amount: 350000, status: 'accepted' },
  { id: '2', note_number: 'NC-4502', supplier: 'Insumos Industriales Ltda', rut: '76.987.654-3', issue_date: '2025-06-19', reason: 'Descuento por volumen', amount: 125000, status: 'accepted' },
  { id: '3', note_number: 'NC-4503', supplier: 'Comercial Andes SpA', rut: '76.555.123-8', issue_date: '2025-06-21', reason: 'Error en facturación', amount: 890000, status: 'accepted' },
  { id: '4', note_number: 'NC-4504', supplier: 'Proveedores del Sur Ltda', rut: '76.789.012-4', issue_date: '2025-06-26', reason: 'Devolución producto defectuoso', amount: 210000, status: 'accepted' },
  { id: '5', note_number: 'NC-4505', supplier: 'Tecnología Total SpA', rut: '76.321.654-9', issue_date: '2025-06-29', reason: 'Ajuste por diferencia de precio', amount: 56000, status: 'accepted' },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  accepted: { label: 'Aceptado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

function generateNcXml(n: typeof MOCK_NC[0]): string {
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
        <RUTEmisor>${n.rut}</RUTEmisor>
        <RazonSocial>${n.supplier}</RazonSocial>
      </Emisor>
    </Encabezado>
    <Detalle>
      <Glosa>${n.reason}</Glosa>
      <MontoItem>${n.amount}</MontoItem>
    </Detalle>
    <Totales>
      <MontoTotal>${n.amount}</MontoTotal>
    </Totales>
  </Documento>
</DTE>`;
}

function openPdfPreview(n: typeof MOCK_NC[0]) {
  const html = `<!DOCTYPE html><html><head><title>NC ${n.note_number}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
  h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
  .row{display:flex;justify-content:space-between;margin:4px 0}
  .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
  @media print{body{padding:20px}}</style></head><body>
  <h1>NOTA DE CRÉDITO N° ${n.note_number}</h1>
  <div class="row"><span><b>Proveedor:</b> ${n.supplier}</span><span><b>RUT:</b> ${n.rut}</span></div>
  <div class="row"><span><b>Fecha:</b> ${n.issue_date}</span></div>
  <div class="row"><span><b>Motivo:</b> ${n.reason}</span></div>
  <div class="total" style="margin-top:24px;font-size:18px;border-top:2px solid #333;padding-top:8px">MONTO NC: $${n.amount.toLocaleString('es-CL')}</div>
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
  const [search, setSearch] = useState('');

  const filtered = MOCK_NC.filter(n =>
    n.note_number.toLowerCase().includes(search.toLowerCase()) ||
    n.supplier.toLowerCase().includes(search.toLowerCase()) ||
    n.rut.includes(search)
  );

  const total = filtered.reduce((acc, n) => acc + n.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-emerald-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Notas de Crédito Recibidas</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-2.5 h-2.5" /> SII
          </span>
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
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado SII</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(n => {
              const st = STATUS_CFG[n.status] || STATUS_CFG.pending;
              return (
                <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 font-mono">{n.note_number}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{n.supplier}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{n.rut}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{n.issue_date}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{n.reason}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-emerald-600 font-mono">${n.amount.toLocaleString('es-CL')}</td>
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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Modo Demo SII</span> — Estos documentos son una simulación de datos recibidos del Servicio de Impuestos Internos.
        </p>
      </div>
    </div>
  );
}
