'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Download, Calendar, DollarSign, FileText, Send, Eye, CheckCircle2, XCircle, Clock, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface PurchaseRegister {
  id: string;
  razon_social: string;
  rut: string | null;
  invoice_number: string;
  emission_date: string;
  status: string;
  amount: number;
  area: string;
  payment_type: string;
  payment_date: string | null;
  notes: string | null;
}

const SII_DOC_TYPES = [
  { code: '30', label: 'Factura de Compra', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { code: '34', label: 'Factura Exenta', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { code: '45', label: 'Nota de Crédito', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { code: '55', label: 'Nota de Débito', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { code: '61', label: 'Factura de Compra (Exenta)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
];

const SII_STATUSES = [
  { key: 'draft', label: 'Borrador', icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' },
  { key: 'generated', label: 'XML Generado', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100' },
  { key: 'submitted', label: 'Enviado al SII', icon: Send, color: 'text-amber-500', bg: 'bg-amber-100' },
  { key: 'accepted', label: 'Aceptado', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { key: 'rejected', label: 'Rechazado', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pagada: { label: 'Pagada', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  no_pagada: { label: 'No Pagada', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

export default function PurchaseBookPage() {
  const [records, setRecords] = useState<PurchaseRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [siiStatus, setSiiStatus] = useState('draft');
  const [showXmlPreview, setShowXmlPreview] = useState(false);
  const [docTypes, setDocTypes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { fetchRecords(); }, [search, dateFrom, dateTo]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (search) params.search = search;
      const data = await api.getPurchaseRegisters(params);
      let filtered = data.data || [];
      if (dateFrom) filtered = filtered.filter((r: PurchaseRegister) => r.emission_date >= dateFrom);
      if (dateTo) filtered = filtered.filter((r: PurchaseRegister) => r.emission_date <= dateTo);
      setRecords(filtered);
    } catch { setRecords([]); }
    setLoading(false);
  };

  const assignDocType = (recordId: string, docType: string) => {
    setDocTypes(prev => ({ ...prev, [recordId]: docType }));
  };

  const calculateIVA = (amount: number, docType: string) => {
    if (docType === '34' || docType === '61') return { neto: amount, iva: 0, total: amount };
    const neto = Math.round(amount / 1.19);
    const iva = amount - neto;
    return { neto, iva, total: amount };
  };

  const totals = records.reduce((acc, r) => {
    const docType = docTypes[r.id] || '30';
    const { neto, iva, total } = calculateIVA(Number(r.amount) || 0, docType);
    return { neto: acc.neto + neto, iva: acc.iva + iva, total: acc.total + total };
  }, { neto: 0, iva: 0, total: 0 });

  const generateXml = () => {
    const items = records.map(r => {
      const docType = docTypes[r.id] || '30';
      const { neto, iva } = calculateIVA(Number(r.amount) || 0, docType);
      return `
      <DTE>
        <TipoDTE>${docType}</TipoDTE>
        <Folio>${r.invoice_number}</Folio>
        <FechaDocto>${r.emission_date}</FechaDocto>
        <RUTProveedor>${r.rut || '00000000-0'}</RUTProveedor>
        <RazonSocialProveedor>${r.razon_social}</RazonSocialProveedor>
        <MontoNeto>${neto}</MontoNeto>
        <IVA>${iva}</IVA>
        <MontoTotal>${Number(r.amount)}</MontoTotal>
        <Estado>${r.status === 'pagada' ? 'P' : 'O'}</Estado>
      </DTE>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<LibroCompras xmlns="http://www.sii.cl/SiiDte" version="1.0">
  <Caratula>
    <RutEmisor>${company?.tax_id || '76.000.000-0'}</RutEmisor>
    <Periodo>${selectedPeriod}</Periodo>
    <FechaGeneracion>${new Date().toISOString().split('T')[0]}</FechaGeneracion>
    <CantidadDocumentos>${records.length}</CantidadDocumentos>
    <MontoNeto>${totals.neto}</MontoNeto>
    <IVA>${totals.iva}</IVA>
    <MontoTotal>${totals.total}</MontoTotal>
  </Caratula>
  <Documentos>${items}
  </Documentos>
</LibroCompras>`;
  };

  const handleGenerateXml = () => {
    setSiiStatus('generated');
    toast.success('XML generado correctamente');
  };

  const handleSubmitToSii = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSiiStatus('submitted');
    toast.info('Enviado al SII');
    setTimeout(() => {
      setSiiStatus('accepted');
      toast.success('Documento aceptado por el SII');
    }, 3000);
    setSubmitting(false);
  };

  const handleReset = () => {
    setSiiStatus('draft');
    setDocTypes({});
  };

  const [company, setCompany] = useState<any>(null);
  useEffect(() => {
    const api = getApiClient();
    api.getCompany().then(setCompany).catch(() => {});
  }, []);

  const currentStatus = SII_STATUSES.find(s => s.key === siiStatus) || SII_STATUSES[0];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Libro de Compras</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Registro de documentos de compra para declaración al SII</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              return <option key={val} value={val}>{d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</option>;
            })}
          </select>
        </div>
      </div>

      {/* SII Status Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Estado de Declaración SII</h3>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStatus.bg}`}>
            <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />
            <span className={`text-xs font-semibold ${currentStatus.color}`}>{currentStatus.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {SII_STATUSES.map((status, i) => {
            const Icon = status.icon;
            const isActive = SII_STATUSES.findIndex(s => s.key === siiStatus) >= i;
            return (
              <div key={status.key} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? status.bg : 'bg-muted'} transition-colors`}>
                  <Icon className={`w-4 h-4 ${isActive ? status.color : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{status.label}</span>
                {i < SII_STATUSES.length - 1 && <div className={`h-0.5 flex-1 rounded ${isActive ? 'bg-indigo-200' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* KPIs with IVA */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto Neto</p>
          <p className="text-2xl font-bold text-foreground mt-1">${totals.neto.toLocaleString('es-CL')}</p>
          <p className="text-xs text-muted-foreground mt-1">{records.length} documentos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">IVA (19%)</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">${totals.iva.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Compras</p>
          <p className="text-2xl font-bold text-foreground mt-1">${totals.total.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Período</p>
          <p className="text-lg font-bold text-foreground mt-2">{selectedPeriod}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por proveedor, RUT o número..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
            <span className="text-muted-foreground text-xs">a</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Table with SII columns */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Documentos del Período</h3>
          <p className="text-xs text-muted-foreground">Asigna el tipo de documento SII a cada registro</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">RUT</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">N° Documento</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo SII</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Neto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">IVA</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay registros en el libro de compras</td></tr>
              ) : records.map(r => {
                const docType = docTypes[r.id] || '30';
                const siiDoc = SII_DOC_TYPES.find(d => d.code === docType);
                const { neto, iva, total } = calculateIVA(Number(r.amount) || 0, docType);
                const st = statusLabels[r.status] || { label: r.status, color: 'bg-muted text-slate-600 border border-border' };
                return (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs text-foreground">{r.emission_date || '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{r.razon_social}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{r.rut || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground font-mono">{r.invoice_number}</td>
                    <td className="px-4 py-3">
                      <select value={docType} onChange={e => assignDocType(r.id, e.target.value)}
                        className="bg-muted border border-border rounded px-2 py-1 text-[10px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
                        {SII_DOC_TYPES.map(d => (
                          <option key={d.code} value={d.code}>{d.code} - {d.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 text-right font-mono">${neto.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-indigo-600 text-right font-mono">${iva.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground text-right font-mono">${total.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.color}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-muted">
                  <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-foreground">Totales</td>
                  <td className="px-4 py-3 text-xs font-bold text-foreground text-right font-mono">${totals.neto.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs font-bold text-indigo-600 text-right font-mono">${totals.iva.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs font-bold text-foreground text-right font-mono">${totals.total.toLocaleString('es-CL')}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <button onClick={handleReset} className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" /> Reiniciar
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowXmlPreview(true)} disabled={records.length === 0}
            className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Eye className="w-4 h-4" /> Ver XML
          </button>
          {siiStatus === 'draft' && (
            <button onClick={handleGenerateXml} disabled={records.length === 0}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50">
              <FileText className="w-4 h-4" /> Generar XML
            </button>
          )}
          {siiStatus === 'generated' && (
            <button onClick={handleSubmitToSii} disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" /> {submitting ? 'Enviando...' : 'Enviar al SII'}
            </button>
          )}
          {(siiStatus === 'accepted' || siiStatus === 'rejected') && (
            <button onClick={handleReset}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" /> Nuevo Período
            </button>
          )}
        </div>
      </div>

      {/* XML Preview Modal */}
      {showXmlPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowXmlPreview(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Vista Previa XML - Libro de Compras</h2>
              <button onClick={() => setShowXmlPreview(false)} className="text-muted-foreground hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <pre className="bg-primary text-emerald-400 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {generateXml()}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowXmlPreview(false)} className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium">
                Cerrar
              </button>
              <button onClick={() => { navigator.clipboard.writeText(generateXml()); toast.success('XML copiado al portapapeles'); }}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Copiar XML
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration notice */}
      <div className="bg-muted border border-border rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Integración SII Pendiente</p>
          <p className="text-xs text-muted-foreground mt-1">
            La conexión con el Servicio de Impuestos Internos requiere certificado digital y token de autenticación.
            Actualmente el flujo opera en modo local hasta completar la configuración con el SII.
          </p>
        </div>
      </div>
    </div>
  );
}
