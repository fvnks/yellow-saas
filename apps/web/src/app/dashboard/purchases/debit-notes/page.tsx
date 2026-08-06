'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Plus, Download, Filter } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface DebitNote {
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

export default function PurchaseDebitNotesPage() {
  const [notes, setNotes] = useState<DebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchNotes(); }, [search]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (search) params.search = search;
      const data = await api.getPurchaseDebitNotes(params);
      setNotes(data.data || []);
    } catch { setNotes([]); }
    setLoading(false);
  };

  const totalAmount = notes.reduce((sum, n) => sum + (Number(n.total_amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notas de Débito de Compra</h1>
          <p className="text-sm text-muted-foreground mt-1">Documentos de débito recibidos de proveedores</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva ND
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Notas de Débito</p>
          <p className="text-2xl font-bold text-foreground mt-1">${totalAmount.toLocaleString('es-CL')}</p>
          <p className="text-xs text-muted-foreground mt-1">{notes.length} documentos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Promedio</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">${notes.length > 0 ? Math.round(totalAmount / notes.length).toLocaleString('es-CL') : '0'}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Este Mes</p>
          <p className="text-2xl font-bold text-foreground mt-1">${notes.filter(n => {
            const d = new Date(n.issue_date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).reduce((sum, n) => sum + (Number(n.total_amount) || 0), 0).toLocaleString('es-CL')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por proveedor, número o razón..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">RUT</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">N° Nota</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Razón</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : notes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay notas de débito registradas</td></tr>
              ) : notes.map(n => (
                <tr key={n.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs text-foreground">{n.issue_date || '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{n.supplier_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{n.supplier_tax_id || '—'}</td>
                  <td className="px-4 py-3 text-xs text-foreground font-mono">{n.note_number}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{n.reason || '—'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-amber-600 text-right font-mono">${Number(n.total_amount || 0).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
            {notes.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-muted">
                  <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-foreground">Total</td>
                  <td className="px-4 py-3 text-xs font-bold text-foreground text-right font-mono">${totalAmount.toLocaleString('es-CL')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
