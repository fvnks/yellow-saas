'use client';

import { useState } from 'react';
import { Search, ReceiptText, Zap } from 'lucide-react';

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
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-xs text-slate-400">No se encontraron notas de crédito</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Modo Demo SII</span> — Estos documentos son una simulación de datos recibidos del Servicio de Impuestos Internos. La integración real requiere certificado digital y API del SII.
        </p>
      </div>
    </div>
  );
}
