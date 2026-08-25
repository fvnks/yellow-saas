'use client';

import { useEffect, useState } from 'react';
import { Upload, Eye, Save, Palette, FileText, Hash, Type, LayoutTemplate, Check, Sparkles, Zap, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentSettings } from '@/lib/use-document-settings';
import {
  DOCUMENT_TEMPLATES, CURRENCIES, LANGUAGES,
  type DocumentSettings,
} from '@/lib/document-settings';
import { generateBoletaPDF, generateCotizacionPDF, generateOrdenVentaPDF, generateOrdenCompraPDF, generateDeliveryGuidePDF, DocumentData, type DocumentItem, type DeliveryGuideData, type ReturnNoteData } from '@/lib/pdf-design';

const STYLE: { input: string; select: string; toggle: string } = {
  input: 'w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all duration-200 hover:border-border',
  select: 'w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all duration-200 hover:border-border appearance-none cursor-pointer',
  toggle: 'w-12 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner',
};

const COLOR_PRESETS = [
  { name: 'Slate', primary: '#1e293b', accent: '#4f46e5' },
  { name: 'Indigo', primary: '#312e81', accent: '#6366f1' },
  { name: 'Emerald', primary: '#064e3b', accent: '#10b981' },
  { name: 'Amber', primary: '#78350f', accent: '#f59e0b' },
  { name: 'Rose', primary: '#881337', accent: '#f43f5e' },
  { name: 'Cyan', primary: '#164e63', accent: '#06b6d4' },
];

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
      <div className="lg:col-span-2 space-y-5">
        {loading ? (
          <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
            <div className="animate-pulse bg-muted h-6 w-48 rounded-xl mx-auto" />
          </div>
        ) : (
          <>
            {/* Template Selection */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <LayoutTemplate className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Plantilla</h3>
                  <p className="text-xs text-muted-foreground">Estilo visual del documento</p>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {DOCUMENT_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => update({ template_id: t.id })}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        settings.template_id === t.id
                          ? 'border-primary bg-blue-50 shadow-md scale-[1.02]'
                          : 'border-border hover:border-border hover:bg-muted'
                      }`}
                    >
                      {settings.template_id === t.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`w-12 h-16 rounded-lg mb-2 flex items-center justify-center ${
                        t.id === 'classic' ? 'bg-muted border border-border' :
                        t.id === 'minimal' ? 'bg-card border border-border' :
                        'bg-gradient-to-br from-primary to-primary'
                      }`}>
                        {t.id === 'classic' && <FileText className="w-6 h-6 text-foreground" />}
                        {t.id === 'minimal' && <Minus className="w-6 h-6 text-muted-foreground" />}
                        {t.id === 'bold' && <Zap className="w-6 h-6 text-white" />}
                      </div>
                      <span className="text-xs font-semibold text-foreground">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Colores</h3>
                  <p className="text-xs text-muted-foreground">Personaliza la paleta</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Color Presets */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2.5">Paletas predefinidas</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => update({ primary_color: preset.primary, accent_color: preset.accent })}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                          settings.primary_color === preset.primary && settings.accent_color === preset.accent
                            ? 'border-primary bg-blue-50 shadow-sm'
                            : 'border-border hover:border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex -space-x-1">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.primary }} />
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <span className="text-xs font-medium text-foreground">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <ColorField label="Color Principal" value={settings.primary_color} onChange={v => update({ primary_color: v })} />
                  <ColorField label="Color Acento" value={settings.accent_color} onChange={v => update({ accent_color: v })} />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                  <ToggleRow label="Logo" sublabel="Mostrar en documentos" checked={settings.show_logo} onChange={v => update({ show_logo: v })} />
                  <ToggleRow label="Código QR" sublabel="Para verificación" checked={settings.show_qr} onChange={v => update({ show_qr: v })} />
                </div>
              </div>
            </div>

            {/* Localization */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Localización</h3>
                  <p className="text-xs text-muted-foreground">Idioma y moneda</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-foreground">Idioma</label>
                    <div className="relative">
                      <select value={settings.language} onChange={e => update({ language: e.target.value as DocumentSettings['language'] })} className={STYLE.select}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-foreground">Moneda</label>
                    <div className="relative">
                      <select value={settings.currency} onChange={e => update({ currency: e.target.value as DocumentSettings['currency'] })} className={STYLE.select}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">Etiqueta de impuesto</label>
                  <input type="text" value={settings.tax_label} onChange={e => update({ tax_label: e.target.value })} className={STYLE.input} placeholder="IVA (19%)" />
                </div>
              </div>
            </div>

            {/* Texts */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Type className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Textos</h3>
                  <p className="text-xs text-muted-foreground">Encabezado, pie y notas</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">Texto de encabezado</label>
                  <input type="text" value={settings.header_text} onChange={e => update({ header_text: e.target.value })} className={STYLE.input} placeholder="Texto opcional bajo los datos de la empresa" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">Texto de pie</label>
                  <input type="text" value={settings.footer_text} onChange={e => update({ footer_text: e.target.value })} className={STYLE.input} placeholder="Documento generado por Yellow ERP" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">Notas predeterminadas</label>
                  <textarea value={settings.default_notes} onChange={e => update({ default_notes: e.target.value })} rows={3} className={`${STYLE.input} resize-none`} placeholder="Notas que aparecerán por defecto en cada documento" />
                </div>
              </div>
            </div>

            {/* Document Titles */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Títulos de documento</h3>
                  <p className="text-xs text-muted-foreground">Nombres personalizados</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 gap-3">
                  {(['boleta', 'factura', 'cotizacion', 'orden_venta', 'orden_compra'] as const).map(key => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-xs font-medium text-foreground w-24 capitalize">{key.replace('_', ' ')}</label>
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
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-20">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Eye className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Vista previa</h3>
                <p className="text-xs text-muted-foreground">En tiempo real</p>
              </div>
            </div>
            {savingStatus === 'saved' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Guardado
              </div>
            )}
          </div>
          <div className="p-6">
            <DocumentPreview settings={settings} />
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end">
            <button
              onClick={handleSave}
              disabled={savingStatus === 'saving'}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/25 active:scale-[0.98]"
            >
              {savingStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar configuración
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-xl border-2 border-border bg-card cursor-pointer hover:border-border transition-colors shadow-sm" />
          <div className="absolute inset-0 rounded-xl ring-2 ring-black/5 pointer-events-none" />
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-border" />
      </div>
    </div>
  );
}

function ToggleRow({ label, sublabel, checked, onChange }: { label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-xl hover:bg-muted transition-colors">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
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
    { id: 'boleta', label: 'Boleta', icon: '📄' },
    { id: 'factura', label: 'Factura', icon: '📋' },
    { id: 'cotizacion', label: 'Cotización', icon: '💰' },
    { id: 'orden_venta', label: 'OV', icon: '🛒' },
    { id: 'orden_compra', label: 'OC', icon: '🛍️' },
    { id: 'guia_despacho', label: 'Guía', icon: '🚚' },
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

    const generators: Record<string, (d: any) => Promise<any>> = {
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

    generators[activeType]?.(sample).then((pdf: any) => {
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
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted rounded-xl p-1" role="tablist">
        {PREVIEW_TYPES.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeType === t.id}
            onClick={() => setActiveType(t.id as typeof activeType)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeType === t.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden h-[520px] shadow-inner">
        {pdfUrl ? (
          <iframe src={pdfUrl} title={`Vista previa ${activeType}`} className="w-full h-full border-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-card/80 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="animate-pulse bg-card/60 h-4 w-32 rounded-lg" />
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Vista previa de <span className="font-medium text-foreground">
          {activeType === 'boleta' ? 'Boleta' : activeType === 'factura' ? 'Factura' : activeType === 'cotizacion' ? 'Cotización' : activeType === 'orden_venta' ? 'Orden de Venta' : activeType === 'orden_compra' ? 'Orden de Compra' : 'Guía de Despacho'}
        </span> de ejemplo
      </p>
    </div>
  );
}
