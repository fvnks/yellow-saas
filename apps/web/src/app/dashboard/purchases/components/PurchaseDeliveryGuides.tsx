'use client';

import { useState, useEffect } from 'react';
import { Search, Truck, MoreVertical, Download, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePrintDocument } from '@/components/print/use-print';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { type DocumentSettings, mergeSettings, DEFAULT_DOCUMENT_SETTINGS } from '@/lib/document-settings';

interface DeliveryGuide {
  id: string;
  guide_number: string;
  status: string;
  shipping_date: string;
  transport: string;
  vehicle_plate: string;
  driver_name: string;
  shipping_address: string;
  warehouse: { id: string; name: string; code: string } | null;
  sales_order: { id: string; order_number: string } | null;
  items: { id: string; product_id: string; quantity: number; observation: string; product: { id: string; name: string; sku: string } }[] | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  in_transit: { label: 'En Tránsito', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  delivered: { label: 'Entregado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelado', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

function generateGuideXml(g: DeliveryGuide): string {
  const items = (g.items || []).map(it => `<Item><Producto>${it.product?.name || ''}</Producto><Cantidad>${it.quantity}</Cantidad></Item>`).join('\n      ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE xmlns="http://www.sii.cl/SiiDte" version="1.0">
  <Documento>
    <Encabezado>
      <IdDoc>
        <TipoDTE>52</TipoDTE>
        <Folio>${g.guide_number}</Folio>
        <FechaEmision>${g.shipping_date}</FechaEmision>
      </IdDoc>
    </Encabezado>
    <Despacho>
      <BodegaOrigen>${g.warehouse?.name || ''}</BodegaOrigen>
      <Transporte>${g.transport || ''}</Transporte>
      <Patente>${g.vehicle_plate || ''}</Patente>
      <Chofer>${g.driver_name || ''}</Chofer>
      <DireccionDestino>${g.shipping_address || ''}</DireccionDestino>
    </Despacho>
    <Detalles>
      ${items}
    </Detalles>
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

export default function PurchaseDeliveryGuides() {
  const [guides, setGuides] = useState<DeliveryGuide[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const { print } = usePrintDocument();

  useEffect(() => {
    const companyId = getCompanyIdFromToken();
    if (!companyId) return;
    Promise.all([
      fetch(`/api/companies/${companyId}/delivery-guides`).then(r => r.json()).then(d => setGuides(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${companyId}/settings/documents`, {
        headers: { Authorization: `Bearer ${document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1] || ''}` },
      }).then(r => r.json()).then(d => { if (d.success) setSettings(mergeSettings(d.data)); }).catch(() => {}),
    ]);
  }, []);

  const handlePrintGuide = (g: DeliveryGuide) => {
    print('delivery-guide', {
      id: g.id,
      number: g.guide_number,
      type: 'guia_despacho',
      date: g.shipping_date,
      status: g.status,
      settings,
      company: { name: 'Empresa' },
      customer: g.warehouse ? { name: g.warehouse.name, tax_id: '' } : undefined,
      items: (g.items || []).map(item => ({
        name: item.product?.name || '',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unit_price: 0,
        discount: 0,
        tax_rate: 0,
        total: 0,
        observation: item.observation,
      })),
      subtotal: 0,
      tax_amount: 0,
      total: 0,
      transport: g.transport,
      driver_name: g.driver_name,
      vehicle_plate: g.vehicle_plate,
      shipping_address: g.shipping_address,
    } as any);
  };

  const filtered = guides.filter(g => {
    const matchSearch = g.guide_number.toLowerCase().includes(search.toLowerCase()) ||
      (g.driver_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.warehouse?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-violet-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Guías de Despacho</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold text-slate-500 uppercase">Total Guías</p>
          <p className="text-sm font-bold text-slate-900">{filtered.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="search" placeholder="Buscar por N° guía, chofer o bodega..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="all">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="in_transit">En Tránsito</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Guía</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Transporte</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Chofer</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Destino</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(g => {
              const st = STATUS_CFG[g.status] || STATUS_CFG.pending;
              return (
                <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 font-mono">{g.guide_number}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{g.warehouse?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{g.shipping_date}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{g.transport || 'N/A'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{g.driver_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{g.shipping_address || 'N/A'}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600">{(g.items || []).length}</td>
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
                        <DropdownMenuItem onClick={() => handlePrintGuide(g)}>
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
    </div>
  );
}
