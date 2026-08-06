'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Trash2, Truck, ArrowLeft, FileText } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Badge } from '@yellow-erp/ui';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  in_transit: { label: 'En Tránsito', variant: 'info' },
  delivered: { label: 'Entregado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const transportLabels: Record<string, string> = {
  chilexpress: 'Chilexpress',
  starken: 'Starken',
  correo: 'Correo de Chile',
};

export default function DeliveryGuidesListPage() {
  const [guides, setGuides] = useState<any[]>([]);
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
      const data = await api.getDeliveryGuides(params);
      setGuides(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch { setGuides([]); }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta guía de despacho?')) return;
    try {
      const api = getApiClient();
      await api.deleteDeliveryGuide(id);
      loadData();
    } catch { alert('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Guías de Despacho</h1>
          <p className="text-sm text-muted-foreground mt-1">Documentos de despacho y envío de mercadería</p>
        </div>
        <Link href="/dashboard/sales/delivery-guides/new">
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nueva Guía
          </button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por número de guía..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="in_transit">En Tránsito</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">N° Guía</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Orden Ref.</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Transportista</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : guides.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay guías de despacho</td></tr>
              ) : guides.map(g => {
                const st = statusConfig[g.status] || { label: g.status, variant: 'neutral' as const };
                return (
                  <tr key={g.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">{g.guide_number}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{g.sales_order?.order_number || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{g.warehouse?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{transportLabels[g.transport] || g.transport || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(g.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/sales/delivery-guides/${g.id}`}>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={() => handleDelete(g.id)} className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {total > ITEMS_PER_PAGE && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <p>Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} de {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * ITEMS_PER_PAGE >= total} className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
