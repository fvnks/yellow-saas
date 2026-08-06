'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Eye, Trash2, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'bg-muted text-foreground', icon: Clock },
  posted: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  reversed: { label: 'Revertido', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => { loadEntries(); }, [page, statusFilter]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.getJournalEntries(params);
      setEntries(res.data || []);
      setPagination(res.pagination || { total: 0, totalPages: 0 });
    } catch (err) { toast.error('Error al cargar asientos contables'); }
    setLoading(false);
  };

  const handleSearch = () => { setPage(1); loadEntries(); };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este asiento contable?')) return;
    try {
      const api = getApiClient();
      await api.deleteJournalEntry(id);
      loadEntries();
    } catch (err: any) {
      toast.error('Error al eliminar');
    }
  };

  const handlePost = async (id: string) => {
    if (!confirm('Publicar este asiento? Se aplicaran los saldos.')) return;
    try {
      const api = getApiClient();
      await api.updateJournalEntry(id, { status: 'posted' });
      loadEntries();
    } catch (err: any) {
      toast.error('Error al publicar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accounting" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Asientos Contables</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro contable de operaciones financieras</p>
        </div>
        <Link href="/dashboard/accounting/journal-entries/new">
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Asiento
          </button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por numero o descripcion..."
              className="w-full bg-muted border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="posted">Publicado</option>
            <option value="reversed">Revertido</option>
          </select>
          <button onClick={handleSearch}
            className="bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" /> Buscar
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Numero</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descripcion</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Debito</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Credito</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Lineas</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No hay asientos contables</p>
                  <Link href="/dashboard/accounting/journal-entries/new" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">Crear primer asiento</Link>
                </td></tr>
              ) : entries.map(entry => {
                const st = statusConfig[entry.status] || statusConfig.draft;
                const StatusIcon = st.icon;
                return (
                  <tr key={entry.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground">{entry.entry_number}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{new Date(entry.date).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-foreground max-w-xs truncate">{entry.description}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-foreground">${Number(entry.total_debit).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-foreground">${Number(entry.total_credit).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.color}`}>
                        <StatusIcon className="w-3 h-3" /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center text-muted-foreground">{entry.lines?.length || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/accounting/journal-entries/${entry.id}`}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                        {entry.status === 'draft' && (
                          <>
                            <button onClick={() => handlePost(entry.id)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[9px] font-semibold hover:bg-emerald-100 transition-colors">
                              Publicar
                            </button>
                            <button onClick={() => handleDelete(entry.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>Mostrando {(page - 1) * 20 + 1}-{Math.min(page * 20, pagination.total)} de {pagination.total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button>
            <span className="text-muted-foreground">Pagina {page} de {pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
