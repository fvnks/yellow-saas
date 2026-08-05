'use client';

import { useEffect, useState } from 'react';
import { Upload, Eye, Save, Palette, FileText, Hash, Type, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentSettings } from '@/lib/use-document-settings';
import {
  DOCUMENT_TEMPLATES, CURRENCIES, LANGUAGES,
  type DocumentSettings,
} from '@/lib/document-settings';
import { generateBoletaPDF, generateCotizacionPDF, generateOrdenVentaPDF, generateOrdenCompraPDF, generateDeliveryGuidePDF, DocumentData, type DocumentItem, type DeliveryGuideData, type ReturnNoteData } from '@/lib/pdf-design';

const STYLE: { input: string; select: string; toggle: string } = {
  input: 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  select: 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  toggle: 'w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600',
};

export function DocumentsTab() {
  const { settings, setSettings, save, loading } = useDocumentSettings();
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const update = (patch: Partial<DocumentSettings>) => setSettings(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSavingStatus('saving');
    const ok = await save(settings);
    setSavingStatus(ok ? 'saved' : 'idle');
    if (ok) {
      toast.success('Configuración de documentos guardada');
      setTimeout(() => setSavingStatus('idle'), 2500);
    } else {
      toast.error('Error al guardar la configuración');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-6">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
            <div className="animate-pulse bg-slate-200 h-6 w-48 rounded mx-auto" />
          </div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Plantilla</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {DOCUMENT_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => update({ template_id: t.id })}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                        settings.template_id === t.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`mt-1 w-4 h-4 rounded-full border-4 ${settings.template_id === t.id ? 'border-indigo-500' : 'border-slate-300'}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Colores</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorField label="Color Principal" value={settings.primary_color} onChange={v => update({ primary_color: v })} />
                  <ColorField label="Color Acento" value={settings.accent_color} onChange={v => update({ accent_color: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ToggleRow label="Mostrar logo" checked={settings.show_logo} onChange={v => update({ show_logo: v })} />
                  <ToggleRow label="Mostrar QR" checked={settings.show_qr} onChange={v => update({ show_qr: v })} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Localización</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">Idioma</label>
                    <select value={settings.language} onChange={e => update({ language: e.target.value as DocumentSettings['language'] })} className={STYLE.select}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">Moneda</label>
                    <select value={settings.currency} onChange={e => update({ currency: e.target.value as DocumentSettings['currency'] })} className={STYLE.select}>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Etiqueta de impuesto</label>
                  <input type="text" value={settings.tax_label} onChange={e => update({ tax_label: e.target.value })} className={STYLE.input} placeholder="IVA (19%)" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Type className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Textos</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Texto de encabezado</label>
                  <input type="text" value={settings.header_text} onChange={e => update({ header_text: e.target.value })} className={STYLE.input} placeholder="Texto opcional bajo los datos de la empresa" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Texto de pie</label>
                  <input type="text" value={settings.footer_text} onChange={e => update({ footer_text: e.target.value })} className={STYLE.input} placeholder="Documento generado por Yellow ERP" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Notas predeterminadas</label>
                  <textarea value={settings.default_notes} onChange={e => update({ default_notes: e.target.value })} rows={2} className={`${STYLE.input} resize-none`} placeholder="Notas que aparecerán por defecto en cada documento" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Títulos de documento</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {(['boleta', 'factura', 'cotizacion', 'orden_venta', 'orden_compra'] as const).map(key => (
                    <div key={key} className="grid grid-cols-[130px_1fr] items-center gap-2">
                      <label className="text-xs font-medium text-slate-700 capitalize">{key.replace('_', ' ')}</label>
                      <input
                        type="text"
                        value={settings.document_titles[key]}
                        onChange={e => setSettings(prev => ({ ...prev, document_titles: { ...prev.document_titles, [key]: e.target.value } }))}
                        className={STYLE.input}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview */}
      <div className="lg:col-span-3">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-20">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">Vista previa</h3>
            </div>
            {savingStatus === 'saved' && <span className="text-xs text-emerald-600">Guardado</span>}
          </div>
          <div className="p-6">
            <DocumentPreview settings={settings} />
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={savingStatus === 'saving'}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {savingStatus === 'saving' ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-9 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className={STYLE.toggle} />
      </label>
    </div>
  );
}

function DocumentPreview({ settings }: { settings: DocumentSettings }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'boleta' | 'factura' | 'cotizacion' | 'orden_venta' | 'orden_compra' | 'guia_despacho'>('boleta');

  const PREVIEW_TYPES = [
    { id: 'boleta', label: 'Boleta' },
    { id: 'factura', label: 'Factura' },
    { id: 'cotizacion', label: 'Cotización' },
    { id: 'orden_venta', label: 'OV' },
    { id: 'orden_compra', label: 'OC' },
    { id: 'guia_despacho', label: 'Guía' },
  ] as const;

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const baseCompany = {
      name: 'Mi Empresa SpA',
      tax_id: '76.123.456-7',
      razon_social: 'Mi Empresa SpA',
      giro: 'Comercio al por menor',
      address: 'Av. Providencia 123, Santiago',
      phone: '+56 9 1234 5678',
      email: 'contacto@miempresa.cl',
    };

    const baseCustomer = { name: 'Cliente Ejemplo', tax_id: '11.222.333-4', address: 'Calle Falsa 123' };
    const baseItems: DocumentItem[] = [
      { name: 'Producto de ejemplo', sku: 'SKU001', quantity: 2, unit_price: 15000, discount: 0, tax_rate: 19, total: 30000 },
      { name: 'Servicio de ejemplo', sku: 'SKU002', quantity: 1, unit_price: 25000, discount: 10, tax_rate: 19, total: 22500 },
    ];
    const subtotal = 44118;
    const tax = 8382;
    const total = 52500;

const generators = {
      boleta: (d: DocumentData) => generateBoletaPDF(d),
      factura: (d: DocumentData) => generateBoletaPDF(d),
      cotizacion: (d: DocumentData) => generateCotizacionPDF(d),
      orden_venta: (d: DocumentData) => generateOrdenVentaPDF(d),
      orden_compra: (d: DocumentData) => generateOrdenCompraPDF(d),
      guia_despacho: (d: DeliveryGuideData) => generateDeliveryGuidePDF(d),
    };

    let sample: DocumentData | DeliveryGuideData | ReturnNoteData;

    switch (activeType) {
      case 'factura':
        sample = { id: 'preview', number: 'F-000001', type: 'factura', date: new Date().toISOString().split('T')[0], due_date: new Date(Date.now() + 30*864e5).toISOString().split('T')[0], company: baseCompany, customer: baseCustomer, items: baseItems, subtotal, tax_amount: tax, total, settings };
        break;
      case 'cotizacion':
        sample = { id: 'preview', number: 'C-000001', type: 'cotizacion', date: new Date().toISOString().split('T')[0], valid_until: new Date(Date.now() + 15*864e5).toISOString().split('T')[0], company: baseCompany, customer: baseCustomer, items: baseItems, subtotal, tax_amount: tax, total, settings };
        break;
      case 'orden_venta':
        sample = { id: 'preview', number: 'OV-000001', type: 'orden_venta', date: new Date().toISOString().split('T')[0], delivery_date: new Date(Date.now() + 7*864e5).toISOString().split('T')[0], payment_terms: 30, company: baseCompany, customer: baseCustomer, items: baseItems, subtotal, tax_amount: tax, total, settings };
        break;
      case 'orden_compra':
        sample = { id: 'preview', number: 'OC-000001', type: 'orden_compra', date: new Date().toISOString().split('T')[0], payment_terms: 30, company: baseCompany, supplier: baseCustomer, items: baseItems, subtotal, tax_amount: tax, total, settings };
        break;
      case 'guia_despacho':
        sample = { id: 'preview', number: 'GD-000001', type: 'guia_despacho', date: new Date().toISOString().split('T')[0], company: baseCompany, customer: baseCustomer, items: baseItems.map(i => ({...i, unit: 'Unidad', description: ''})), transport: 'Transportes Chile', driver: 'Juan Pérez', plate: 'AB-CD-12', settings };
        break;
      default:
        sample = { id: 'preview', number: 'B-000001', type: 'boleta', date: new Date().toISOString().split('T')[0], company: baseCompany, customer: baseCustomer, items: baseItems, subtotal, tax_amount: tax, total, settings };
    }

    generators[activeType](sample as any).then((pdf: any) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(pdf.output('blob'));
      setPdfUrl(objectUrl);
    }).catch(() => {
      if (!cancelled) setPdfUrl(null);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [settings, activeType]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1" role="tablist">
        {PREVIEW_TYPES.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeType === t.id}
            onClick={() => setActiveType(t.id as typeof activeType)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeType === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-slate-100 rounded-lg overflow-hidden h-[520px]">
        {pdfUrl ? (
          <iframe src={pdfUrl} title={`Vista previa ${activeType}`} className="w-full h-full border-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-slate-200 h-6 w-40 rounded" />
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 text-center">Vista previa en vivo de {activeType === 'boleta' ? 'Boleta' : activeType === 'factura' ? 'Factura' : activeType === 'cotizacion' ? 'Cotización' : activeType === 'orden_venta' ? 'Orden de Venta' : activeType === 'orden_compra' ? 'Orden de Compra' : 'Guía de Despacho'} de ejemplo
      </p>
    </div>
  );
}