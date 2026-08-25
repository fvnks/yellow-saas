'use client';

import { useState, useEffect } from 'react';
import { Search, FileMinus, MoreVertical, Download, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePrintDocument } from '@/components/print/use-print';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { type DocumentSettings, mergeSettings, DEFAULT_DOCUMENT_SETTINGS } from '@/lib/document-settings';

interface DebitNote {
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

function generateNdXml(n: DebitNote): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE xmlns="http://www.sii.cl/SiiDte" version="1.0">
  <Documento>
    <Encabezado>
      <IdDoc>
        <TipoDTE>55</TipoDTE>
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

function downloadXml(filename: string, xml: string) {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function PurchaseDebitNotes() {
  const [notes, setNotes] = useState<DebitNote[]>([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const { print } = usePrintDocument();

  useEffect(() => {
    const companyId = getCompanyIdFromToken();
    if (!companyId) return;
    Promise.all([
      fetch(`/api/companies/${companyId}/purchase-debit-notes`).then(r => r.json()).then(d => setNotes(d.data || [])).catch(() => {}),
      fetch(`/api/companies/${companyId}/settings/documents`, {
        headers: { Authorization: `Bearer ${document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1] || ''}` },
      }).then(r => r.json()).then(d => { if (d.success) setSettings(mergeSettings(d.data)); }).catch(() => {}),
    ]);
  }, []);

  const handlePrintDebitNote = (n: DebitNote) => {
    print('debit-note', {
      id: n.id,
      number: n.note_number,
      type: 'nota_debito',
      date: n.issue_date,
      status: n.status,
      settings,
      company: { name: 'Empresa' },
      supplier: { name: n.supplier_name, tax_id: n.supplier_tax_id },
      items: [],
      subtotal: 0,
      tax_amount: 0,
      total: n.total_amount,
      notes: '',
      reason: n.reason,
    } as any);
  };

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
          <FileMinus className="w-4 h-4 text-amber-500" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Notas de Débito Recibidas</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase">Total ND</p>
          <p className="text-sm font-bold text-amber-600">${total.toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="search" placeholder="Buscar por N° ND, proveedor o RUT..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">N° ND</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">RUT</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Motivo</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(n => {
              const st = STATUS_CFG[n.status] || STATUS_CFG.pending;
              return (
                <tr key={n.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-foreground font-mono">{n.note_number}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{n.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{n.supplier_tax_id}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{n.issue_date}</td>
                  <td className="px-4 py-3 text-xs text-foreground max-w-xs truncate">{n.reason}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-amber-600 font-mono">${Number(n.total_amount || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.color} border ${st.border}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => handlePrintDebitNote(n)}>
                          <Printer className="w-4 h-4 mr-2 text-muted-foreground" />
                          Vista previa PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadXml(`${n.note_number}.xml`, generateNdXml(n))}>
                          <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                          Descargar XML
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-xs text-muted-foreground">No se encontraron notas de débito</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
