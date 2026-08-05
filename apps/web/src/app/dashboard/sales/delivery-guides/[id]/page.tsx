'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, Truck, User, Calendar, MapPin, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { generateDeliveryGuidePDF } from '@/lib/pdf-design';
import { usePrintDocument } from '@/components/print/use-print';
import { type DocumentSettings, mergeSettings, DEFAULT_DOCUMENT_SETTINGS } from '@/lib/document-settings';

interface DeliveryGuideItem {
  id: string;
  product_id: string;
  quantity: number;
  observation: string;
  product?: { id: string; name: string; sku: string };
}

interface DeliveryGuideDetail {
  id: string;
  guide_number: string;
  status: string;
  transport: string;
  driver_name: string;
  vehicle_plate: string;
  shipping_address: string;
  created_at: string;
  order?: { id: string; order_number: string };
  sales_order?: { id: string; order_number: string; customer?: { id: string; name: string; tax_id: string } };
  warehouse?: { id: string; name: string; code: string };
  items?: DeliveryGuideItem[];
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  in_transit: { label: 'En Tránsito', class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  delivered: { label: 'Entregado', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled: { label: 'Cancelado', class: 'bg-rose-50 text-rose-700 border border-rose-200' },
  draft: { label: 'Borrador', class: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

export default function DeliveryGuideDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [guide, setGuide] = useState<DeliveryGuideDetail | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const { print } = usePrintDocument();

  async function fetchDocumentSettings() {
    try {
      const companyId = getCompanyIdFromToken();
      if (!companyId) return DEFAULT_DOCUMENT_SETTINGS;
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      if (!token) return DEFAULT_DOCUMENT_SETTINGS;
      const res = await fetch(`/api/companies/${companyId}/settings/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) return mergeSettings(data.data);
    } catch {}
    return DEFAULT_DOCUMENT_SETTINGS;
  }

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getDeliveryGuide(id),
      api.getCompany().catch(() => null),
      fetchDocumentSettings(),
    ]).then(([data, companyRes, settingsRes]) => {
      setGuide(data as unknown as DeliveryGuideDetail);
      if (companyRes) setCompany(companyRes);
      if (settingsRes) setSettings(settingsRes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    if (!guide) return;
    const c = company || {};
    print('delivery-guide', {
      id: guide.id,
      number: guide.guide_number,
      type: 'guía',
      date: guide.created_at,
      status: guide.status,
      company: {
        name: c.name || 'Empresa', tax_id: c.tax_id, razon_social: c.razon_social,
        giro: c.giro, address: c.address, city: c.city, region: c.region,
        phone: c.phone, email: c.email, logo_url: c.logo_url,
      },
      customer: guide.sales_order?.customer ? { name: guide.sales_order.customer.name, tax_id: guide.sales_order.customer.tax_id } : undefined,
      items: (guide.items || []).map(item => ({
        name: item.product?.name || '', sku: item.product?.sku,
        quantity: item.quantity, unit_price: 0, total: 0,
        observation: item.observation,
      })),
      subtotal: 0, tax_amount: 0, total: 0,
      transport: guide.transport, driver_name: guide.driver_name,
      vehicle_plate: guide.vehicle_plate, shipping_address: guide.shipping_address,
      settings,
    });
  };

  const handleDownloadPDF = async () => {
    if (!guide) return;
    const c = company || {};
    const doc = await generateDeliveryGuidePDF({
      id: guide.id,
      number: guide.guide_number,
      type: 'guia_despacho',
      date: guide.created_at?.split('T')[0] || '',
      company: {
        name: c.name || 'Empresa', tax_id: c.tax_id || undefined, razon_social: c.razon_social || undefined,
        giro: c.giro || undefined, address: c.address || undefined, city: c.city || undefined,
        region: c.region || undefined, phone: c.phone || undefined, email: c.email || undefined,
        logo_url: c.logo_url || undefined,
      },
      customer: guide.sales_order?.customer ? { name: guide.sales_order.customer.name, rut: guide.sales_order.customer.tax_id } : undefined,
      items: (guide.items || []).map(item => ({
        name: item.product?.name || '',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unit_price: 0,
        total: 0,
        unit: 'Unidad',
        description: item.observation || '',
      })),
      transport: guide.transport,
      driver: guide.driver_name,
      plate: guide.vehicle_plate,
      shipping_date: guide.created_at?.split('T')[0] || '',
      settings,
    });
    doc.save(`${guide.guide_number}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4"><div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" /><div className="h-6 w-48 bg-slate-200 rounded animate-pulse" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">{[1, 2].map(i => <div key={i} className="animate-pulse bg-slate-200 h-48 rounded-xl" />)}</div>
          <div className="animate-pulse bg-slate-200 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/sales/delivery-guides" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-slate-500">Guía de despacho no encontrada</p>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[guide.status] || STATUS_MAP.draft;

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales/delivery-guides" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Guía de Despacho {guide.guide_number}</h1>
            <p className="text-sm text-slate-500 mt-1">{guide.created_at?.split('T')[0]}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${status.class}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-0 print:rounded-none" id="print-area">
        <div className="p-8 print:p-4">
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              {company?.logo_url ? (
                <img src={company.logo_url} alt="Logo" className="h-16 w-auto mb-3" />
              ) : (
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {(company?.name || 'E')[0]}
                </div>
              )}
              <p className="text-lg font-bold text-slate-900">{company?.name || 'Empresa'}</p>
              {company?.tax_id && <p className="text-xs text-slate-500">RUT: {company.tax_id}</p>}
              {company?.address && <p className="text-xs text-slate-500">{company.address}</p>}
              {company?.phone && <p className="text-xs text-slate-500">Tel: {company.phone}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">GUÍA DE DESPACHO</h2>
              <p className="text-sm font-mono text-slate-600">{guide.guide_number}</p>
              <p className="text-xs text-slate-500 mt-2">Fecha: {guide.created_at?.split('T')[0]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-sm font-medium text-slate-900">{guide.sales_order?.customer?.name || '—'}</p>
                <p className="text-xs text-slate-500">RUT: {guide.sales_order?.customer?.tax_id || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Orden de Venta</p>
                <p className="text-sm font-medium text-indigo-600">{guide.sales_order?.order_number || '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bodega Origen</p>
                <p className="text-sm font-medium text-slate-900">{guide.warehouse?.name || '—'}</p>
                <p className="text-xs text-slate-500">{guide.warehouse?.code || ''}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Dirección de Entrega</p>
                <p className="text-sm font-medium text-slate-900">{guide.shipping_address || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-8 border border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Transporte</p>
                  <p className="text-xs font-medium text-slate-900">{guide.transport}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Chofer</p>
                  <p className="text-xs font-medium text-slate-900">{guide.driver_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Patente</p>
                  <p className="text-xs font-medium text-slate-900">{guide.vehicle_plate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-right py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-left py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Observación</th>
                </tr>
              </thead>
              <tbody>
                {(guide.items || []).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="text-xs font-medium text-slate-900">{item.product?.name || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.product?.sku}</p>
                    </td>
                    <td className="py-3 text-xs text-right font-medium text-slate-900">{item.quantity}</td>
                    <td className="py-3 text-xs text-slate-500">{item.observation || '—'}</td>
                  </tr>
                ))}
                {(!guide.items || guide.items.length === 0) && (
                  <tr><td colSpan={3} className="py-8 text-center text-xs text-slate-400">Sin items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-200">
            <div className="text-center">
              <div className="border-t border-slate-300 pt-2 mt-16">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Firma Despachador</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-300 pt-2 mt-16">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Firma Recibidor</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400">Documento generado por Yellow ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
