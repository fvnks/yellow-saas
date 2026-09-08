'use client';

import { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  sent: { label: 'Enviado', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Send },
  accepted: { label: 'Aceptado SII', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rechazado SII', class: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

export default function DTEPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const companyId = typeof window !== 'undefined' 
    ? (() => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (!authCookie) return null;
        try {
          const base64 = authCookie.split('=')[1].split('.')[1];
          const decoded = decodeURIComponent(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
          return JSON.parse(decoded).company_id;
        } catch { return null; }
      })()
    : null;

  useEffect(() => {
    fetchDTEs();
  }, [companyId]);

  async function fetchDTEs() {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/companies/${companyId}/sii/documents?limit=50`);
      const json = await res.json();
      if (json.success) setInvoices(json.data.data || []);
    } catch (e) {
      toast.error('Error al cargar DTEs');
    } finally {
      setLoading(false);
    }
  }

  async function sendDTE(id: string) {
    setSending(id);
    try {
      const res = await fetch(`/api/companies/${companyId}/sii/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('DTE enviado al SII correctamente');
        fetchDTEs();
      } else {
        toast.error(json.error?.message || 'Error al enviar DTE');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSending(null);
    }
  }

  async function generateXML(id: string) {
    try {
      const res = await fetch(`/api/companies/${companyId}/sii/dte?document_id=${id}`);
      const json = await res.json();
      if (json.success && json.data?.xml) {
        const blob = new Blob([json.data.xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DTE_${json.data.type}_${json.data.folio}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('XML generado correctamente');
      }
    } catch {
      toast.error('Error al generar XML');
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Documentos Tributarios Electrónicos (DTE)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Gestión y seguimiento de Facturas, Notas de Débito/Crédito y Guías de Despacho ante el SII
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDTEs}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
            <Link
              href="/dashboard/settings"
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              Configurar SII
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = invoices.filter((i: any) => i.sii_status === key).length;
          const Icon = config.icon;
          return (
            <div key={key} className={`border rounded-2xl p-4 ${config.class}`}>
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5" />
                <span className="text-2xl font-black">{count}</span>
              </div>
              <p className="text-xs font-bold mt-1">{config.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80">
          <input
            type="text"
            placeholder="Buscar por folio, cliente..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Cargando DTEs...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p>No hay documentos DTE registrados</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Folio</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3">Estado SII</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv: any) => {
                const status = STATUS_CONFIG[inv.sii_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg">{inv.type}</span>
                    </td>
                    <td className="px-6 py-4 font-bold">{inv.folio}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{inv.buyer_name}</div>
                      <div className="text-slate-500">{inv.buyer_rut}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(inv.fecha_emision).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      {clp(inv.monto_total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => generateXML(inv.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Descargar XML"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        {inv.sii_status === 'pending' && (
                          <button
                            onClick={() => sendDTE(inv.id)}
                            disabled={sending === inv.id}
                            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
                          >
                            {sending === inv.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Enviar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
