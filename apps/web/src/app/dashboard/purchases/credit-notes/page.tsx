'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Plus, Download, Filter } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface CreditNote {
  id: string;
  supplier_name: string;
  supplier_tax_id: string;
  note_number: string;
  issue_date: string;
  total_amount: number;
  reason: string | null;
  notes: string | null;
  created_at: string;
}

export default function PurchaseCreditNotesPage() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchNotes(); }, [search]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (search) params.search = search;
      const data = await api.getPurchaseCreditNotes(params);
      setNotes(data.data || []);
    } catch { setNotes([]); }
    setLoading(false);
  };

  const totalAmount = notes.reduce((sum, n) => sum + (Number(n.total_amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notas de Crédito de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Documentos de crédito recibidos de proveedores</p>
        </div>
        <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva NC
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Notas de Crédito</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${totalAmount.toLocaleString('es-CL')}</p>
          <p className="text-xs text-slate-500 mt-1">{notes.length} documentos</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Promedio</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">${notes.length > 0 ? Math.round(totalAmount / notes.length).toLocaleString('es-CL') : '0'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Este Mes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${notes.filter(n => {
            const d = new Date(n.issue_date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).reduce((sum, n) => sum + (Number(n.total_amount) || 0), 0).toLocaleString('es-CL')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por proveedor, número o razón..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Nota</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Razón</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : notes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No hay notas de crédito registradas</td></tr>
              ) : notes.map(n => (
                <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-700">{n.issue_date || '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{n.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{n.supplier_tax_id || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-700 font-mono">{n.note_number}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{n.reason || '—'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-emerald-600 text-right font-mono">${Number(n.total_amount || 0).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
            {notes.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-slate-900">Total</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-900 text-right font-mono">${totalAmount.toLocaleString('es-CL')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
