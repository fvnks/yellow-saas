'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Badge } from '@yellow-erp/ui';

interface SalesQuotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  quote_date: string;
  valid_until: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  sent: { label: 'Enviada', variant: 'info' },
  accepted: { label: 'Aceptada', variant: 'success' },
  rejected: { label: 'Rechazada', variant: 'danger' },
  expired: { label: 'Vencida', variant: 'warning' },
};

export default function SalesQuotationsPage() {
  const [quotations, setQuotations] = useState<SalesQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { page: String(page), limit: String(ITEMS_PER_PAGE) };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.getSalesQuotations(params);
      setQuotations(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch { setQuotations([]); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cotización?')) return;
    try {
      const api = getApiClient();
      await api.deleteSalesQuotation(id);
      loadData();
    } catch { alert('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cotizaciones de Venta</h1>
          <p className="text-sm text-slate-500 mt-1">{total} cotizaciones</p>
        </div>
        <Link href="/dashboard/sales/quotations/new">
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nueva Cotización
          </button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por número o cliente..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="accepted">Aceptada</option>
            <option value="rejected">Rechazada</option>
            <option value="expired">Vencida</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Cotización</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Válido Hasta</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No hay cotizaciones</td></tr>
              ) : quotations.map(q => {
                const st = statusConfig[q.status] || { label: q.status, variant: 'neutral' as const };
                return (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{q.quotation_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{q.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{q.quote_date || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{q.valid_until || '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900 text-right">${Number(q.total_amount || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/sales/quotations/${q.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {total > ITEMS_PER_PAGE && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} de {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * ITEMS_PER_PAGE >= total} className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
