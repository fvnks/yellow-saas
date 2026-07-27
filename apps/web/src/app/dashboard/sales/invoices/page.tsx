'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Trash2, Receipt, FileText } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Badge } from '@yellow-erp/ui';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  paid: { label: 'Pagada', variant: 'success' },
  partial: { label: 'Pago Parcial', variant: 'info' },
  overdue: { label: 'Vencida', variant: 'danger' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
};

const docTypeLabels: Record<string, string> = {
  factura: 'Factura',
  boleta: 'Boleta',
};

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 15;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { page: String(page), limit: String(ITEMS_PER_PAGE) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.getInvoices(params);
      setInvoices(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch { setInvoices([]); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    try {
      const api = getApiClient();
      await api.deleteInvoice(id);
      loadData();
    } catch { alert('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Documentos de Venta</h1>
          <p className="text-sm text-slate-500 mt-1">Facturas, boletas y documentos de venta</p>
        </div>
        <Link href="/dashboard/sales/invoices/new">
          <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Documento
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
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagada</option>
            <option value="partial">Pago Parcial</option>
            <option value="overdue">Vencida</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Documento</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No hay documentos de venta</td></tr>
              ) : invoices.map(inv => {
                const st = statusConfig[inv.status] || { label: inv.status, variant: 'neutral' as const };
                return (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{inv.invoice_number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${inv.document_type === 'boleta' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
                        {docTypeLabels[inv.document_type] || inv.document_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{inv.customer?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-900 text-right font-medium">${(inv.total_amount || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(inv.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/sales/invoices/${inv.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
