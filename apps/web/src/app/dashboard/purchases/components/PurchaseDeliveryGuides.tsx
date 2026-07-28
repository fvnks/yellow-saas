'use client';

import { useState } from 'react';
import { Search, Truck, Zap, MoreVertical, Download, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MOCK_GUIDES = [
  { id: '1', guide_number: 'GD-9001', supplier: 'Distribuidora Central SpA', rut: '76.123.456-7', issue_date: '2025-06-15', dispatch_type: 'Venta', origin: 'Santiago', destination: 'Providencia', amount: 2975000, status: 'accepted' },
  { id: '2', guide_number: 'GD-9002', supplier: 'Insumos Industriales Ltda', rut: '76.987.654-3', issue_date: '2025-06-18', dispatch_type: 'Venta', origin: 'San Bernardo', destination: 'Las Condes', amount: 1059100, status: 'accepted' },
  { id: '3', guide_number: 'GD-9003', supplier: 'Comercial Andes SpA', rut: '76.555.123-8', issue_date: '2025-06-20', dispatch_type: 'Traslado', origin: 'Valparaíso', destination: 'Viña del Mar', amount: 1725500, status: 'accepted' },
  { id: '4', guide_number: 'GD-9004', supplier: 'Tecnología Total SpA', rut: '76.321.654-9', issue_date: '2025-06-22', dispatch_type: 'Venta', origin: 'Temuco', destination: 'Santiago', amount: 803250, status: 'accepted' },
  { id: '5', guide_number: 'GD-9005', supplier: 'Proveedores del Sur Ltda', rut: '76.789.012-4', issue_date: '2025-06-25', dispatch_type: 'Venta', origin: 'Concepción', destination: 'Santiago', amount: 3808000, status: 'accepted' },
  { id: '6', guide_number: 'GD-9006', supplier: 'Logística Express SpA', rut: '76.456.789-0', issue_date: '2025-06-28', dispatch_type: 'Devolución', origin: 'Providencia', destination: 'Santiago', amount: 505750, status: 'accepted' },
];

const DISPATCH_TYPES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Venta: { label: 'Venta', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  Traslado: { label: 'Traslado', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  Devolución: { label: 'Devolución', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  accepted: { label: 'Aceptado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

function generateGuideXml(g: typeof MOCK_GUIDES[0]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE xmlns="http://www.sii.cl/SiiDte" version="1.0">
  <Documento>
    <Encabezado>
      <IdDoc>
        <TipoDTE>52</TipoDTE>
        <Folio>${g.guide_number}</Folio>
        <FechaEmision>${g.issue_date}</FechaEmision>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${g.rut}</RUTEmisor>
        <RazonSocial>${g.supplier}</RazonSocial>
      </Emisor>
    </Encabezado>
    <Despacho>
      <TipoDespacho>${g.dispatch_type}</TipoDespacho>
      <DireccionOrigen>${g.origin}</DireccionOrigen>
      <DireccionDestino>${g.destination}</DireccionDestino>
    </Despacho>
    <Totales>
      <MontoTotal>${g.amount}</MontoTotal>
    </Totales>
  </Documento>
</DTE>`;
}

function openPdfPreview(g: typeof MOCK_GUIDES[0]) {
  const html = `<!DOCTYPE html><html><head><title>GD ${g.guide_number}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
  h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
  .row{display:flex;justify-content:space-between;margin:4px 0}
  .total{text-align:right;font-size:14px;font-weight:bold;margin-top:16px}
  @media print{body{padding:20px}}</style></head><body>
  <h1>GUÍA DE DESPACHO N° ${g.guide_number}</h1>
  <div class="row"><span><b>Proveedor:</b> ${g.supplier}</span><span><b>RUT:</b> ${g.rut}</span></div>
  <div class="row"><span><b>Fecha:</b> ${g.issue_date}</span><span><b>Tipo:</b> ${g.dispatch_type}</span></div>
  <div class="row"><span><b>Origen:</b> ${g.origin}</span><span><b>Destino:</b> ${g.destination}</span></div>
  <div class="total" style="margin-top:24px;font-size:18px;border-top:2px solid #333;padding-top:8px">MONTO: $${g.amount.toLocaleString('es-CL')}</div>
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

export default function PurchaseDeliveryGuides() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = MOCK_GUIDES.filter(g => {
    const matchSearch = g.guide_number.toLowerCase().includes(search.toLowerCase()) ||
      g.supplier.toLowerCase().includes(search.toLowerCase()) ||
      g.rut.includes(search);
    const matchType = typeFilter === 'all' || g.dispatch_type === typeFilter;
    return matchSearch && matchType;
  });

  const total = filtered.reduce((acc, g) => acc + g.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-violet-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Guías de Despacho Recibidas</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-2.5 h-2.5" /> SII
          </span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Total Guías</p>
          <p className="text-sm font-bold text-slate-900">${total.toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="search" placeholder="Buscar por N° guía, proveedor o RUT..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="all">Todos</option>
          <option value="Venta">Venta</option>
          <option value="Traslado">Traslado</option>
          <option value="Devolución">Devolución</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Guía</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Origen → Destino</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(g => {
              const dt = DISPATCH_TYPES[g.dispatch_type] || DISPATCH_TYPES.Venta;
              const st = STATUS_CFG[g.status] || STATUS_CFG.pending;
              return (
                <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 font-mono">{g.guide_number}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{g.supplier}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{g.rut}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{g.issue_date}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold ${dt.bg} ${dt.color} border ${dt.border}`}>{dt.label}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{g.origin} → {g.destination}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-slate-900 font-mono">${g.amount.toLocaleString('es-CL')}</td>
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
                        <DropdownMenuItem onClick={() => openPdfPreview(g)}>
                          <Printer className="w-4 h-4 mr-2 text-slate-500" />
                          Vista previa PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadXml(`${g.guide_number}.xml`, generateGuideXml(g))}>
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
              <tr><td colSpan={9} className="text-center py-8 text-xs text-slate-400">No se encontraron guías de despacho</td></tr>
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
